import express from 'express';
import multer from 'multer';
import ChatController from '../controllers/chatController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/request/') // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // Increased to 50MB for media files
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            // Images
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml',
            // Audio
            'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/mp3', 'audio/midi', 'audio/pcm',
            // Video
            'video/mp4', 'video/avi', 'video/mkv', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
            // Documents
            'application/pdf', 'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, audio, video, and documents are allowed.'));
        }
    }
});

// Apply authentication middleware to all chat routes
router.use(authMiddleware);

// Chat routes
router.get('/', ChatController.getAllChats);
router.get('/:id', ChatController.getChat);
router.post('/', ChatController.createChat);
router.put('/:id', ChatController.updateChatTitle);
router.put('/:id/archive', ChatController.archiveChat);
router.delete('/:id', ChatController.deleteChat);

// Message routes
router.post('/:id/messages', upload.single('file'), ChatController.addMessage);
router.get('/:id/messages', ChatController.getChatMessages);

// Add a dedicated upload route for chat messages
router.post('/:id/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileUrl = `${process.env.BACKEND_BASE_URL}/uploads/request/${req.file.filename}`;
        const fileType = req.file.mimetype.split('/')[0];

        res.status(201).json({
            fileUrl,
            fileType,
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 