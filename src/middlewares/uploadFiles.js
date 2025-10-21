import multer from "multer";
import { s3 } from "../config/s3Config.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // ≤ 20 MB
});

export const uploadFiles = (req, res, next) => {
  const multerUpload = upload.array("documents", 5); // max 5 files

  multerUpload(req, res, async (err) => {
    req.uploadedFiles = [];
    req.errors = [];

    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        req.errors.push({
          fileName: null, // i cant get the file name from multer error so the frent cannot know the file that have the error
          field: err.field,
          message: `Le fichier dépasse la taille maximale autorisée de 20MB`,
        });
      } else {
        req.errors.push({ fileName: null, message: err.message });
      }
    }

    const files = req.files || [];

    for (const file of files) {
      const allowedMimes = ["application/pdf", "image/jpeg", "image/png"];

      if (!allowedMimes.includes(file.mimetype)) {
        req.errors.push({
          fileName: file.originalname,
          message: "Type de fichier non autorisé",
        });
        continue;
      }

      try {
        const ext = path.extname(file.originalname);
        const fileName = `${uuidv4()}${ext}`;

        // Upload to MinIO
        await s3.putObject(
          process.env.MINIO_BUCKET,
          fileName,
          file.buffer,
          { "Content-Type": file.mimetype }
        );

        // Save metadata
        req.uploadedFiles.push({
          originalName: file.originalname,
          fileName,
          mimeType: file.mimetype,
          size: file.size,
        });
      } catch (uploadError) {
        req.errors.push({
          fileName: file.originalname,
          message: uploadError.message,
        });
      }
    }

    next();
  });
};
