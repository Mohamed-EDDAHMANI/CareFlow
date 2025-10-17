import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AppError from '../utils/appError.js';

// Ensure upload directory exists
const uploadDir = 'uploads/medical-records';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`📁 Created upload directory: ${uploadDir}`);
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'medical-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter - accept medical documents and images
const fileFilter = (req, file, cb) => {
    // Accept documents: PDF, DOC, DOCX, images, and medical formats
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|dicom|dcm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new AppError('Only PDF, DOC, DOCX, DICOM, and image files are allowed!', 400, 'INVALID_FILE_TYPE'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 20 * 1024 * 1024, // 20MB max per file (larger for medical images)
        files: 10 // Max 10 files
    },
    fileFilter: fileFilter
});

// Export middleware for multiple documents
export const uploadMedicalDocuments = upload.array('documents', 10);

// Export middleware for single document (for actions)
export const uploadSingleMedicalDocument = upload.single('document');
