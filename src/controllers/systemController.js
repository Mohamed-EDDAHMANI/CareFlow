import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import Holiday from '../models/HolidayModel.js';
import WorkingHour from '../models/WorkingHourModel.js';
import { s3 } from '../config/s3Config.js'

// ==================== HOLIDAY MANAGEMENT ====================

/**
 * Get all holidays
 */
export const getAllHolidays = catchAsync(async (req, res, next) => {
    const { active, year, month } = req.query;

    // Build filter
    const filter = {};
    if (active !== undefined) {
        filter.active = active === 'true';
    }
    if (year) {
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);
        filter.date = { $gte: startDate, $lte: endDate };
    }
    if (month && year) {
        const startDate = new Date(`${year}-${month.padStart(2, '0')}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // Last day of month
        filter.date = { $gte: startDate, $lte: endDate };
    }

    const holidays = await Holiday.find(filter).sort({ date: 1 });

    res.status(200).json({
        success: true,
        count: holidays.length,
        data: holidays
    });
});

/**
 * Get single holiday by ID
 */
export const getHolidayById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const holiday = await Holiday.findById(id);

    if (!holiday) {
        return next(new AppError('Holiday not found', 404, 'NOT_FOUND'));
    }

    res.status(200).json({
        success: true,
        data: holiday
    });
});

/**
 * Create a new holiday
 */
export const createHoliday = catchAsync(async (req, res, next) => {
    const { name, date, description, active = true } = req.body;

    // Check if holiday already exists on this date
    const existingHoliday = await Holiday.findOne({
        date: new Date(date),
        active: true
    });

    if (existingHoliday) {
        return next(new AppError(
            `A holiday already exists on ${new Date(date).toDateString()}: ${existingHoliday.name}`,
            400,
            'DUPLICATE_HOLIDAY'
        ));
    }

    const holiday = await Holiday.create({
        name,
        date: new Date(date),
        description,
        active
    });

    console.log(`✅ Holiday created: ${holiday.name} on ${holiday.date.toDateString()}`);

    res.status(201).json({
        success: true,
        message: 'Holiday created successfully',
        data: holiday
    });
});

/**
 * Update a holiday
 */
export const updateHoliday = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, date, description, active } = req.body;

    const holiday = await Holiday.findById(id);

    if (!holiday) {
        return next(new AppError('Holiday not found', 404, 'NOT_FOUND'));
    }

    // If date is being changed, check for conflicts
    if (date && new Date(date).getTime() !== holiday.date.getTime()) {
        const existingHoliday = await Holiday.findOne({
            _id: { $ne: id },
            date: new Date(date),
            active: true
        });

        if (existingHoliday) {
            return next(new AppError(
                `A holiday already exists on ${new Date(date).toDateString()}: ${existingHoliday.name}`,
                400,
                'DUPLICATE_HOLIDAY'
            ));
        }
    }

    // Update fields
    if (name !== undefined) holiday.name = name;
    if (date !== undefined) holiday.date = new Date(date);
    if (description !== undefined) holiday.description = description;
    if (active !== undefined) holiday.active = active;

    await holiday.save();

    console.log(`✅ Holiday updated: ${holiday.name}`);

    res.status(200).json({
        success: true,
        message: 'Holiday updated successfully',
        data: holiday
    });
});

/**
 * Delete a holiday
 */
export const deleteHoliday = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const holiday = await Holiday.findById(id);

    if (!holiday) {
        return next(new AppError('Holiday not found', 404, 'NOT_FOUND'));
    }

    await holiday.deleteOne();

    console.log(`✅ Holiday deleted: ${holiday.name}`);

    res.status(200).json({
        success: true,
        message: 'Holiday deleted successfully',
        data: null
    });
});

/**
 * Toggle holiday active status
 */
export const toggleHolidayStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const holiday = await Holiday.findById(id);

    if (!holiday) {
        return next(new AppError('Holiday not found', 404, 'NOT_FOUND'));
    }

    holiday.active = !holiday.active;
    await holiday.save();

    console.log(`✅ Holiday ${holiday.active ? 'activated' : 'deactivated'}: ${holiday.name}`);

    res.status(200).json({
        success: true,
        message: `Holiday ${holiday.active ? 'activated' : 'deactivated'} successfully`,
        data: holiday
    });
});

// ==================== WORKING HOURS MANAGEMENT ====================

/**
 * Get all working hours
 */
export const getAllWorkingHours = catchAsync(async (req, res, next) => {
    const { active, day } = req.query;

    // Build filter
    const filter = {};
    if (active !== undefined) {
        filter.active = active === 'true';
    }
    if (day) {
        filter.day = day;
    }

    const workingHours = await WorkingHour.find(filter).sort({ day: 1 });

    res.status(200).json({
        success: true,
        count: workingHours.length,
        data: workingHours
    });
});

/**
 * Get single working hour by ID
 */
export const getWorkingHourById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const workingHour = await WorkingHour.findById(id);

    if (!workingHour) {
        return next(new AppError('Working hour not found', 404, 'NOT_FOUND'));
    }

    res.status(200).json({
        success: true,
        data: workingHour
    });
});

/**
 * Create working hours
 */
export const createWorkingHour = catchAsync(async (req, res, next) => {
    const { day, start, end, active = true } = req.body;

    // Validate day
    const validDays = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    if (!validDays.includes(day)) {
        return next(new AppError(
            `Invalid day. Must be one of: ${validDays.join(', ')}`,
            400,
            'INVALID_DAY'
        ));
    }

    // Check if working hour already exists for this day
    const existingWorkingHour = await WorkingHour.findOne({ day });

    if (existingWorkingHour) {
        return next(new AppError(
            `Working hours already exist for ${day}. Use update instead.`,
            400,
            'DUPLICATE_WORKING_HOUR'
        ));
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(start) || !timeRegex.test(end)) {
        return next(new AppError(
            'Invalid time format. Use HH:MM (24-hour format)',
            400,
            'INVALID_TIME_FORMAT'
        ));
    }

    const workingHour = await WorkingHour.create({
        day,
        start,
        end,
        active
    });

    console.log(`✅ Working hours created for ${day}: ${start} - ${end}`);

    res.status(201).json({
        success: true,
        message: 'Working hours created successfully',
        data: workingHour
    });
});

/**
 * Update working hours
 */
export const updateWorkingHour = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { day, start, end, active } = req.body;

    const workingHour = await WorkingHour.findById(id);

    if (!workingHour) {
        return next(new AppError('Working hour not found', 404, 'NOT_FOUND'));
    }

    // Validate day if provided
    if (day) {
        const validDays = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        if (!validDays.includes(day)) {
            return next(new AppError(
                `Invalid day. Must be one of: ${validDays.join(', ')}`,
                400,
                'INVALID_DAY'
            ));
        }

        // Check if another working hour exists for this day
        if (day !== workingHour.day) {
            const existingWorkingHour = await WorkingHour.findOne({
                _id: { $ne: id },
                day
            });

            if (existingWorkingHour) {
                return next(new AppError(
                    `Working hours already exist for ${day}`,
                    400,
                    'DUPLICATE_WORKING_HOUR'
                ));
            }
        }
    }

    // Validate time format if provided
    if (start || end) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if ((start && !timeRegex.test(start)) || (end && !timeRegex.test(end))) {
            return next(new AppError(
                'Invalid time format. Use HH:MM (24-hour format)',
                400,
                'INVALID_TIME_FORMAT'
            ));
        }
    }

    // Update fields
    if (day !== undefined) workingHour.day = day;
    if (start !== undefined) workingHour.start = start;
    if (end !== undefined) workingHour.end = end;
    if (active !== undefined) workingHour.active = active;

    await workingHour.save();

    console.log(`✅ Working hours updated for ${workingHour.day}`);

    res.status(200).json({
        success: true,
        message: 'Working hours updated successfully',
        data: workingHour
    });
});

/**
 * Delete working hours
 */
export const deleteWorkingHour = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const workingHour = await WorkingHour.findById(id);

    if (!workingHour) {
        return next(new AppError('Working hour not found', 404, 'NOT_FOUND'));
    }

    await workingHour.deleteOne();

    console.log(`✅ Working hours deleted for ${workingHour.day}`);

    res.status(200).json({
        success: true,
        message: 'Working hours deleted successfully',
        data: null
    });
});

/**
 * Toggle working hour active status
 */
export const toggleWorkingHourStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const workingHour = await WorkingHour.findById(id);

    if (!workingHour) {
        return next(new AppError('Working hour not found', 404, 'NOT_FOUND'));
    }

    workingHour.active = !workingHour.active;
    await workingHour.save();

    console.log(`✅ Working hours ${workingHour.active ? 'activated' : 'deactivated'} for ${workingHour.day}`);

    res.status(200).json({
        success: true,
        message: `Working hours ${workingHour.active ? 'activated' : 'deactivated'} successfully`,
        data: workingHour
    });
});


export const downloadFile = catchAsync(async (req, res, next) => {
    const { objectName } = req.params;

    const stat = await s3.statObject(process.env.MINIO_BUCKET_NAME, objectName);

    res.setHeader("Content-Type", stat.metaData["content-type"] || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${objectName}"`);

    const stream = await s3.getObject(process.env.MINIO_BUCKET_NAME, objectName);
    stream.pipe(res);
})