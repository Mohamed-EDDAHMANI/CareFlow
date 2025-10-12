// src/app.js
import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.js";
import { connectDB } from "../config/db.js";
import morgan from "morgan";
import fs from 'fs';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();
import redisClient from './config/redis.js';
import { initRedis } from './config/redis.js';



// insertion if the db empty
import initDB from "./seeders/initDB.js";

// ===== Import Routes =====
import routes from "./routes/index.js";

// ===== Initialize App =====
const app = express();
const PORT = process.env.PORT || 3000;

// ===== Middleware =====
app.use(express.json());// pour accept application/json type
app.use(express.urlencoded({ extended: true }));// pour accept application/x-www-form-urlencoded 
app.use(cors());
app.use(cookieParser());


// ===== Morgan config =====
// ( print all request / like a file )
app.use(morgan('dev'));
app.use(morgan('combined', { stream: fs.createWriteStream('./access.log', { flags: 'a' }) }));

// ===== if i will chose print the logis en a file 
// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
// app.use(morgan('combined', { stream: accessLogStream }));

// ===== Health Check =====
app.get("/health", (req, res) => res.status(200).send("OK"));
app.get("/", (req, res) => res.send("Server is running 🚀"));

// ===== API Routes =====
app.use('/api', routes);


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
connectDB()
  .then(async () => {

    await initRedis();

    // insertion of db
    await initDB();

    app.listen(PORT, () =>
      console.log(`✅ Server running on port ${PORT}`)
    );
    
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  });

export default app;

