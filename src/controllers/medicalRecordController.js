import catchAsync from "../utils/catchAsync.js";
import MedicalRecord from "../models/medicalRecordModel.js";
import Appointment from "../models/appointmentModel.js";
import AppError from "../utils/appError.js";

// CREATE - Create a new medical record with optional documents
export const createMedicalRecord = catchAsync(async (req, res, next) => {
    const { patientId, appointmentId, priority, typeMedical, description, resultDate } = req.body;

    // Handle uploaded documents (optional)
    const documents = req.files ? req.files.map(file => file.path) : [];

    // Verify appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        return next(new AppError('Appointment not found', 404, 'APPOINTMENT_NOT_FOUND'));
    }

    // Create medical record
    const medicalRecord = await MedicalRecord.create({
        patientId,
        appointmentId,
        priority: priority || 'Normal',
        typeMedical,
        description,
        document: documents,
        resultDate: resultDate || new Date(),
        createdBy: req.user._id
    });

    // Populate patient and appointment details
    await medicalRecord.populate([
        { path: 'patientId', select: 'name email cin' },
        { path: 'appointmentId', select: 'start end reason type' }
    ]);

    res.status(201).json({
        success: true,
        message: 'Medical record created successfully',
        data: medicalRecord
    });
});

// READ - Get all medical records with filters
export const getAllMedicalRecords = catchAsync(async (req, res, next) => {
    const {
        page = 1,
        limit = 20,
        patientId,
        priority,
        typeMedical,
        from,
        to,
        sort = 'resultDate',
        order = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (patientId) filter.patientId = patientId;
    if (priority) filter.priority = priority;
    if (typeMedical) filter.typeMedical = typeMedical;
    if (from || to) {
        filter.resultDate = {};
        if (from) filter.resultDate.$gte = new Date(from);
        if (to) filter.resultDate.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortSpec = { [sort]: order === 'desc' ? -1 : 1 };

    const [items, total] = await Promise.all([
        MedicalRecord.find(filter)
            .sort(sortSpec)
            .skip(skip)
            .limit(Number(limit))
            .populate('patientId', 'name email cin')
            .populate('appointmentId', 'start end reason type'),
        MedicalRecord.countDocuments(filter)
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

// READ - Get medical records for a specific patient
export const getPatientMedicalRecords = catchAsync(async (req, res, next) => {
    const { patientId } = req.params;
    const {
        page = 1,
        limit = 20,
        priority,
        typeMedical,
        sort = 'resultDate',
        order = 'desc'
    } = req.query;

    const filter = { patientId };
    if (priority) filter.priority = priority;
    if (typeMedical) filter.typeMedical = typeMedical;

    const skip = (Number(page) - 1) * Number(limit);
    const sortSpec = { [sort]: order === 'desc' ? -1 : 1 };

    const [items, total] = await Promise.all([
        MedicalRecord.find(filter)
            .sort(sortSpec)
            .skip(skip)
            .limit(Number(limit))
            .populate('patientId', 'name email cin')
            .populate('appointmentId', 'start end reason type'),
        MedicalRecord.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        patientId,
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
        data: items
    });
});

// READ - Get single medical record by ID
export const getMedicalRecordById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const medicalRecord = await MedicalRecord.findById(id)
        .populate('patientId', 'name email cin birthDate')
        .populate('appointmentId', 'start end reason type status');

    if (!medicalRecord) {
        return next(new AppError('Medical record not found', 404, 'NOT_FOUND'));
    }

    res.status(200).json({
        success: true,
        data: medicalRecord
    });
});

// UPDATE - Update medical record
export const updateMedicalRecord = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { priority, typeMedical, description, resultDate } = req.body;

    // Find existing record
    const medicalRecord = await MedicalRecord.findById(id);
    if (!medicalRecord) {
        return next(new AppError('Medical record not found', 404, 'NOT_FOUND'));
    }

    // Handle new uploaded documents (append to existing)
    const newDocuments = req.files ? req.files.map(file => file.path) : [];
    if (newDocuments.length > 0) {
        medicalRecord.document = [...medicalRecord.document, ...newDocuments];
    }

    // Update fields
    if (priority) medicalRecord.priority = priority;
    if (typeMedical) medicalRecord.typeMedical = typeMedical;
    if (description) medicalRecord.description = description;
    if (resultDate) medicalRecord.resultDate = resultDate;

    await medicalRecord.save();

    // Populate and return
    await medicalRecord.populate([
        { path: 'patientId', select: 'name email cin' },
        { path: 'appointmentId', select: 'start end reason type' }
    ]);

    res.status(200).json({
        success: true,
        message: 'Medical record updated successfully',
        data: medicalRecord
    });
});

// DELETE - Delete medical record
export const deleteMedicalRecord = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const medicalRecord = await MedicalRecord.findByIdAndDelete(id);

    if (!medicalRecord) {
        return next(new AppError('Medical record not found', 404, 'NOT_FOUND'));
    }

    res.status(200).json({
        success: true,
        message: 'Medical record deleted successfully',
        data: null
    });
});

// ADD ACTION - Add action to medical record (treatment, scanner, analysis)
export const addAction = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { type, description } = req.body;

    // Validate action type
    const validTypes = ['treatment', 'scanner', 'analysis'];
    if (!validTypes.includes(type)) {
        return next(new AppError('Invalid action type. Must be treatment, scanner, or analysis', 400, 'INVALID_ACTION_TYPE'));
    }

    // Find medical record
    const medicalRecord = await MedicalRecord.findById(id);
    if (!medicalRecord) {
        return next(new AppError('Medical record not found', 404, 'NOT_FOUND'));
    }

    // Handle document for action
    const document = req.file ? req.file.path : null;

    // Add action using model method
    await medicalRecord.addAction(type, description, document);

    // Populate and return
    await medicalRecord.populate([
        { path: 'patientId', select: 'name email cin' },
        { path: 'appointmentId', select: 'start end reason type' }
    ]);

    res.status(200).json({
        success: true,
        message: 'Action added successfully',
        data: medicalRecord
    });
});

// SEARCH - Search medical records
export const searchMedicalRecords = catchAsync(async (req, res, next) => {
    const {
        q,
        page = 1,
        limit = 20,
        priority,
        typeMedical,
        from,
        to,
        sort = 'resultDate',
        order = 'desc'
    } = req.query;

    if (!q || q.trim().length < 2) {
        return next(new AppError('Search query must be at least 2 characters', 400, 'INVALID_SEARCH'));
    }

    const searchRegex = new RegExp(q.trim(), 'i');

    // Build match stage
    const matchStage = {};
    if (priority) matchStage.priority = priority;
    if (typeMedical) matchStage.typeMedical = typeMedical;
    if (from || to) {
        matchStage.resultDate = {};
        if (from) matchStage.resultDate.$gte = new Date(from);
        if (to) matchStage.resultDate.$lte = new Date(to);
    }

    const pipeline = [
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
        
        // Search filter (description OR patient name OR typeMedical)
        {
            $match: {
                $or: [
                    { description: searchRegex },
                    { typeMedical: searchRegex },
                    { 'patient.name': searchRegex }
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
                            appointmentId: 1,
                            priority: 1,
                            typeMedical: 1,
                            description: 1,
                            document: 1,
                            actions: 1,
                            resultDate: 1,
                            createdAt: 1,
                            updatedAt: 1
                        }
                    }
                ]
            }
        }
    ];

    const result = await MedicalRecord.aggregate(pipeline);
    
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
