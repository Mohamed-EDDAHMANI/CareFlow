
📘 **Comprendre la gestion des erreurs (Error Handling) dans Express.js avec la classe AppError**

---

### 🔹 1. Introduction

Dans Express.js, la **gestion des erreurs** est un mécanisme central qui permet de capturer, traiter et répondre correctement lorsqu’une erreur survient dans une application.
Express suit un flux logique précis pour traiter les requêtes (`req`), les réponses (`res`), et les erreurs (`err`).

---

### 🔹 2. Cycle d’une requête dans Express

Quand une requête arrive :
1. Elle passe par une série de **middlewares** (de gauche à droite, dans l’ordre du code).
2. Chaque middleware peut :
   - Continuer vers le suivant avec `next()` ;
   - Interrompre le flux avec une réponse `res.send()`, `res.json()`, etc. ;
   - OU signaler une erreur avec `next(err)`.

Quand `next(err)` est appelé → Express **ignore tous les middlewares suivants** et saute directement vers le **error-handling middleware** (celui avec 4 paramètres).

---

### 🔹 3. La classe `AppError`

La classe `AppError` permet de créer des **erreurs personnalisées** avec des messages et des statuts HTTP précis.

```js
export default class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // sert à distinguer les erreurs connues
  }
}
```

🧠 **Principe :**
- `super(message)` appelle le constructeur de la classe `Error` native.
- `statusCode` détermine le code de réponse HTTP (ex. 404, 401, 500...).
- `isOperational` est une bonne pratique pour différencier une erreur “prévue” (par ex. “User not found”) d’une erreur système (bug).

---

### 🔹 4. Le middleware de gestion des erreurs

```js
export function errorHandler(err, req, res, next) {
  console.error('🔥 Error:', err);

  let status = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
  }

  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid or expired token';
  }

  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token has expired';
  }

  res.status(status).json({
    success: false,
    error: message,
  });
}
```

🧠 **Rôle :**
Ce middleware est le **dernier** de ton application. Il reçoit toutes les erreurs transmises par `next(err)`.

---

### 🔹 5. Exemple d’utilisation :

#### a) Contrôleur avec `AppError`

```js
import AppError from '../utils/AppError.js';
import User from '../models/User.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return next(new AppError('User not found', 404));

    const valid = await user.comparePassword(password);
    if (!valid) return next(new AppError('Invalid credentials', 401));

    res.json({ success: true, token: 'JWT_TOKEN_EXAMPLE' });
  } catch (err) {
    next(err); // envoie au errorHandler
  }
};
```

#### b) Intégration dans `server.js`

```js
import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// toujours en dernier
app.use(errorHandler);

app.listen(3000, () => console.log('Server running'));
```

---

### 🔹 6. Exemple avec deux middlewares (dual middleware)

```js
import express from 'express';
import AppError from './utils/AppError.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
app.use(express.json());

// Premier middleware : Vérifie l’authentification
function checkAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return next(new AppError('Token is required', 401));
  next();
}

// Deuxième middleware : Vérifie le rôle de l’utilisateur
function checkAdmin(req, res, next) {
  const isAdmin = false; // test
  if (!isAdmin) return next(new AppError('Access denied', 403));
  next();
}

// Route protégée
app.get('/admin', checkAuth, checkAdmin, (req, res) => {
  res.json({ success: true, message: 'Welcome Admin!' });
});

// Middleware global
app.use(errorHandler);

app.listen(3000, () => console.log('🚀 Server running on port 3000'));
```

---

### 🔹 7. Résumé du flux logique

1. **Une requête arrive**
2. Express passe à travers les middlewares
3. Si tout va bien → `res.json()` renvoie la réponse
4. Si une erreur est détectée → `next(new AppError(...))`
5. Express saute directement au `errorHandler`
6. Le middleware formate et renvoie une réponse JSON propre avec le bon code HTTP

---

### ✅ Exemple de résultat d’erreur JSON :
```json
{
  "success": false,
  "error": "User not found"
}
```

---

### 💡 Avantages :
- Centralisation du traitement d’erreurs
- Messages clairs et cohérents
- Facilité de débogage
- Séparation claire entre la logique métier et la gestion des erreurs
