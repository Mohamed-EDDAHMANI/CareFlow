import catchAsync from "../utils/catchAsync.js";
import appointmentService from '../services/appointmentService.js';

export const createAppointment = catchAsync(async (req, res, next) => {
  const { patientId } = req.params;
  const { reason, type, weekOffset = 0, doctoreChose = 0 } = req.body;
  const documents = req.uploadedFiles;
  
  const result = await appointmentService.createAppointment(
    req.user, 
    patientId, 
    { reason, type, weekOffset, doctoreChose }, 
    documents
  );

  res.status(201).json({
    success: true,
    message: 'Appointment created successfully',
    data: result.appointment,
    slot: result.nextSlot,
    errors: req.errors && req.errors.length > 0 ? req.errors : undefined
  });
});

export const getAllAppointments = catchAsync(async (req, res, next) => {
  const result = await appointmentService.getAllAppointments(req.query);
  
  res.status(200).json({
    success: true,
    ...result
  });
});

export const getDoctorAppointments = catchAsync(async (req, res, next) => {
  const { doctorId } = req.params;
  const result = await appointmentService.getDoctorAppointments(doctorId, req.query);

  res.status(200).json({
    success: true,
    doctorId,
    ...result
  });
});

export const getAppointmentById = catchAsync(async (req, res, next) => {
  const appt = await appointmentService.getAppointmentById(req.params.id);
  res.status(200).json({ success: true, data: appt });
});

export const getOwnAppointments = catchAsync(async (req, res, next) => {
  const appt = await appointmentService.getOwnAppointments(req.user.id,req.params.id);
  res.status(200).json({ success: true, data: appt });
});

export const searchAppointments = catchAsync(async (req, res, next) => {
  const result = await appointmentService.searchAppointments(req.query);

  res.status(200).json({
    success: true,
    query: req.query.q,
    ...result
  });
});

export const updateAppointmentStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const updatedAppointment = await appointmentService.updateAppointmentStatus(
    id, 
    status, 
    req.user
  );

  res.status(200).json({
    success: true,
    message: `Appointment status updated from "${updatedAppointment.oldStatus}" to "${updatedAppointment.status}"`,
    data: updatedAppointment
  });
});