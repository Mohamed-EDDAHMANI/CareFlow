// /services/userService.js

import mongoose from 'mongoose';
import User from "../models/userModel.js";
import Role from '../models/roleModel.js';
import Appointment from '../models/appointmentModel.js';
import Consultation from '../models/medicalRecordModel.js';
import AppError from '../utils/appError.js';

const getPermissionsForRole = (roleName) => {
  switch (roleName) {
    case 'admin':
      return {
        manage_system: true, manage_users_view: true, manage_users_create: true, manage_users_update: true, manage_users_delete: true,
        manage_users_suspend: true, patient_view: true, patient_create: true, patient_update: true, patient_delete: true,
        patient_search: true, patient_view_history: true, appointment_view_own: true, appointment_view_all: true,
        appointment_create: true, appointment_update: true, appointment_cancel: true, consultation_create: true,
        consultation_view: true, consultation_update: true, document_upload: true, document_view: true, document_delete: true,
        document_download: true, lab_order_create: true, lab_order_view: true, lab_result_upload: true, lab_result_validate: true,
        lab_result_view: true, prescription_create: true, prescription_sign: true, prescription_view: true,
        prescription_assign_pharmacy: true, pharmacy_view_assigned: true, pharmacy_dispense_prescription: true,
        pharmacy_manage_partners: true, send_notification: true
      };
    case 'doctore':
      return {
        patient_view: true, patient_update: true, patient_search: true, patient_view_history: true, appointment_view_all: true,
        appointment_create: true, appointment_update: true, appointment_cancel: true, consultation_create: true,
        consultation_view: true, consultation_update: true, document_upload: true, document_view: true,
        document_download: true, lab_order_create: true, lab_order_view: true, lab_result_view: true,
        prescription_create: true, prescription_sign: true, prescription_view: true, prescription_assign_pharmacy: true,
        send_notification: true
      };
    case 'infermeri':
      return {
        patient_view: true, patient_update: true, patient_search: true, appointment_view_all: true,
        appointment_create: true, appointment_update: true, appointment_cancel: true,
        consultation_create: true, consultation_view: true
      };
    case 'accueil':
      return {
        patient_view: true, patient_create: true, patient_update: true, patient_search: true,
        appointment_view_all: true, appointment_create: true, appointment_update: true, appointment_cancel: true
      };
    case 'patient':
      return {
        patient_view: true, patient_update: true, appointment_view_own: true, appointment_create: true,
        appointment_update: true, appointment_cancel: true, consultation_view: true, document_upload: true,
        document_view: true, document_download: true, lab_order_view: true, lab_result_view: true,
        prescription_view: true, prescription_assign_pharmacy: true
      };
    case 'pharmacist':
      return { pharmacy_view_assigned: true, pharmacy_dispense_prescription: true };
    case 'responsabe':
      return { lab_order_view: true, lab_result_upload: true, lab_result_validate: true };
    default:
      return {};
  }
};

const createUserPatient = async (userData) => {
    const { name, email, password, birthDate, roleId, status, cin } = userData;

    if (await User.findOne({ email })) {
        throw new AppError('Email already in use', 400, 'VALIDATION_ERROR');
    }
    if (await User.findOne({ cin })) {
        throw new AppError('Cin already in use', 400, 'VALIDATION_ERROR');
    }
    const role = await Role.findById(roleId).select("name");
    if (!role || role.name !== 'patient') {
        throw new AppError('Invalid role ID', 400, 'VALIDATION_ERROR');
    }

    const permissions = getPermissionsForRole(role.name);
    
    const newUser = new User({
        name, email, password, birthDate, roleId, status, cin, permissions
    });
    await newUser.save();

    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;
    return userResponse;
};

const createUser = async (userData) => {
    const { name, email, password, birthDate, roleId, status, cin } = userData;

    if (await User.findOne({ email })) {
        throw new AppError('Email already in use', 400, 'VALIDATION_ERROR');
    }
    if (await User.findOne({ cin })) {
        throw new AppError('Cin already in use', 400, 'VALIDATION_ERROR');
    }
    const role = await Role.findById(roleId).select("name");
    if (!role) {
        throw new AppError('Invalid role ID', 400, 'VALIDATION_ERROR');
    }

    const permissions = getPermissionsForRole(role.name);
    
    const newUser = new User({
        name, email, password, birthDate, roleId, status, cin, permissions
    });
    await newUser.save();

    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;
    return userResponse;
};

const deleteUserById = async (userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid user ID format', 400, 'VALIDATION_ERROR');
    }
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
    }
};

const getPatientById = async (userId) => {
    const role = await Role.findById(roleId).select("name");
    if (!mongoose.Types.ObjectId.isValid(userId) || role.name !== 'patient') {
        throw new AppError('Invalid user ID format', 400, 'VALIDATION_ERROR');
    }
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    return user;
};

const getUserById = async (userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid user ID format', 400, 'VALIDATION_ERROR');
    }
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    return user;
};

const getPatients = async () => {
  const users = await User.find()
    .populate({
      path: 'roleId',
      select: 'name', 
      match: { name: 'patient' } 
    })
    .select('-password -refreshToken');

  return users.filter(user => user.roleId !== null);
};

