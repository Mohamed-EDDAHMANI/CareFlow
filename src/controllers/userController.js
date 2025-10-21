// /controllers/userController.js

import userService from '../services/useService.js';
import catchAsync from '../utils/catchAsync.js';

export const createUser = catchAsync(async (req, res, next) => {
    const newUser = await userService.createUser(req.body);
    
    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUser
    });
});

export const deleteUser = catchAsync(async (req, res, next) => {
    await userService.deleteUserById(req.params.id);
    
    res.status(200).json({ 
        success: true, 
        message: 'User deleted successfully' 
    });
});

export const getUserById = catchAsync(async (req, res, next) => {
    const user = await userService.getUserById(req.params.id);
    
    res.status(200).json({
        success: true,
        data: user
    });
});

export const getUsers = catchAsync(async (req, res, next) => {
    const users = await userService.getAllUsers();
    
    res.status(200).json({
        success: true,
        data: users
    });
});

export const updateUser = catchAsync(async (req, res, next) => {
    const updatedUser = await userService.updateUserById(req.params.id, req.body);
    
    res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser
    });
});

export const searchUsers = catchAsync(async (req, res, next) => {
    const result = await userService.searchUsers(req.query);
    
    res.status(200).json({
        success: true,
        ...result
    });
});

export const getPatientHistory = catchAsync(async (req, res, next) => {
    const historyData = await userService.getPatientHistory(req.params.patientId, req.query);
    
    res.status(200).json({
        success: true,
        message: 'Patient history retrieved successfully',
        ...historyData
    });
});