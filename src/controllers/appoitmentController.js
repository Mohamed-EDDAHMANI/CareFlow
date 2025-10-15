import catchAsync from "../utils/catchAsync.js";
import Appointment from "../models/appointmentModel.js";
import AppError from "../utils/appError.js";
import { handleCreateAppointment } from '../services/appointmentService.js';

export const createAppointment = catchAsync(async (req, res, next) => {
    const { patientId } = req.params;
    const { reason, type, weekOffset = 0 , doctoreChose = 0 } = req.body;

    // Call service
        const result = await handleCreateAppointment(req.user, patientId, doctoreChose , { reason, type, weekOffset });

    res.status(200).json({
        success: true,
        ...result
    });
});

// GET /appointments
export const getAllAppointments = catchAsync(async (req, res, next) => {
    const {
        page = 1,
        limit = 20,
        status,
        type,
        doctorId,
        patientId,
        from,
        to,
        sort = 'start',
        order = 'asc'
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;
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
            .populate('patientId', 'name email')
            .populate('doctorId', 'name email'),
        Appointment.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit) || 1),
        data: items
    });
});

// GET /appointments/doctor/:doctorId
export const getDoctorAppointments = catchAsync(async (req, res, next) => {
    const { doctorId } = req.params;
    const { page = 1, limit = 20, status, from, to, sort = 'start', order = 'asc' } = req.query;

    if (!doctorId) return next(new AppError('doctorId is required', 400, 'BAD_REQUEST'));

    const filter = { doctorId };
    if (status) filter.status = status;
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
            .populate('patientId', 'name email')
            .populate('doctorId', 'name email'),
        Appointment.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit) || 1),
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
