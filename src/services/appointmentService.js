// /services/appointmentService.js

import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import Appointment from "../models/appointmentModel.js";
import WorkingHour from "../models/WorkingHourModel.js";
import Holiday from "../models/HolidayModel.js";
import AppError from "../utils/appError.js";
import mongoose from 'mongoose';
import crypto from 'crypto';
import redisClient from '../config/redis.js';

/* --------------------------
  HELPERS (Fonctions internes, makat-exportach)
---------------------------*/

function createInterval(weekOffset = 0) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);

  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  const startSearch = new Date(tomorrow.getTime() + weekOffset * oneWeekMs);
  const endSearch = new Date(startSearch.getTime() + oneWeekMs);
  return [startSearch, endSearch];
}

async function getDoctorsToCheck(user, doctoreChose) {
  const role = await Role.findById(user.roleId);
  if (!role) throw new AppError("User role not found!", 500, "SERVER_ERROR");
  if (role.name === "doctore") return [user._id];
  if (doctoreChose) return [doctoreChose];

  const doctorRole = await Role.findOne({ name: "doctore" });
  if (!doctorRole) throw new AppError("Role 'doctore' not found!", 500, "SERVER_ERROR");

  const doctorUsers = await User.find({ roleId: doctorRole._id }, { _id: 1 });
  return doctorUsers.map(doc => doc._id).sort(() => Math.random() - 0.5);
}

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

function getEarliestSlotForDoctor(doctorId, appointments, workingHours, holidays, startSearch, endSearch) {
  const slotLengthMs = 60 * 60000;
  let current = new Date(startSearch);
  const appsForDoctor = appointments.filter(app => app.doctorId.toString() === doctorId.toString());

  while (current < endSearch) {
    const dayName = current.toLocaleDateString('fr-FR', { weekday: 'long' });
    const isHoliday = holidays.some(h => h.date.toDateString() === current.toDateString());
    if (isHoliday) {
      current.setDate(current.getDate() + 1);
      continue;
    }

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

    while (slotTime.getTime() + slotLengthMs <= slotEnd.getTime()) {
      const slotEndTime = new Date(slotTime.getTime() + slotLengthMs);
      const conflict = appsForDoctor.some(app =>
        app.start.getTime() < slotEndTime.getTime() &&
        app.end.getTime() > slotTime.getTime()
      );
      if (!conflict) {
        return { doctorId, start: new Date(slotTime) };
      }
      slotTime = new Date(slotTime.getTime() + slotLengthMs);
    }
    current.setDate(current.getDate() + 1);
  }
  return null;
}

function findBestDoctorByEarliestSlot(doctors, appointments, workingHours, holidays, startSearch, endSearch) {
  const candidates = [];
  for (let doctorId of doctors) {
    const earliest = getEarliestSlotForDoctor(doctorId, appointments, workingHours, holidays, startSearch, endSearch);
    if (earliest) candidates.push(earliest);
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.start.getTime() - b.start.getTime());
  return candidates[0];
}


/* --------------------------
  SERVICE FUNCTIONS (Exportées)
---------------------------*/

/**
 * Crée un RDV en utilisant Redis L-locking pour éviter les conflits.
 */
const createAppointment = async (user, patientId, { reason, type, weekOffset, doctoreChose }, documents = []) => {
  // 1. Logique de recherche de slot (lecture seule)
  const doctors = await getDoctorsToCheck(user, doctoreChose);
  const [startSearch, endSearch] = createInterval(weekOffset);
  const { appointments, workingHours, holidays } = await getSchedulingData(startSearch, endSearch);
  const nextSlot = findBestDoctorByEarliestSlot(doctors, appointments, workingHours, holidays, startSearch, endSearch);

  if (!nextSlot) {
    throw new AppError("No available appointment slot found in this interval", 400, "NO_SLOT");
  }

  // 2. Début de la section critique (écriture) -> Utilisation de REDIS
  const end = new Date(nextSlot.start.getTime() + 60 * 60000);
  
  // Créer un L-lock unique pour ce slot (docteur + heure de début)
  const lockKey = `lock:appt:${nextSlot.doctorId}:${nextSlot.start.getTime()}`;
  const lockValue = crypto.randomUUID();
  const lockTimeout = 10; // 10 secondes

  const acquired = await redisClient.set(lockKey, lockValue, {
    EX: lockTimeout,
    NX: true // NX = Set if Not Exists (Hadi hya l-lock)
  });

  if (!acquired) {
    throw new AppError(
      "This time slot is being booked by another user. Please try again.",
      409, // 409 Conflict
      "SLOT_CONFLICT"
    );
  }

  try {
    const conflictCheck = await Appointment.findOne({
      doctorId: nextSlot.doctorId,
      status: 'scheduled',
      $or: [{ start: { $lt: end }, end: { $gt: nextSlot.start } }]
    });

    if (conflictCheck) {
      throw new AppError(
        "This time slot was just booked. Please try again.",
        409,
        "SLOT_CONFLICT"
      );
    }

    const appointmentData = {
      patientId,
      doctorId: nextSlot.doctorId,
      start: nextSlot.start,
      end,
      reason,
      type,
      document: documents,
      createdBy: user._id,
      status: 'scheduled'
    };
    const appointment = await Appointment.create(appointmentData);

    console.log(`✅ Appointment created successfully: ${appointment._id} for doctor ${nextSlot.doctorId} at ${nextSlot.start}`);
    return { appointment, nextSlot };

  } catch (error) {
    throw error;
  } finally {
    if (await redisClient.get(lockKey) === lockValue) {
      await redisClient.del(lockKey);
    }
  }
};

