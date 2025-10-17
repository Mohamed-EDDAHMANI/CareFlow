import { Router } from 'express';

// ===== Import All Route Files =====
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import permissionsRoutes from './permissionsRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import medicalRecordRoutes from './medicalRecordRoutes.js';
// import notificationRoutes from './notificationRoutes.js';
// import systemRoutes from './systemRoutes.js';
// import searchRoutes from './searchRoutes.js';
// import filterRoutes from './filterRoutes.js';
// import statsRoutes from './statsRoutes.js';

const router = Router();

// ===== Mount Routes =====

// 🔐 Authentication (login, register, refresh, logout)
router.use('/auth', authRoutes);

// // 👥 User Management (CRUD, suspend/activate, profile, search)
router.use('/users', userRoutes);

// // 🛡️ Permissions Management
router.use('/permissions', permissionsRoutes);

// // 📅 Appointment Management (scheduling, availability, status updates)
router.use('/appointments', appointmentRoutes);

// // 🏥 Medical Records (patient history, actions, priority management)
router.use('/medical-records', medicalRecordRoutes);

// // 🔔 Notification Management (email/whatsapp, read status)
// router.use('/notifications', notificationRoutes);

// // ⚙️ System Configuration (working hours, holidays, settings)
// router.use('/system', systemRoutes);

// // ===== Global Utility Routes =====

// router.use('/search', searchRoutes);

// // 🎯 Advanced Filtering
// router.get('/filter', filterRoutes);

// // 📊 Dashboard Statistics
// router.get('/stats', statsRoutes);

export default router;