import AppError from '../utils/appError.js';
import User from "../models/userModel.js";
import catchAsync from '../utils/catchAsync.js';
import { verifyToken, generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import Role from '../models/roleModel.js';

export const register = catchAsync(async (req, res, next) => {
    const { name, email, password, birthDate, status, cin } = req.body;
    // Check if user already exists
    const roleId = await Role.findOne({ name: 'patient' }).select('_id');
    if(!roleId) {
        throw new AppError('Default role not found', 500);
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('Email already in use', 400);
    }

    // Create new user
    const newUser = new User({
        name,
        email,
        password,
        birthDate,
        roleId,
        status,
        cin
    });
    await newUser.save();

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
    });
});

export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        throw new AppError('Invalid email or password !!', 401);
    }

    // Check password
    const isMatch = await existingUser.matchPassword(password);
    if (!isMatch) {
        console.log(isMatch)
        throw new AppError('Invalid email or password !', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken(existingUser);
    const refreshToken = generateRefreshToken(existingUser);
    existingUser.refreshToken = refreshToken;
    await existingUser.save();

    res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        data: {
            accessToken,
            refreshToken
        }
    });
});

export const logout = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new AppError('Refresh token is required', 400);
    }   

    // Find user by refresh token
    const existingUser = await User.findOne({ refreshToken });
    if (!existingUser) {
        throw new AppError('Invalid refresh token', 401);
    }   
    // Invalidate refresh token
    existingUser.refreshToken = null;
    await existingUser.save();
    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    });
});

export const refreshToken = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new AppError('Refresh token is required', 400);
    }
    // Find user by refresh token
    const existingUser = await User.findOne({ refreshToken });
    if (!existingUser) {
        throw new AppError('Invalid refresh token', 401);
    }
    // verify the refresh token
    const isValid = verifyToken(refreshToken, "refresh");
    if (!isValid) {
        existingUser.refreshToken = null;
        await existingUser.save();
        throw new AppError('Invalid or expired refresh token', 401);
    }

    // Generate new tokens
    const newAccessToken = existingUser.generateAccessToken();
    res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
            accessToken: newAccessToken,
        }
    });
});
