import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import redisClient from "../config/redis.js";

export const protect = catchAsync(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError("No token provided", 401));
    }
    const token = authHeader.split(" ")[1];

    let decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
        return next(new AppError("User no longer exists", 401));
    }

    // 4️⃣ Check if user is active
    if (user.status !== "active") {
        return next(new AppError("User is suspended", 403));
    }

    // Attach user to request
    req.user = user;

    next();
});


export const authorize = (requiredPermission) =>
  catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    if (!requiredPermission) {
      return next();
    }

    const cached = await redisClient.get(`user:${userId}`);
    console.log(userId)
    if (!cached) {
      return res.status(403).json({ message: 'Authorization failed !!' });
    }

    const user = JSON.parse(cached);
    const hasPermission = user.permissions[requiredPermission];

    if (!hasPermission) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }

    next();
  });

