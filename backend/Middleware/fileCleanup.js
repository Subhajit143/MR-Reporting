// middleware/fileCleanup.js
import fs from 'fs';
import path from 'path';

export const cleanupUploads = (req, res, next) => {
  if (req.files) {
    Object.values(req.files).forEach(fileArray => {
      fileArray.forEach(file => {
        fs.unlink(file.path, err => {
          if (err) console.error('Error deleting temp file:', err);
        });
      });
    });
  }
  next();
};