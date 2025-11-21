import AppError from '../utils/appError.js';
import User from "../models/userModel.js";
import catchAsync from '../utils/catchAsync.js';
import { cacheUser , deleteCache } from '../utils/cacheUser.js';
import { verifyToken, generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import Role from '../models/roleModel.js';

export const register = catchAsync(async (req, res, next) => {
    const { name, email, password, birthDate, status, cin } = req.body;
    // Check if user already exists
    const roleId = await Role.findOne({ name: 'patient' }).select('_id');
    if (!roleId) {
        throw new AppError('Default role not found', 500);
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('Email already in use', 400, 'MESSAGE_ERROR');
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
    const existingUser = await User.findOne({ email }).populate('roleId', 'name');
    if (!existingUser) {
        throw new AppError('Invalid email or password !!', 401 , 'MESSAGE_ERROR');
    }

    // Check password
    const isMatch = await existingUser.matchPassword(password);
    if (!isMatch) {
        console.log(isMatch)
        throw new AppError('Invalid email or password !', 401, 'MESSAGE_ERROR');
    }

    // Generate tokens
    const accessToken = generateAccessToken(existingUser);
    const refreshToken = generateRefreshToken(existingUser);
    existingUser.refreshToken = refreshToken;
    await existingUser.save();

    await cacheUser(existingUser);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    }).status(200).json({
        success: true,
        accessToken,
        user: existingUser,
    });
});

export const logout = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new AppError('Refresh token is required', 400, 'NO_TOKEN');
    }

    // Find user by refresh token
    const existingUser = await User.findOne({ refreshToken });
    if (!existingUser) {
        throw new AppError('Invalid refresh token', 401 , 'TOKEN_INVALID');
    }
    // Invalidate refresh token
    existingUser.refreshToken = null;
    await existingUser.save();

    await deleteCache(existingUser);

    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    });
});

export const refreshAccessToken = catchAsync(async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return next(new AppError('No refresh token provided !!', 401, 'NO_TOKEN'));
    }
    // Find user by refresh token
    const existingUser = await User.findOne({ refreshToken }).populate('roleId' ,'name');

    if (!existingUser) {
        throw new AppError('Invalid refresh token', 401, 'TOKEN_INVALID');
    }
    // verify the refresh token
    const isValid = verifyToken(refreshToken, "refresh");
    if (!isValid) {
        existingUser.refreshToken = null;
        await existingUser.save();
        throw new AppError('Invalid or expired refresh token', 401, 'TOKEN_INVALID');
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(existingUser);
    await cacheUser(existingUser);
    res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        accessToken: newAccessToken,
    });
});
