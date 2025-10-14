import catchAsync from "../utils/catchAsync.js";
import { handleCreateAppointment } from '../services/appointmentService.js';

export const createAppointment = catchAsync(async (req, res, next) => {
    const { patientId } = req.params;
    const { reason, type, weekOffset = 0 , doctoreChose = 0 } = req.body;

    // Call service
    const result = await handleCreateAppointment(req.user, patientId, doctoreChose , { reason, type,  weekOffset , weekOffset });

    res.status(200).json({
        success: true,
        ...result
    });
});
