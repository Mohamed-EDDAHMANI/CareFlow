import catchAsync from '../utils/catchAsync.js';
import User from '../models/userModel.js'
import { cacheUser } from '../utils/cacheUser.js';
import AppError from '../utils/appError.js';


export const updatePermissions = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return next(new AppError("User not found", 404));

    // New permission keys (must match schema in userModel.js)
    const validPermissions = [
        // System / users
        'manage_system',
        'manage_users_view', 'manage_users_create', 'manage_users_update', 'manage_users_delete', 'manage_users_suspend',

        // Patients
        'patient_view', 'patient_create', 'patient_update', 'patient_delete', 'patient_search', 'patient_view_history',

        // Appointments
        'appointment_view_own', 'appointment_view_all', 'appointment_create', 'appointment_update', 'appointment_cancel',

        // Consultations
        'consultation_create', 'consultation_view', 'consultation_update',

        // Documents
        'document_upload', 'document_view', 'document_delete', 'document_download',

        // Laboratory
        'lab_order_create', 'lab_order_view', 'lab_result_upload', 'lab_result_validate', 'lab_result_view',

        // Pharmacy
        'prescription_create', 'prescription_sign', 'prescription_view', 'prescription_assign_pharmacy',
        'pharmacy_view_assigned', 'pharmacy_dispense_prescription', 'pharmacy_manage_partners'
    ];

    // Update only allowed keys present in request body
    validPermissions.forEach(key => {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
            // ensure boolean
            const val = req.body[key];
            user.permissions[key] = Boolean(val);
        }
    });

    await user.save();

    await cacheUser(user);

    res.status(200).json({
        success: true,
        message: "Permissions updated successfully",
        data: user.permissions
    });
});