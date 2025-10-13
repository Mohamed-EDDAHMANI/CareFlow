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
        throw new AppError('Email already in use', 400 , 'VALIDATION_ERROR');
    }

    const existingUserByCin = await User.findOne({ cin });
    if (existingUserByCin) {
        throw new AppError('Cin already in use', 400 , 'VALIDATION_ERROR');
    }

    const role = await Role.findById(roleId);
    if (!role) {
        throw new AppError('Invalid role ID', 400 , 'VALIDATION_ERROR');
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
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid user ID format', 400, 'SERVER_ERROR');
    }
    if (!id) {
        throw new AppError('User Id is required', 400, 'VALIDATION_ERROR');
    }
    const existingUser = await User.findByIdAndDelete(id);
    if (!existingUser) {
        throw new AppError('User not found', 400);
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' })
});

export const getUserById = catchAsync(async (req, res, next) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid user ID format', 400, 'SERVER_ERROR');
    }
    const user = await User.findById(id).select("-password -refreshToken")
    if (!user) {
        throw new AppError('User not found', 400, 'SERVER_ERROR');
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
    if (!users) {
        throw new AppError('User not found', 400, 'SERVER_ERROR')
    }
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
    if (!user) {
        throw new AppError('User Not Found', 401, 'SERVER_ERROR');
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

export const searchUsers = catchAsync(async (req, res, next) => {
    const { name, role, sortBy, page = 1, limit = 10 } = req.query;

    // 🔹 Filter
    const filter = {};
    if (name && name.trim() !== "") {
        filter.name = { $regex: new RegExp(name, "i") };
    }
    
    if(role){
        const roleDoc = await Role.findOne({ name: role });
        if (!roleDoc) {
            throw new AppError("Role not found", 404);
        }
        const roleId = roleDoc._id;
    
        if (roleId) {
            filter.roleId = roleId._id;
        }
    }
    console.log(filter, role)
    // name: { '$regex': /Mohamed ALI/i },

    // 🔹 Sort
    let sort = {};
    if (sortBy) {
        const order = sortBy.startsWith("-") ? -1 : 1;
        const field = sortBy.replace("-", "");
        sort[field] = order;
    }

    // 🔹 Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
        .select("-password -refreshToken")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
        success: true,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        count: users.length,
        data: users,
    });
});