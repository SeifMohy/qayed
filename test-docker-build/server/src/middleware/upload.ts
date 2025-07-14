import multer from 'multer';
import { APP_CONFIG, SUPPORTED_MIME_TYPES } from '../utils/constants.js';

// Configure multer for file uploads with memory storage
export const uploadConfig = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: APP_CONFIG.MAX_FILE_SIZE,
    files: APP_CONFIG.MAX_FILES
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === SUPPORTED_MIME_TYPES.PDF) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
}); 