import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import Appointment from "../models/appointmentModel.js";
import WorkingHour from "../models/WorkingHourModel.js";
import Holiday from "../models/HolidayModel.js";
import AppError from "../utils/appError.js";
import mongoose from 'mongoose';

/* --------------------------
   HELPERS
---------------------------*/

// Calculate start & end of week interval
function createInterval(weekOffset = 0) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0); // Start from 8:00 AM

  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  const startSearch = new Date(tomorrow.getTime() + weekOffset * oneWeekMs);
  const endSearch = new Date(startSearch.getTime() + oneWeekMs);

  return [startSearch, endSearch];
}

// Determine which doctors to check
async function getDoctorsToCheck(user, doctoreChose) {
  const role = await Role.findById(user.roleId);
  if (!role) throw new AppError("User role not found!", 500, "SERVER_ERROR");

  if (role.name === "doctore") {
    return [user._id];
  }

  if (doctoreChose) {
    return [doctoreChose];
  }

  const doctorRole = await Role.findOne({ name: "doctore" });
  if (!doctorRole) throw new AppError("Role 'doctore' not found!", 500, "SERVER_ERROR");

  const doctorUsers = await User.find({ roleId: doctorRole._id }, { _id: 1 });
  return doctorUsers.map(doc => doc._id).sort(() => Math.random() - 0.5);
}

// Fetch scheduling data (appointments, workingHours, holidays)
async function getSchedulingData(startSearch, endSearch) {
  const [appointments, workingHours, holidays] = await Promise.all([
    Appointment.find({
      status: "scheduled",
      start: { $gte: startSearch, $lte: endSearch }
    }),
    WorkingHour.find({ active: true }),
    Holiday.find({ active: true })
  ]);

  return { appointments, workingHours, holidays };
}

/* --------------------------
   CORE: find earliest slot FOR ONE DOCTOR
   (returns earliest slot or null)
---------------------------*/

function getEarliestSlotForDoctor(doctorId, appointments, workingHours, holidays, startSearch, endSearch) {
  const slotLengthMs = 60 * 60000; // 1 hour
  let current = new Date(startSearch);

  // Pre-filter appointments for this doctor to speed conflict checks
  const appsForDoctor = appointments.filter(app => app.doctorId.toString() === doctorId.toString());

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

    // Loop through 1-hour slots
    while (slotTime.getTime() + slotLengthMs <= slotEnd.getTime()) {
      const slotEndTime = new Date(slotTime.getTime() + slotLengthMs);

      const conflict = appsForDoctor.some(app =>
        app.start.getTime() < slotEndTime.getTime() &&
        app.end.getTime() > slotTime.getTime()
      );

      if (!conflict) {
        return { doctorId, start: new Date(slotTime) };
      }

      // next slot
      slotTime = new Date(slotTime.getTime() + slotLengthMs);
    }

    // next day
    current.setDate(current.getDate() + 1);
  }

  return null;
}

/* --------------------------
   CORE: find best doctor by earliest slot ACROSS ALL doctors
---------------------------*/

function findBestDoctorByEarliestSlot(doctors, appointments, workingHours, holidays, startSearch, endSearch) {
  const candidates = [];

  for (let doctorId of doctors) {
    const earliest = getEarliestSlotForDoctor(doctorId, appointments, workingHours, holidays, startSearch, endSearch);
    if (earliest) candidates.push(earliest);
  }

  if (candidates.length === 0) return null;

  // pick candidate with smallest start date (earliest)
  candidates.sort((a, b) => a.start.getTime() - b.start.getTime());
  return candidates[0];
}

/* --------------------------
   MAIN: handleCreateAppointment
   Uses MongoDB transactions to prevent race conditions
---------------------------*/

export const handleCreateAppointment = async (user, patientId, doctoreChose, { reason, type, weekOffset }, documents = []) => {
  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Which doctors to check
    const doctors = await getDoctorsToCheck(user, doctoreChose);

    // 2. Interval
    const [startSearch, endSearch] = createInterval(weekOffset);

    // 3. Scheduling data (fetch within transaction for consistency)
    const { appointments, workingHours, holidays } = await getSchedulingData(startSearch, endSearch);

    // 4. Best slot across all doctors (earliest one)
    const nextSlot = findBestDoctorByEarliestSlot(doctors, appointments, workingHours, holidays, startSearch, endSearch);
    if (!nextSlot) {
      await session.abortTransaction();
      throw new AppError("No available appointment slot found in this interval", 400, "NO_SLOT");
    }

    // 5. CRITICAL: Double-check slot is still available before creating
    // This prevents race condition where another request took the slot between our check and creation
    const end = new Date(nextSlot.start.getTime() + 60 * 60000); // 1-hour slot
    
    const conflictCheck = await Appointment.findOne({
      doctorId: nextSlot.doctorId,
      status: 'scheduled',
      $or: [
        {
          // Check if new appointment overlaps with any existing appointment
          start: { $lt: end },
          end: { $gt: nextSlot.start }
        }
      ]
    }).session(session); // Use session to ensure read happens within transaction

    if (conflictCheck) {
      // Slot was taken between our initial check and now!
      await session.abortTransaction();
      throw new AppError(
        "This time slot was just booked by another user. Please try again to get the next available slot.",
        409,
        "SLOT_CONFLICT"
      );
    }

    // 6. Create appointment within transaction with optional documents
    const appointmentData = {
      patientId,
      doctorId: nextSlot.doctorId,
      start: nextSlot.start,
      end,
      reason,
      type,
      document: documents, // Can be empty array or array of file paths
      createdBy: user._id,
      status: 'scheduled'
    };

    // Create returns an array when using session
    const [appointment] = await Appointment.create([appointmentData], { session });

    // 7. Commit the transaction
    await session.commitTransaction();

    console.log(`✅ Appointment created successfully: ${appointment._id} for doctor ${nextSlot.doctorId} at ${nextSlot.start}`);

    return { appointment, nextSlot };

  } catch (error) {
    // Rollback transaction on any error
    await session.abortTransaction();
    
    // Handle duplicate key error from unique index
    if (error.code === 11000) {
      throw new AppError(
        "This appointment slot is no longer available. Please select another time.",
        409,
        "DUPLICATE_SLOT"
      );
    }
    
    throw error;
  } finally {
    // Always end the session
    session.endSession();
  }
};
