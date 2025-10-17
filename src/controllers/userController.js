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

/**
 * Get patient complete history (appointments + medical records)
 * Combines and sorts all patient medical history chronologically
 */
export const getPatientHistory = catchAsync(async (req, res, next) => {
    const { patientId } = req.params;
    const { 
        page = 1, 
        limit = 20, 
        sortOrder = 'desc', // 'asc' or 'desc'
        type, // Filter by type: 'appointment', 'medical_record', or 'all' (default)
        from, 
        to 
    } = req.query;

    // Validate patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
        throw new AppError('Patient not found', 404, 'NOT_FOUND');
    }

    // Import models
    const Appointment = (await import('../models/appointmentModel.js')).default;
    const MedicalRecord = (await import('../models/medicalRecordModel.js')).default;

    // Build date filter
    const dateFilter = {};
    if (from || to) {
        if (from) dateFilter.$gte = new Date(from);
        if (to) dateFilter.$lte = new Date(to);
    }

    let combinedHistory = [];

    // Fetch appointments if needed
    if (!type || type === 'all' || type === 'appointment') {
        const appointmentFilter = { patientId };
        if (from || to) {
            appointmentFilter.start = dateFilter;
        }

        const appointments = await Appointment.find(appointmentFilter)
            .populate('patientId', 'name email cin')
            .populate('doctorId', 'name email')
            .lean();

        // Transform appointments to unified format
        const formattedAppointments = appointments.map(apt => ({
            id: apt._id,
            type: 'appointment',
            date: apt.start,
            endDate: apt.end,
            title: apt.reason,
            description: apt.reason,
            status: apt.status,
            appointmentType: apt.type,
            doctor: apt.doctorId ? {
                id: apt.doctorId._id,
                name: apt.doctorId.name,
                email: apt.doctorId.email
            } : null,
            documents: apt.document || [],
            metadata: {
                reason: apt.reason,
                type: apt.type,
                status: apt.status,
                start: apt.start,
                end: apt.end
            },
            createdAt: apt.createdAt,
            updatedAt: apt.updatedAt
        }));

        combinedHistory = [...combinedHistory, ...formattedAppointments];
    }

    // Fetch medical records if needed
    if (!type || type === 'all' || type === 'medical_record') {
        const medicalRecordFilter = { patientId };
        if (from || to) {
            medicalRecordFilter.resultDate = dateFilter;
        }

        const medicalRecords = await MedicalRecord.find(medicalRecordFilter)
            .populate('patientId', 'name email cin')
            .populate('appointmentId')
            .lean();

        // Transform medical records to unified format
        const formattedMedicalRecords = medicalRecords.map(record => ({
            id: record._id,
            type: 'medical_record',
            date: record.resultDate,
            title: record.typeMedical,
            description: record.description,
            priority: record.priority,
            medicalType: record.typeMedical,
            appointment: record.appointmentId ? {
                id: record.appointmentId._id,
                reason: record.appointmentId.reason,
                date: record.appointmentId.start
            } : null,
            documents: record.document || [],
            actions: record.actions || [],
            metadata: {
                priority: record.priority,
                typeMedical: record.typeMedical,
                description: record.description,
                resultDate: record.resultDate,
                actionsCount: record.actions?.length || 0
            },
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
        }));

        combinedHistory = [...combinedHistory, ...formattedMedicalRecords];
    }

    // Sort combined history by date
    combinedHistory.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    // Calculate statistics
    const stats = {
        total: combinedHistory.length,
        appointments: combinedHistory.filter(item => item.type === 'appointment').length,
        medicalRecords: combinedHistory.filter(item => item.type === 'medical_record').length,
        urgentRecords: combinedHistory.filter(
            item => item.type === 'medical_record' && item.priority === 'Urgent'
        ).length
    };

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedHistory = combinedHistory.slice(skip, skip + parseInt(limit));

    res.status(200).json({
        success: true,
        message: 'Patient history retrieved successfully',
        patient: {
            id: patient._id,
            name: patient.name,
            email: patient.email,
            cin: patient.cin,
            birthDate: patient.birthDate
        },
        statistics: stats,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: combinedHistory.length,
            totalPages: Math.ceil(combinedHistory.length / parseInt(limit))
        },
        data: paginatedHistory
    });
});