/**
 * Récupère tous les RDV avec filtres et pagination.
 */
const getAllAppointments = async (queryParams) => {
  const { page = 1, limit = 20, status, from, to, sort = 'start', order = 'asc' } = queryParams;

  const filter = {};
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
      .populate('patientId', 'name email cin')
      .populate('doctorId', 'name email cin')
      .populate('createdBy', 'name email'),
    Appointment.countDocuments(filter)
  ]);

  return {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / Number(limit)) || 1,
    data: items
  };
};

/**
 * Récupère les RDV d'un docteur spécifique.
 */
const getDoctorAppointments = async (doctorId, queryParams) => {
  const { page = 1, limit = 20, status, from, to, sort = 'start', order = 'asc' } = queryParams;

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
      .populate('patientId', 'name email cin')
      .populate('doctorId', 'name email cin')
      .populate('createdBy', 'name email'),
    Appointment.countDocuments(filter)
  ]);

  return {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / Number(limit)) || 1,
    data: items
  };
};

/**
 * Récupère un RDV par ID.
 */
const getAppointmentById = async (id) => {
  const appt = await Appointment.findById(id)
    .populate('patientId', 'name email')
    .populate('doctorId', 'name email');
  if (!appt) throw new AppError('Appointment not found', 404, 'NOT_FOUND');
  return appt;
};

/**
 * Recherche avancée dans les RDV (Aggregation).
 */
const searchAppointments = async (queryParams) => {
  const { q, page = 1, limit = 20, status, type, from, to, sort = 'start', order = 'desc' } = queryParams;

  if (!q || q.trim().length < 2) {
    throw new AppError('Search query must be at least 2 characters', 400, 'INVALID_SEARCH');
  }
  const searchRegex = new RegExp(q.trim(), 'i');

  const matchStage = {};
  if (status) matchStage.status = status;
  if (type) matchStage.type = type;
  if (from || to) {
    matchStage.start = {};
    if (from) matchStage.start.$gte = new Date(from);
    if (to) matchStage.start.$lte = new Date(to);
  }

  const pipeline = [
    ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
    { $lookup: { from: 'users', localField: 'patientId', foreignField: '_id', as: 'patient' } },
    { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'users', localField: 'doctorId', foreignField: '_id', as: 'doctor' } },
    { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
    { $match: { $or: [{ reason: searchRegex }, { 'patient.name': searchRegex }, { 'doctor.name': searchRegex }] } },
    { $sort: { [sort]: order === 'desc' ? -1 : 1 } },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $skip: (Number(page) - 1) * Number(limit) },
          { $limit: Number(limit) },
          {
            $project: {
              _id: 1, start: 1, end: 1, reason: 1, type: 1, status: 1, document: 1, createdAt: 1, updatedAt: 1,
              patientId: { _id: '$patient._id', name: '$patient.name', email: '$patient.email', cin: '$patient.cin' },
              doctorId: { _id: '$doctor._id', name: '$doctor.name', email: '$doctor.email', cin: '$doctor.cin' }
            }
          }
        ]
      }
    }
  ];

  const result = await Appointment.aggregate(pipeline);
  const total = result[0]?.metadata[0]?.total || 0;
  const data = result[0]?.data || [];

  return {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / Number(limit)) || 1,
    data
  };
};

/**
 * Met à jour le statut d'un RDV (ex: 'completed', 'cancelled').
 */
const updateAppointmentStatus = async (appointmentId, status, user) => {
  const validStatuses = ['scheduled', 'completed', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    throw new AppError(
      `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400, 'INVALID_STATUS'
    );
  }

  const appointment = await Appointment.findById(appointmentId)
    .populate('patientId', 'name email cin')
    .populate('doctorId', 'name email cin');

  if (!appointment) {
    throw new AppError('Appointment not found', 404, 'NOT_FOUND');
  }

  const userRole = await Role.findById(user.roleId);
  const isAssignedDoctor = appointment.doctorId?._id.toString() === user._id.toString();
  const hasAdminRights = userRole?.name === 'admin' || user.permissions?.administration;

  if (!isAssignedDoctor && !hasAdminRights) {
    throw new AppError('You are not authorized to update this appointment.', 403, 'FORBIDDEN');
  }
  if (appointment.status === 'cancelled' && status !== 'cancelled') {
    throw new AppError('Cannot change status of a cancelled appointment', 400, 'INVALID_OPERATION');
  }
  if (status === 'completed' && new Date() < appointment.start) {
    throw new AppError('Cannot mark a future appointment as completed', 400, 'INVALID_OPERATION');
  }

  const oldStatus = appointment.status;
  appointment.status = status;
  await appointment.save();

  console.log(`✅ Appointment ${appointmentId} status changed from "${oldStatus}" to "${status}" by ${user.name}`);
  
  return appointment.toObject();
};


export default {
  createAppointment,
  getAllAppointments,
  getDoctorAppointments,
  getAppointmentById,
  searchAppointments,
  updateAppointmentStatus
};