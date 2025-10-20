import multer from "multer";
import { s3 } from "../config/s3Config.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import AppError from "../utils/appError.js";

// Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // ≤ 20 MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/pdf",
      "image/jpeg",
      "image/png"
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new AppError("Type de fichier non autorisé", 400, 'VALIDATION_ERROR'), false);
    }

    cb(null, true);
  },
});

export const uploadFiles = (req, res, next) => {
  const multerUpload = upload.array("documents", 5); // max 5 files

  multerUpload(req, res, async (err) => {
    if (err) {
      return next(new AppError(`Erreur d'upload: ${err.message}`, 400, 'VALIDATION_ERROR'));
    }

    try {
      const files = req.files || []; 
      const uploadedFiles = [];

      for (const file of files) {
        const ext = path.extname(file.originalname);
        const fileName = `${uuidv4()}${ext}`;

        // Upload to MinIO directly from buffer
        await s3.putObject("documents", fileName, file.buffer);

        // Save metadata
        uploadedFiles.push({
          originalName: file.originalname,
          fileName,
          mimeType: file.mimetype,
          size: file.size,
          url: `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/documents/${fileName}`,
        });
      }

      // Attach file info to req object for controller
      req.uploadedFiles = uploadedFiles; 
      next(); 
    } catch (error) {
      console.error("Erreur lors de l'upload vers S3:", error);
      return next(new AppError(`Erreur serveur: ${error.message}`, 500, 'SERVER_ERROR'));
    }
  });
};
