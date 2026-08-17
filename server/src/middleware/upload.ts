import multer from "multer";
import os from "os";
import path from "path";
import crypto from "crypto";

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {

    const allowedTypes = [
        // Images
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',      
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv' 
    ];

    if(allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Invalid file type. Only images and documents are allowed.'));
    }
};


const storageDisk = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, os.tmpdir()); // OS temp dir — no hardcoded app path
    },
    filename: (_req, file, cb) => {
        // dynamic, collision-proof name — not tied to any specific backupId
        const uniqueName = `restore_${crypto.randomUUID()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

export const uploadKora = multer({
    storage: storageDisk,
    fileFilter: (_req, file, cb) => {
        if (!file.originalname.endsWith(".kora")) {
            return cb(new Error("Only .kora files are accepted"));
        }
        cb(null, true);
    },
    limits: { fileSize: 500 * 1024 * 1024 }, // adjust as needed
});

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB per file
        fields: 20,                 // max number of non-file fields
        parts: 50
    }
});