const getAllUsers = async () => {
    return User.find().select("-password -refreshToken");
};

const updateUserById = async (userId, updateData) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid user ID format', 400, 'VALIDATION_ERROR');
    }
    
    const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true
    }).select("-password -refreshToken");

    if (!user) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    return user;
};

const searchPatients = async (queryParams) => {
  const { name, sortBy, page = 1, limit = 10 } = queryParams;

  const patientRole = await Role.findOne({ name: "patient" });
  if (!patientRole) {
    throw new AppError("Role 'patient' not found", 404, "NOT_FOUND");
  }

  const filter = { roleId: patientRole._id };

  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }

  let sort = {};
  if (sortBy) {
    const order = sortBy.startsWith("-") ? -1 : 1;
    const field = sortBy.replace("-", "");
    sort[field] = order;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -refreshToken")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter)
  ]);

  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    count: users.length,
    data: users
  };
};


const searchUsers = async (queryParams) => {
    const { name, role, sortBy, page = 1, limit = 10 } = queryParams;

    const filter = {};
    if (name) filter.name = { $regex: name, $options: "i" };
    
    if (role) {
        const roleDoc = await Role.findOne({ name: role });
        if (!roleDoc) {
             filter.roleId = new mongoose.Types.ObjectId();
        } else {
             filter.roleId = roleDoc._id;
        }
    }
    
    let sort = {};
    if (sortBy) {
        const order = sortBy.startsWith("-") ? -1 : 1;
        const field = sortBy.replace("-", "");
        sort[field] = order;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
        .select("-password -refreshToken")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
    
    const total = await User.countDocuments(filter);

    return { total, page: parseInt(page), limit: parseInt(limit), count: users.length, data: users };
};

const getPatientHistory = async (patientId, queryParams) => {
    const { 
        page = 1, 
        limit = 20, 
        sortOrder = 'desc',
        type, 
        from, 
        to 
    } = queryParams;

    const patient = await User.findById(patientId).select("name email cin birthDate");
    if (!patient) {
        throw new AppError('Patient not found', 404, 'NOT_FOUND');
    }
    
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);

    let combinedHistory = [];

    if (!type || type === 'all' || type === 'appointment') {
        const appointmentFilter = { patientId };
        if (from || to) appointmentFilter.start = dateFilter;
        
        const appointments = await Appointment.find(appointmentFilter)
            .populate('doctorId', 'name email')
            .lean();

        const formattedAppointments = appointments.map(apt => ({
            id: apt._id,
            type: 'appointment',
            date: apt.start,
            endDate: apt.end,
            title: apt.reason,
            description: apt.reason,
            status: apt.status,
            appointmentType: apt.type,
            doctor: apt.doctorId ? {
                id: apt.doctorId._id,
                name: apt.doctorId.name,
                email: apt.doctorId.email
            } : null,
            documents: apt.document || [],
            metadata: {
                reason: apt.reason,
                type: apt.type,
                status: apt.status,
                start: apt.start,
                end: apt.end
            },
            createdAt: apt.createdAt,
            updatedAt: apt.updatedAt
        }));
        combinedHistory.push(...formattedAppointments);
    }

    if (!type || type === 'all' || type === 'medical_record') {
        const medicalRecordFilter = { patientId };
        if (from || to) medicalRecordFilter.resultDate = dateFilter;

        const medicalRecords = await Consultation.find(medicalRecordFilter)
            .populate('appointmentId')
            .lean();

        const formattedMedicalRecords = medicalRecords.map(record => ({
            id: record._id,
            type: 'medical_record',
            date: record.resultDate,
            title: record.typeMedical,
            description: record.description,
            priority: record.priority,
            medicalType: record.typeMedical,
            appointment: record.appointmentId ? {
                id: record.appointmentId._id,
                reason: record.appointmentId.reason,
                date: record.appointmentId.start
            } : null,
            documents: record.document || [],
            actions: record.actions || [],
            metadata: {
                priority: record.priority,
                typeMedical: record.typeMedical,
                description: record.description,
                resultDate: record.resultDate,
                actionsCount: record.actions?.length || 0
            },
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
        }));
        combinedHistory.push(...formattedMedicalRecords);
    }

    combinedHistory.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    const stats = {
        total: combinedHistory.length,
        appointments: combinedHistory.filter(item => item.type === 'appointment').length,
        medicalRecords: combinedHistory.filter(item => item.type === 'medical_record').length,
        urgentRecords: combinedHistory.filter(
            item => item.type === 'medical_record' && item.priority === 'Urgent'
        ).length
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedHistory = combinedHistory.slice(skip, skip + parseInt(limit));

    return {
        patient,
        statistics: stats,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: combinedHistory.length,
            totalPages: Math.ceil(combinedHistory.length / parseInt(limit))
        },
        data: paginatedHistory
    };
};


export default {
    createUser,
    deleteUserById,
    getUserById,
    getAllUsers,
    updateUserById,
    searchUsers,
    getPatientHistory,
    createUserPatient,
    getPatients,
    getPatientById
};