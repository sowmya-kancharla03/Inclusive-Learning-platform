import multer from "multer";
import path from "path";

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/assignments");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
    cb(null, true); // Accept all files for now
};

export const upload = multer({ storage, fileFilter });
