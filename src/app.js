// src/app.js
import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import { connectDB } from "../config/db.js";
import morgan from "morgan";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();
import { initRedis } from './config/redis.js';
import { s3, initMinio }  from './config/s3Config.js';
import corsMiddleware from './middlewares/cors.js'



// insertion if the db empty
import initDB from "./seeders/initDB.js";


// ===== Import Routes =====
import routes from "./routes/index.js";
import labRouters from "./routes/labRouters.js";
import pharRouters from "./routes/pharRouters.js";
import roleRoutes from "./routes/roleRoutes.js";

// ===== Initialize App =====
const app = express();
const PORT = process.env.PORT || 3000;

// ===== Middleware =====
app.use(express.json());// pour accept application/json type
app.use(express.urlencoded({ extended: true }));// pour accept application/x-www-form-urlencoded 
app.use(cookieParser());

// cors middleware
app.use(corsMiddleware);

// ===== Morgan config =====
// ( print all request / like a file )
app.use(morgan('dev'));

// ===== Health Check =====
app.get("/health", (req, res) => res.status(200).send("OK"));
app.get("/", (req, res) => res.send("CliniqueService API is running 🚀"));

// ===== API Routes =====
app.use('/apiCli', routes);

// ===== API External =====
app.use('/apiLab', labRouters);

app.use('/apiPhar', pharRouters);

// Roles
app.use('/apiCli/roles', roleRoutes);


// ===== 404 Handler =====
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ===== Global Error Handler =====
app.use(errorHandler);

// ===== Start Server =====
const start = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error("❌ CliniqueService Database connection failed:", err.message);
    process.exit(1);
  }

  app.listen(PORT, () =>
    console.log(`✅ CliniqueService Server running on port ${PORT}`)
  );

  // run async initializers (do not block server start)
  (async () => {
    try {
      await initRedis();
      await initDB();
      await initMinio();
      console.log('✅ Background initializers completed');
    } catch (e) {
      console.error('⚠️ Background initializer failed:', e.message);
    }
  })();
};

start();

export default app;

