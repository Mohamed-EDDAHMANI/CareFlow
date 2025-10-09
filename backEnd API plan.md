# Structure générale dyal project (Docker-ready)

project/
│
├─ src/
│   ├─ config/                      # configurations: db, jwt, redis, env variables
│   │   └─ db.js                    # MongoDB connection with retry logic
│   ├─ controllers/                 # logique pour gérer requests/responses
│   ├─ services/                    # business logic / logique métier
│   ├─ models/                      # Mongoose schemas
│   │   ├─ appointmentModel.js      # Appointment/RDV schema with methods
│   │   ├─ medicalRecordModel.js    # Medical records with actions array
│   │   ├─ notificationModel.js     # Notifications with status/read tracking
│   │   ├─ roleModel.js             # Role management (admin, practitioner, etc.)
│   │   ├─ userModel.js             # User with permissions & JWT methods
│   │   ├─ HolidayModel.js          # System holidays/clinic closure dates
│   │   ├─ WorkingHourModel.js      # Daily working hours configuration
│   │   └─ stucteModels.md          # Models documentation/structure guide
│   ├─ routes/                      # définition des routes et attach controllers
│   │   ├─ authRoutes.js            # Authentication endpoints
│   │   ├─ userRoutes.js            # User management endpoints
│   │   ├─ roleRoutes.js            # Role & permissions endpoints
│   │   ├─ appointmentRoutes.js     # Appointment CRUD endpoints
│   │   ├─ medicalRecordRoutes.js   # Medical records endpoints
│   │   ├─ notificationRoutes.js    # Notification management endpoints
│   │   └─ systemRoutes.js          # System settings (working hours, holidays)
│   ├─ middlewares/                 # auth, validation, error handling, logging
│   │   └─ errorHandler.js          # Global error handling middleware
│   ├─ utils/                       # fonctions utilitaires: email, token, etc
│   │   └─ AppError.js              # Custom error class for operational errors
│   └─ app.js                       # Express app initialization + middleware setup
│
├─ tests/                           # tests unitaires et d'intégration
│
├─ docker/                          # fichiers spécifiques Docker
│   ├─ dockerfile                   # build image Node.js (dev mode)
│   └─ docker-compose.yml           # orchestration: node, mongo, redis services
│
├─ config/                          # root-level configurations
│   └─ db.js                        # MongoDB connection with retry logic
│
├─ documentation/                   # Project documentation
│   ├─ system_roles_structure.md    # Business roles & responsibilities spec
│   ├─ request_types.md             # Express request body types guide
│   └─ Express_custem_ErrorHandling.md # Error handling patterns & examples
│
├─ package.json                     # Dependencies & scripts
├─ .env                            # Environment variables (Docker-ready)
├─ .dockerignore                   # Files to exclude from Docker build
└─ README_MODELS.md                # Models documentation & usage examples

==========================================================================================

Roles / responsabilités par layer

1. Routes
   - Responsibility: Définir endpoints REST (GET /users, POST /auth/login)
   - Bonnes pratiques: Routes juste connectent route à controller. Pas de logique métier ni db ici.

2. Controllers
   - Responsibility: Recevoir la requête, valider via middleware, appeler service, renvoyer réponse
   - Bonnes pratiques: Try/catch pour gérer erreurs, mais pas de logique complexe. Appelle service et renvoie soit data, soit erreur formatée.

3. Services
   - Responsibility: Contient business logic et interaction avec la base (via models)
   - Bonnes pratiques: Service = cœur du backend. Manipule modèles, règles métiers, validation avancée. Retourne objets ou lance exceptions pour erreurs.

4. Models
   - Responsibility: Définition schemas Mongoose
   - Bonnes pratiques: Pas de logique métier complexe ici, juste structures de données.

5. Middlewares
   - Responsibility: Auth, validation, logging, error handling
   - Bonnes pratiques: Middleware centralisé pour capturer toutes les erreurs et renvoyer JSON avec code HTTP et message.

6. Utils
   - Responsibility: Fonctions génériques: envoi mail, génération token, hash, etc
   - Bonnes pratiques: Doivent être réutilisables par services ou controllers.
                                                                           


==========================================================================================
# Flow typique d’une requête (GET/POST/PUT/DELETE)

Exemple: POST /users

1. Route          -> router.post('/users', validateUser, userController.createUser)
2. Middleware     -> validateUser(req.body) // Joi/express-validator
3. Controller     -> userController.createUser(req, res, next)
4. Service        -> userService.createUser(data) -> interaction db via UserModel
5. Model          -> UserModel.create(data)
6. Service        -> retourne result ou throw Error
7. Controller     -> catch error via try/catch -> next(error)
8. Middleware     -> errorHandler(err, req, res) -> renvoie JSON {status, message, data?}
