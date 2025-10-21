import mongoose from "mongoose";

// models
import Role from "../models/roleModel.js";
import User from "../models/userModel.js";
import WorkingHour from "../models/WorkingHourModel.js";
import Holiday from "../models/HolidayModel.js";

const DEFAULT_ADMIN_EMAIL = process.env.INIT_ADMIN_EMAIL || "admin@careflow.local";
const DEFAULT_ADMIN_PASS = process.env.INIT_ADMIN_PASSWORD || "admin123";
const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || "admin";
const DEFAULT_ADMIN_CIN = process.env.DEFAULT_ADMIN_CIN || "AD XXXXXX";
const DEFAULT_ADMIN_BIRTHDATE = process.env.DEFAULT_ADMIN_BIRTHDATE || "1990-01-01";

export default async function initDB() {
    try {
        // Ensure connection ready
        if (mongoose.connection.readyState !== 1) {
            console.log("initDB: mongoose not connected, skipping seeder");
            return;
        }

        // ----- Roles -----
        const rolesCount = await Role.countDocuments();
        if (rolesCount === 0) {
            console.log("initDB: creating default roles...");
            const roles = [
                { name: "admin", description: "Gère les accès" },
                { name: "doctore", description: "Fournit des soins" },
                { name: "infermeri", description: "Assiste les patients" },
                { name: "accueil", description: "Gère l’accueil" },
                { name: "patient", description: "Accède aux soins" },
                { name: "pharmacist", description: "Référentiel des pharmacies partenaires" },
                { name: "responsabe", description: "Responsable de laboratoire" }
            ];

            await Role.insertMany(roles);
            console.log("initDB: roles created");
        }

        // ----- Admin user -----
        const usersCount = await User.countDocuments();
        if (usersCount === 0) {
            console.log("initDB: creating admin user...");
            const adminRole = await Role.findOne({ name: "admin" });
            if (!adminRole) throw new Error("initDB: admin role not found");

            const adminUser = new User({
                name: DEFAULT_ADMIN_NAME,
                email: DEFAULT_ADMIN_EMAIL,
                password: DEFAULT_ADMIN_PASS,
                roleId: adminRole._id,
                status: "active",
                cin: DEFAULT_ADMIN_CIN,
                birthDate: new Date(DEFAULT_ADMIN_BIRTHDATE),
                permissions: {
                    manage_system: true,
                    manage_users_view: true,
                    manage_users_create: true,
                    manage_users_update: true,
                    manage_users_delete: true,
                    manage_users_suspend: true,
                    patient_view: true,
                    patient_create: true,
                    patient_update: true,
                    patient_delete: true,
                    patient_search: true,
                    patient_view_history: true,
                    appointment_view_own: true,
                    appointment_view_all: true,
                    appointment_create: true,
                    appointment_update: true,
                    appointment_cancel: true,
                    consultation_create: true,
                    consultation_view: true,
                    consultation_update: true,
                    document_upload: true,
                    document_view: true,
                    document_delete: true,
                    document_download: true,
                    lab_order_create: true,
                    lab_order_view: true,
                    lab_result_upload: true,
                    lab_result_validate: true,
                    lab_result_view: true,
                    prescription_create: true,
                    prescription_sign: true,
                    prescription_view: true,
                    prescription_assign_pharmacy: true,
                    pharmacy_view_assigned: true,
                    pharmacy_dispense_prescription: true,
                    pharmacy_manage_partners: true,
                }
            });
            await adminUser.save();
            console.log(`initDB: admin created -> ${DEFAULT_ADMIN_EMAIL}`);
        }

        // ----- Working hours -----
        const whCount = await WorkingHour.countDocuments();
        if (whCount === 0) {
            console.log("initDB: creating default working hours...");
            const days = [
                { day: "Lundi", start: "08:00", end: "17:00", active: true },
                { day: "Mardi", start: "08:00", end: "17:00", active: true },
                { day: "Mercredi", start: "08:00", end: "17:00", active: true },
                { day: "Jeudi", start: "08:00", end: "17:00", active: true },
                { day: "Vendredi", start: "08:00", end: "17:00", active: true },
                { day: "Samedi", start: "09:00", end: "13:00", active: true },
                { day: "Dimanche", start: "00:00", end: "00:00", active: false }
            ];
            await WorkingHour.insertMany(days);
            console.log("initDB: working hours created");
        }

        // ----- Holidays -----
        const holCount = await Holiday.countDocuments();
        if (holCount === 0) {
            console.log("initDB: creating sample holiday...");
            await Holiday.create({ date: new Date(), name: "Initial Holiday (sample)", active: false });
            console.log("initDB: holiday created");
        }

        console.log("✅ initDB: finished");
    } catch (err) {
        console.error("initDB error:", err.message || err);
    }
}