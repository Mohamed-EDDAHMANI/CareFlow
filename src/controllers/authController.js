import mongoose from 'mongoose';
import AppError from '../utils/appError.js';
import { userValidation } from '../validations/userValidation.js';

export const register = async (req, res) => {
    const { error } = userValidation.validate(req.body);
    if (error) {
        throw new AppError(error.details[0].message, 400);
    }
    const { name, email, password, birthDate, roleId, status, cin } = req.body;
    // Check if user already exists
    const existingUser = await mongoose.model('User').findOne({ email });
    if (existingUser) {
        throw new AppError('Email already in use', 400);
    }

    // Create new user
    const User = mongoose.model('User');
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

    // Generate tokens
    const accessToken = newUser.generateAuthToken();
    const refreshToken = newUser.generateRefreshToken();
    newUser.refreshToken = refreshToken;
    await newUser.save();

    // Exclude sensitive fields from response
    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: userResponse,
            accessToken
        }
    });
}