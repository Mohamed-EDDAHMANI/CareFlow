Types de corps de requêtes (Request Body) en Express.js

1. JSON (application/json)
   → Format le plus utilisé pour les APIs.
   Exemple :
   {
     "name": "Mohamed",
     "email": "mohamed@example.com"
   }
   Express doit utiliser : app.use(express.json())

2. Formulaire classique (application/x-www-form-urlencoded)
   → Utilisé par les formulaires HTML simples (sans fichiers).
   Exemple : name=Mohamed&email=mohamed@example.com
   Express doit utiliser : app.use(express.urlencoded({ extended: true }))

3. Formulaire avec fichiers (multipart/form-data)
   → Utilisé pour l’envoi de fichiers (images, pdf, etc.).
   Nécessite la bibliothèque 'multer'.
   Exemple :
   app.post('/upload', upload.single('image'), ...)

4. Texte brut (text/plain)
   → Le corps contient seulement du texte.
   Exemple : "Bonjour serveur"
   Express doit utiliser : app.use(express.text())

5. Autres (optionnels)
   - application/xml → pour XML
   - application/pdf → pour PDF
   - application/octet-stream → données binaires

Résumé :
Pour gérer tous les types →
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
