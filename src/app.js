// src/app.js or src/server.js
import express from "express";
import { errorHandler } from './middlewares/errorHandler.js';
import { connectDB } from "../config/db.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware json
app.use(express.json());

app.get("/health", (req, res) => res.send("OK"));

// Example route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// midd gestion des errors
app.use(errorHandler);


connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});