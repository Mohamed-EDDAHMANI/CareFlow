// backend/upload.js
import multer from 'multer';

// Configure storage
const storage = multer.diskStorage({
  destination: 'uploads/',        // Folder to save uploaded files
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  }
});

const upload = multer({ storage });

export default upload;
