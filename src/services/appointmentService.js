// appointmentService.js
import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import Appointment from "../models/appointmentModel.js";
import WorkingHour from "../models/WorkingHourModel.js";
import Holiday from "../models/HolidayModel.js";
import AppError from "../utils/appError.js";

// Helper: calculate start & end of week interval
function createInterval(weekOffset) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0); // start from 8:00 AM
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const startSearch = new Date(tomorrow.getTime() + weekOffset * oneWeekMs);
    const endSearch = new Date(startSearch.getTime() + oneWeekMs);

    return [startSearch, endSearch];
}

// Main function to create appointment
export const handleCreateAppointment = async (user, patientId, doctoreChose, { reason, type, weekOffset }) => {
    const role = await Role.findById(user.roleId);
    if (!role) throw new AppError("User role not found!", 500, "SERVER_ERROR");

    // 1️⃣ Determine which doctors to check
    let doctors = [];
    if (role.name === "doctore") {
        doctors = [user._id];
    } else if (doctoreChose) {
        doctors = [doctoreChose];
    } else {
        const doctorRole = await Role.findOne({ name: "doctore" });
        if (!doctorRole) throw new AppError("Role 'doctore' not found!", 500, "SERVER_ERROR");
        const doctorUsers = await User.find({ roleId: doctorRole._id }, { _id: 1 });
        doctors = doctorUsers.map(doc => doc._id);
    }

    // 2️⃣ Calculate week interval
    const [startSearch, endSearch] = createInterval(weekOffset);

    // 3️⃣ Fetch existing appointments in interval
    const appointments = await Appointment.find({
        status: "scheduled",
        start: { $gte: startSearch, $lte: endSearch }
    });

    // 4️⃣ Fetch working hours & holidays
    const workingHours = await WorkingHour.find({ active: true });
    const holidays = await Holiday.find({ active: true });

    // 5️⃣ Find next available slot (duration fixed 60 minutes)
    const nextSlot = findNextAvailableSlot(doctors, appointments, workingHours, holidays, startSearch, endSearch);

    if (!nextSlot) throw new AppError("No available appointment slot found in this interval", 400, "NO_SLOT");

    // 6️⃣ Optionally create appointment in DB
    // const appointment = await Appointment.create({
    //     patientId,
    //     doctorId: nextSlot.doctorId,
    //     start: nextSlot.start,
    //     reason,
    //     type,
    //     createdBy: user._id,
    //     status: 'scheduled',
    //     duration: 60
    // });

    return { nextSlot };
};

// Pure business logic: duration fixed to 60 minutes
export const findNextAvailableSlot = (doctors, appointments, workingHours, holidays, startSearch, endSearch) => {
    const duration = 60; // fixed duration in minutes

    for (let doctorId of doctors) {
        let current = new Date(startSearch);

        while (current < endSearch) {
            const dayName = current.toLocaleDateString('fr-FR', { weekday: 'long' });

            // Skip holiday
            const isHoliday = holidays.some(h => h.date.toDateString() === current.toDateString());
            if (isHoliday) {
                current.setDate(current.getDate() + 1);
                continue;
            }

            // Get working hours for the day
            const workingHour = workingHours.find(w => w.day === dayName && w.active);
            if (!workingHour) {
                current.setDate(current.getDate() + 1);
                continue;
            }

            const [startH, startM] = workingHour.start.split(':').map(Number);
            const [endH, endM] = workingHour.end.split(':').map(Number);

            let slotTime = new Date(current);
            slotTime.setHours(startH, startM, 0, 0);

            const slotEnd = new Date(current);
            slotEnd.setHours(endH, endM, 0, 0);

            // Loop through slots in 60-minute steps
            while (slotTime.getTime() + duration * 60000 <= slotEnd.getTime()) {
                // Check conflict with existing appointments
                const conflict = appointments.some(app =>
                    app.doctorId.toString() === doctorId.toString() &&
                    app.start.getTime() < slotTime.getTime() + duration * 60000 &&
                    app.start.getTime() + 60 * 60000 > slotTime.getTime()
                );

                if (!conflict) {
                    return { doctorId, start: new Date(slotTime) };
                }

                // Move to next slot
                slotTime = new Date(slotTime.getTime() + duration * 60000);
            }

            // Move to next day
            current.setDate(current.getDate() + 1);
        }
    }

    return null; // No available slot
};
