import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import redisClient from "../config/redis.js";

export const protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError('No token provided. Please login.', 401, 'NO_TOKEN'));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err && err.name === 'TokenExpiredError') {
      return next(new AppError('Access token expired. Use refresh token to obtain a new access token.', 401, 'ACCESS_TOKEN_EXPIRED'));
    }
    return next(new AppError('Invalid token. Please login again.', 401, 'ACCESS_TOKEN_INVALID'));
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('User no longer exists', 401, 'USER_NOT_FOUND'));
  }

  // Check if user is active
  if (user.status !== "active") {
    return next(new AppError('User is suspended', 403, 'USER_SUSPENDED'));
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
    if (!cached) {
      return next(new AppError('Authorization failed', 403, 'AUTHORIZATION_FAILED'));
    }

    const user = JSON.parse(cached);
    const hasPermission = user.permissions && user.permissions[requiredPermission];

    if (!hasPermission) {
      return next(new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN'));
    }

    next();
  });

