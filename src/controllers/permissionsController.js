import catchAsync from '../utils/catchAsync.js';
import User from '../models/userModel.js'
import { cacheUser } from '../utils/cacheUser.js';


export const updatePermissions = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return next(new AppError("User not found", 404));

    const validPermissions = [
        "create_user", "delete_user", "update_user",
        "create_appointment", "update_appointment", "cancel_appointment", "view_appointment",
        "create_medical_record", "view_medical_record", "update_medical_record",
        "send_notification", "manage_system"
    ];

    validPermissions.forEach(key => {
        if (req.body[key] !== undefined) {
            user.permissions[key] = req.body[key];
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