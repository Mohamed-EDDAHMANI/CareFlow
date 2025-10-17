import catchAsync from "../utils/catchAsync.js";
import Appointment from "../models/appointmentModel.js";
import AppError from "../utils/appError.js";
import { handleCreateAppointment } from '../services/appointmentService.js';

export const createAppointment = catchAsync(async (req, res, next) => {
    const { patientId } = req.params;
    const { reason, type, weekOffset = 0, doctoreChose = 0 } = req.body;

    // Handle uploaded documents (optional)
    const documents = req.files ? req.files.map(file => file.path) : [];

    // Call service with documents
    const result = await handleCreateAppointment(req.user, patientId, doctoreChose, { reason, type, weekOffset }, documents);

    res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: result.appointment,
        slot: result.nextSlot
    });
});

// GET /appointments/all - Get all appointments (no doctor filter required)
export const getAllAppointments = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 20, status, from, to, sort = 'start', order = 'asc' } = req.query;

    // Build filter without doctorId
    const filter = {};
    if (status) {
        filter.status = status;
    }
    if (from || to) {
        filter.start = {};
        if (from) filter.start.$gte = new Date(from);
        if (to) filter.start.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortSpec = { [sort]: order === 'desc' ? -1 : 1 };

    const [items, total] = await Promise.all([
        Appointment.find(filter)
            .sort(sortSpec)
            .skip(skip)
            .limit(Number(limit))
            .populate('patientId', 'name email cin')
            .populate('doctorId', 'name email cin')
            .populate('createdBy', 'name email'),
        Appointment.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
        data: items
    });
});

// GET /appointments/doctor/:doctorId - Get appointments for specific doctor
export const getDoctorAppointments = catchAsync(async (req, res, next) => {
    const { doctorId } = req.params;
    const { page = 1, limit = 20, status, from, to, sort = 'start', order = 'asc' } = req.query;

    // Build filter with required doctorId
    const filter = { doctorId };
    if (status) {
        filter.status = status;
    }
    if (from || to) {
        filter.start = {};
        if (from) filter.start.$gte = new Date(from);
        if (to) filter.start.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortSpec = { [sort]: order === 'desc' ? -1 : 1 };

    const [items, total] = await Promise.all([
        Appointment.find(filter)
            .sort(sortSpec)
            .skip(skip)
            .limit(Number(limit))
            .populate('patientId', 'name email cin')
            .populate('doctorId', 'name email cin')
            .populate('createdBy', 'name email'),
        Appointment.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        doctorId,
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
        data: items
    });
});

// GET /appointments/:id
export const getAppointmentById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const appt = await Appointment.findById(id)
        .populate('patientId', 'name email')
        .populate('doctorId', 'name email');

    if (!appt) return next(new AppError('Appointment not found', 404, 'NOT_FOUND'));

    res.status(200).json({ success: true, data: appt });
});

// GET /appointments/search
export const searchAppointments = catchAsync(async (req, res, next) => {
    const {
        q,
        page = 1,
        limit = 20,
        status,
        type,
        from,
        to,
        sort = 'start',
        order = 'desc'
    } = req.query;

    if (!q || q.trim().length < 2) {
        return next(new AppError('Search query must be at least 2 characters', 400, 'INVALID_SEARCH'));
    }

    const searchRegex = new RegExp(q.trim(), 'i');

    // Build match stage
    const matchStage = {};
    if (status) matchStage.status = status;
    if (type) matchStage.type = type;
    if (from || to) {
        matchStage.start = {};
        if (from) matchStage.start.$gte = new Date(from);
        if (to) matchStage.start.$lte = new Date(to);
    }

    const pipeline = [
        // Initial filter (if any)
        ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
        
        // Lookup patient
        {
            $lookup: {
                from: 'users',
                localField: 'patientId',
                foreignField: '_id',
                as: 'patient'
            }
        },
        { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
        
        // Lookup doctor
        {
            $lookup: {
                from: 'users',
                localField: 'doctorId',
                foreignField: '_id',
                as: 'doctor'
            }
        },
        { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
        
        // Search filter (reason OR patient name OR doctor name)
        {
            $match: {
                $or: [
                    { reason: searchRegex },
                    { 'patient.name': searchRegex },
                    { 'doctor.name': searchRegex }
                ]
            }
        },
        
        // Sort
        { $sort: { [sort]: order === 'desc' ? -1 : 1 } },
        
        // Facet for pagination + count
        {
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [
                    { $skip: (Number(page) - 1) * Number(limit) },
                    { $limit: Number(limit) },
                    {
                        $project: {
                            _id: 1,
                            patientId: {
                                _id: '$patient._id',
                                name: '$patient.name',
                                email: '$patient.email',
                                cin: '$patient.cin'
                            },
                            doctorId: {
                                _id: '$doctor._id',
                                name: '$doctor.name',
                                email: '$doctor.email',
                                cin: '$doctor.cin'
                            },
                            start: 1,
                            end: 1,
                            reason: 1,
                            type: 1,
                            status: 1,
                            document: 1,
                            createdAt: 1,
                            updatedAt: 1
                        }
                    }
                ]
            }
        }
    ];

    const result = await Appointment.aggregate(pipeline);
    
    const total = result[0]?.metadata[0]?.total || 0;
    const data = result[0]?.data || [];

    res.status(200).json({
        success: true,
        query: q,
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
        data
    });
});