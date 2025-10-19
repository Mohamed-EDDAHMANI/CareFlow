import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AppError from '../utils/appError.js';

// Ensure upload directory exists
const uploadDir = 'uploads/appointments';
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
        cb(null, 'appointment-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter - accept only specific file types
const fileFilter = (req, file, cb) => {
    // Accept documents: PDF, DOC, DOCX, images
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        console.log(`✅ File accepted: ${file.originalname}`);
        return cb(null, true);
    } else {
        console.log(`❌ File rejected: ${file.originalname} (type not allowed)`);
        cb(new Error('Only PDF, DOC, DOCX, and image files are allowed!'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 10 * 1024 * 1024, // 10MB max per file
        files: 5 // Max 5 files
    },
    fileFilter: fileFilter
});

// Export middleware for multiple documents with error handling
export const uploadAppointmentDocuments = (req, res, next) => {
    const uploadMiddleware = upload.array('documents', 5);
    
    uploadMiddleware(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('❌ Multer error:', err.code);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    error: 'FILE_TOO_LARGE',
                    message: 'File size exceeds 10MB limit'
                });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    error: 'TOO_MANY_FILES',
                    message: 'Maximum 5 files allowed'
                });
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({
                    success: false,
                    error: 'UNEXPECTED_FIELD',
                    message: 'Field name must be "documents"'
                });
            }
            return res.status(400).json({
                success: false,
                error: err.code,
                message: err.message
            });
        } else if (err) {
            console.error('❌ Upload error:', err.message);
            return res.status(400).json({
                success: false,
                error: 'UPLOAD_ERROR',
                message: err.message
            });
        }
        
        // Log successful upload
        if (req.files && req.files.length > 0) {
            console.log(`✅ ${req.files.length} file(s) uploaded successfully to ${uploadDir}`);
            req.files.forEach(file => {
                console.log(`   📄 ${file.filename} → ${file.path} (${(file.size / 1024).toFixed(2)} KB)`);
            });
        } else {
            console.log('ℹ️  No files uploaded (optional)');
        }
        
        next();
    });
};

// Export middleware for single document (optional)
export const uploadSingleDocument = upload.single('document');
