import express from "express";
import AuthController from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import verifyRefreshToken from "../middlewares/verifyRefreshToken.js";
import multer from "multer";
import path from "path";
import verifyToken from "../middlewares/verifyToken.js";
const router = express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/profiles/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 15 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."));
        }
    },
});
router.post("/signup", AuthController.signup);
router.get("/verify-email", AuthController.verifyEmail);
router.get("/resend-verification-email", AuthController.resendVerification);
router.post("/login", AuthController.signin);
router.post("/google-auth", verifyToken, AuthController.googleAuth);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);
router.post("/enable-2fa", authMiddleware, AuthController.enable2FA);
router.post("/send-2fa-code", authMiddleware, AuthController.send2FACode);
router.post("/verify-2fa", AuthController.verify2FALogin);
router.post("/resend-2fa-code", AuthController.resend2FACode);
router.post("/disable-2fa", authMiddleware, AuthController.disable2FA);
router.put("/profile", authMiddleware, upload.single("profileImage"), AuthController.updateProfile);
router.post("/change-password", authMiddleware, AuthController.changePassword);
router.post("/verify-password", authMiddleware, AuthController.verifyPassword);
router.post("/refresh", verifyRefreshToken, AuthController.refreshToken);
router.post("/logout", AuthController.logout);
router.get("/profile", authMiddleware, AuthController.getProfile);
export default router;
