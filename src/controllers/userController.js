import AppError from '../utils/appError.js';
import mongoose from 'mongoose';
import User from "../models/userModel.js";
import catchAsync from '../utils/catchAsync.js';
import Role from '../models/roleModel.js';

export const createUser = catchAsync(async (req, res, next) => {
    const { name, email, password, birthDate, roleId, status, cin } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('Email already in use', 400);
    }

    const role = await Role.findById(roleId);
    if (!role) {
        throw new AppError('Invalid role ID', 400);
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

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
            userResponse,
        }
    });
})

export const deleteUser = catchAsync(async (req, res, next) => {
    const userId = req.body.userId
    if (!userId) {
        throw new AppError('User Id is required', 400);
    }
    const existingUser = await User.findByIdAndDelete(userId);
    if (!existingUser) {
        throw new AppError('User not found', 400);
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' })
});

export const getUserById = catchAsync(async (req, res, next) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid user ID format', 400);
    }
    const user = await User.findById(id).select("-password -refreshToken")
    if (!user) {
        throw new AppError('User not found', 400);
    }

    res.status(200).json({
        success: true,
        data: {
            user,
        },
    })
});

export const getUsers = catchAsync(async (req, res, next) => {
    const users = await User.find().select("-password -refreshToken")
    res.status(200).json({
        success: true,
        data: {
            users,
        }
    })
});

export const updateUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if(!user){
        throw new AppError('User Not Found', 401);
    }
    user.updateFields(req.body)

    res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: {
            user,
        },
    });

});