import { User } from "../models/index.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import fs from "fs";
import EmailTemplates from "../utils/emailTemplates.js";
import StripeController from "./stripeController.js";
dotenv.config();
const emailConfig = {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
};
const transporter = nodemailer.createTransport(emailConfig);
class AuthController {
    static async sendConfirmationEmail(user) {
        const token = String(crypto.randomBytes(32).toString("hex"));
        const verificationUrl = `${process.env.BACKEND_API_URL}/auth/verify-email?token=${token}&email=${user.email}`;
        user.verificationToken = token;
        await user.save();
        const emailTemplate = await EmailTemplates.loadTemplate("verification", {
            verificationUrl,
            year: new Date().getFullYear(),
        });
        const mailOptions = {
            from: process.env.MAIL_FROM_ADDRESS,
            to: user.email,
            subject: "Verify Your Email - Awish AI",
            html: emailTemplate,
        };
        try {
            await transporter.sendMail(mailOptions);
            console.log("Email sent successfully");
        }
        catch (error) {
            console.error("Error sending email:", error);
            throw new Error(`Error sending email: ${error.message}`);
        }
    }
    static async createStripeCustomer(name, email) {
        try {
            const stripe = await StripeController.initializeStripe();
            const customer = await stripe.customers.create({
                email,
                name,
                description: "Customer created during registration",
            });
            return customer.id;
        }
        catch (error) {
            console.error("Error creating Stripe customer:", error);
            return null;
        }
    }
    static async signup(req, res) {
        const { name, email, password, username } = req.body;
        const ipAddress = AuthController.getIP(req);
        console.log(ipAddress);
        try {
            const existingUserByEmail = await User.findOne({ where: { email } });
            if (existingUserByEmail) {
                return res.status(400).json({ message: "Email is already in use." });
            }
            const existingUserByUsername = await User.findOne({
                where: { username },
            });
            if (existingUserByUsername) {
                return res.status(400).json({ message: "Username is already taken." });
            }
            const existingUserByIP = await User.findOne({ where: { ipAddress } });
            if (existingUserByIP) {
                return res
                    .status(400)
                    .json({ message: "Only one account is allowed per IP address." });
            }
            const stripeCustomerId = await AuthController.createStripeCustomer(name, email);
            const newUser = await User.create({
                name,
                email,
                username,
                password,
                role: "user",
                credits: 50,
                stripeCustomerId,
                ipAddress,
            });
            await AuthController.sendConfirmationEmail(newUser);
            res.status(201).json({
                message: "Signed up successfully. Please check your email for verification.",
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    username: newUser.username,
                    isActive: newUser.isActive,
                    role: newUser.role,
                },
            });
        }
        catch (error) {
            console.error("Error creating user:", error);
            res
                .status(500)
                .json({ message: `Internal server error: ${error.message}` });
        }
    }
    static async verifyEmail(req, res) {
        const { token, email } = req.query;
        try {
            const user = await User.findOne({
                where: { email, verificationToken: token },
            });
            if (!user) {
                return res.status(400).send(`
                    <html>
                    <head>
                        <title>Email Verification Failed</title>
                        <style>
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                                background-color: #121212;
                                color: #e0e0e0;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                            }
                            .container {
                                background-color: #1e1e1e;
                                padding: 2rem;
                                border-radius: 8px;
                                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                                text-align: center;
                                max-width: 400px;
                            }
                            .error-icon {
                                color: #d32f2f;
                                font-size: 48px;
                                margin-bottom: 1rem;
                            }
                            h1 {
                                color: #d32f2f;
                                margin-bottom: 1rem;
                            }
                            p {
                                margin-bottom: 1.5rem;
                                line-height: 1.5;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="error-icon">❌</div>
                            <h1>Verification Failed</h1>
                            <p>Invalid or expired verification link. Please request a new verification email.</p>
                        </div>
                    </body>
                    </html>
                `);
            }
            await user.update({
                isActive: true,
                isEmailVerified: true,
                verificationToken: null,
            });
            res.redirect(`${process.env.FRONTEND_URL}/login`);
        }
        catch (error) {
            console.error("Error verifying email:", error);
            res.status(500).send(`
                <html>
                <head>
                    <title>Server Error</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                            background-color: #121212;
                            color: #e0e0e0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                        }
                        .container {
                            background-color: #1e1e1e;
                            padding: 2rem;
                            border-radius: 8px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                            text-align: center;
                            max-width: 400px;
                        }
                        .error-icon {
                            color: #d32f2f;
                            font-size: 48px;
                            margin-bottom: 1rem;
                        }
                        h1 {
                            color: #d32f2f;
                            margin-bottom: 1rem;
                        }
                        p {
                            margin-bottom: 1.5rem;
                            line-height: 1.5;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="error-icon">❌</div>
                        <h1>Server Error</h1>
                        <p>An error occurred while verifying your email. Please try again later.</p>
                    </div>
                </body>
                </html>
            `);
        }
    }
    static async signin(req, res) {
        const { username, password } = req.body;
        try {
            const user = await User.findOne({
                where: {
                    [Op.or]: [
                        { username: username },
                        { email: username },
                    ],
                },
            });
            if (!user || !user?.isActive) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            if (!user.isEmailVerified) {
                return res.status(403).json({
                    message: "Account is not activated. Please verify your email.",
                });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            const token = jwt.sign({
                id: user.id,
                email: user.email,
                role: user.role,
                username: user.username,
            }, process.env.JWT_SECRET, { expiresIn: "24h" });
            const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
            await user.update({ refreshToken, lastLogin: new Date() });
            const data = {
                message: "Login successful",
                user: user,
                token,
                refreshToken,
            };
            if (user.isFirstLogin) {
                await user.update({ isFirstLogin: false });
                data.isFirstLogin = true;
            }
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Error signing in:", error);
            res
                .status(500)
                .json({ message: `Internal server error: ${error.message}` });
        }
    }
    static async forgotPassword(req, res) {
        const { email } = req.body;
        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const resetToken = crypto.randomBytes(32).toString("hex");
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${user.email}`;
            await user.update({
                resetPasswordToken: resetToken,
                resetPasswordExpires: Date.now() + 3600000,
            });
            const emailTemplate = await EmailTemplates.loadTemplate("reset-password", {
                resetUrl,
                year: new Date().getFullYear(),
            });
            const mailOptions = {
                from: process.env.MAIL_FROM_ADDRESS,
                to: user.email,
                subject: "Password Reset - AWISH AI",
                html: emailTemplate,
            };
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: "Password reset email sent" });
        }
        catch (error) {
            console.error("Error in forgotPassword:", error);
            res.status(500).json({ message: "Error processing request" });
        }
    }
    static async resetPassword(req, res) {
        const { token, email, newPassword } = req.body;
        try {
            const user = await User.findOne({
                where: {
                    email,
                    resetPasswordToken: token,
                    resetPasswordExpires: { [Op.gt]: Date.now() },
                },
            });
            if (!user) {
                return res.status(400).json({ message: "Invalid or expired token" });
            }
            await user.update({
                resetPasswordToken: null,
                resetPasswordExpires: null,
                password: newPassword,
            });
            res.status(200).json({ message: "Password reset successful" });
        }
        catch (error) {
            console.error("Error in resetPassword:", error);
            res.status(500).json({ message: "Error resetting password" });
        }
    }
    static async resendVerification(req, res) {
        const { email } = req.body;
        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            if (user.isActive) {
                return res.status(400).json({ message: "Account is already verified" });
            }
            await AuthController.sendConfirmationEmail(user);
            res.status(200).json({ message: "Verification email resent" });
        }
        catch (error) {
            console.error("Error in resendVerification:", error);
            res.status(500).json({ message: "Error resending verification email" });
        }
    }
    static async changePassword(req, res) {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res
                    .status(401)
                    .json({ message: "Current password is incorrect" });
            }
            user.password = newPassword;
            await user.save();
            res.status(200).json({ message: "Password changed successfully" });
        }
        catch (error) {
            console.error("Error in changePassword:", error);
            res.status(500).json({ message: "Error changing password" });
        }
    }
    static async enable2FA(req, res) {
        const userId = req.user.id;
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            await user.update({ isTwoFactorEnabled: true });
            res.status(200).json({
                message: "2FA setup initiated",
            });
        }
        catch (error) {
            console.error("Error in enable2FA:", error);
            res.status(500).json({ message: "Error enabling 2FA" });
        }
    }
    static async send2FACode(req, res) {
        const userId = req.user.id;
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
            await user.update({
                otp: await bcrypt.hash(otp, 10),
                otpExpiry,
            });
            const emailTemplate = await EmailTemplates.loadTemplate("2fa-code", {
                otpCode: otp,
                year: new Date().getFullYear(),
            });
            const mailOptions = {
                from: process.env.MAIL_FROM_ADDRESS,
                to: user.email,
                subject: "2FA Code - AWISH AI",
                html: emailTemplate,
            };
            await transporter.sendMail(mailOptions);
            res.status(200).json({
                message: "OTP sent successfully",
                expiresIn: 300,
            });
        }
        catch (error) {
            console.error("Error sending 2FA code:", error);
            res.status(500).json({ message: "Error sending 2FA code" });
        }
    }
    static async verify2FALogin(req, res) {
        const { email, otp } = req.body;
        try {
            const user = await User.findOne({
                where: {
                    email,
                    otpExpiry: {
                        [Op.gt]: new Date(),
                    },
                },
            });
            if (!user) {
                return res.status(400).json({ message: "Invalid or expired OTP" });
            }
            const isValidOTP = await bcrypt.compare(otp, user.otp);
            if (!isValidOTP) {
                return res.status(401).json({ message: "Invalid OTP" });
            }
            await user.update({
                otp: null,
                otpExpiry: null,
            });
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });
            const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
            await user.update({ refreshToken });
            res.status(200).json({
                message: "2FA verification successful",
                token,
                refreshToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    isActive: user.isActive,
                    role: user.role,
                },
            });
        }
        catch (error) {
            console.error("Error in verify2FALogin:", error);
            res.status(500).json({ message: "Error verifying 2FA code" });
        }
    }
    static async resend2FACode(req, res) {
        const { email } = req.body;
        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
            await user.update({
                otp: await bcrypt.hash(otp, 10),
                otpExpiry,
            });
            const emailTemplate = await EmailTemplates.loadTemplate("2fa-code", {
                otpCode: otp,
                year: new Date().getFullYear(),
            });
            const mailOptions = {
                from: process.env.MAIL_FROM_ADDRESS,
                to: user.email,
                subject: "New 2FA Code - AWISH AI",
                html: emailTemplate,
            };
            await transporter.sendMail(mailOptions);
            res.status(200).json({
                message: "New OTP sent successfully",
                expiresIn: 300,
            });
        }
        catch (error) {
            console.error("Error resending 2FA code:", error);
            res.status(500).json({ message: "Error resending 2FA code" });
        }
    }
    static async disable2FA(req, res) {
        const userId = req.user.id;
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            user.twoFactorSecret = null;
            user.isTwoFactorEnabled = false;
            await user.save();
            res.status(200).json({ message: "2FA disabled successfully" });
        }
        catch (error) {
            console.error("Error in disable2FA:", error);
            res.status(500).json({ message: "Error disabling 2FA" });
        }
    }
    static async refreshToken(req, res) {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is required" });
        }
        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const user = await User.findByPk(decoded.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const newToken = jwt.sign({
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            }, process.env.JWT_SECRET, { expiresIn: "24h" });
            res.json({
                token: newToken,
            });
        }
        catch (error) {
            console.error("Error refreshing token:", error);
            res.status(401).json({ message: "Invalid or expired refresh token" });
        }
    }
    static async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            await User.update({ refreshToken: null }, { where: { refreshToken } });
            res.status(200).json({ message: "Logged out successfully" });
        }
        catch (error) {
            console.error("Error logging out:", error);
            res.status(500).json({ message: "Error logging out" });
        }
    }
    static async updateProfile(req, res) {
        const userId = req.user.id;
        const { name, email, username, phone, profileImage } = req.body;
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            if (email && email !== user.email) {
                const existingUserWithEmail = await User.findOne({ where: { email } });
                if (existingUserWithEmail) {
                    return res.status(400).json({ message: "Email is already in use" });
                }
            }
            if (username && username !== user.username) {
                const existingUserWithUsername = await User.findOne({
                    where: { username },
                });
                if (existingUserWithUsername) {
                    return res.status(400).json({ message: "Username is already taken" });
                }
            }
            const updateData = {};
            if (name)
                updateData.name = name;
            if (email)
                updateData.email = email;
            if (username)
                updateData.username = username;
            if (phone)
                updateData.phone = phone;
            if (profileImage) {
                const base64Data = profileImage.split(";base64,").pop();
                const filename = `${Date.now()}-${userId}.png`;
                const filePath = `uploads/profiles/${filename}`;
                if (!fs.existsSync("uploads/profiles")) {
                    fs.mkdirSync("uploads/profiles", { recursive: true });
                }
                fs.writeFileSync(filePath, base64Data, { encoding: "base64" });
                const imageUrl = `${process.env.BACKEND_BASE_URL}/${filePath}`;
                updateData.profileImage = imageUrl;
            }
            await user.update(updateData);
            res.status(200).json({
                message: "Profile updated successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    phone: user.phone,
                    profileImage: user.profileImage,
                    isActive: user.isActive,
                    role: user.role,
                    isTwoFactorEnabled: user.isTwoFactorEnabled,
                },
            });
        }
        catch (error) {
            console.error("Error updating profile:", error);
            res
                .status(500)
                .json({ message: `Error updating profile: ${error.message}` });
        }
    }
    static async verifyPassword(req, res) {
        const userId = req.user.id;
        const { password } = req.body;
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            res.status(200).json({
                isValid: isMatch,
                message: isMatch ? "Password is valid" : "Password is invalid",
            });
        }
        catch (error) {
            console.error("Error verifying password:", error);
            res.status(500).json({ message: "Error verifying password" });
        }
    }
    static async googleAuth(req, res) {
        try {
            const { name, email, picture } = req.user;
            let user = await User.findOne({ where: { email } });
            let userId;
            if (!user) {
                const stripeCustomerId = await AuthController.createStripeCustomer(name, email);
                const newUser = await User.create({
                    name,
                    email,
                    username: email.split("@")[0],
                    profileImage: picture,
                    role: "user",
                    isActive: true,
                    credits: 50,
                    isTwoFactorEnabled: false,
                    isGoogleUser: true,
                    stripeCustomerId,
                });
                userId = newUser.id;
                user = newUser;
            }
            else {
                userId = user.id;
                if (!user.stripeCustomerId) {
                    const stripeCustomerId = await AuthController.createStripeCustomer(name, email);
                    await user.update({ stripeCustomerId });
                }
            }
            const token = jwt.sign({
                id: userId,
                email: email,
                role: user.role,
            }, process.env.JWT_SECRET, { expiresIn: "24h" });
            const data = {
                status: 200,
                message: "Google auth successful",
                user,
                token,
                redirectLink: `/chat/new`,
            };
            if (user.isFirstLogin) {
                await user.update({ isFirstLogin: false });
                data.isFirstLogin = true;
            }
            res.status(200).json(data);
        }
        catch (error) {
            console.error("Google auth error:", error);
            res.status(500).json({ message: "Authentication failed" });
        }
    }
    static async getProfile(req, res) {
        try {
            const user = await User.findByPk(req.user.id, {
                attributes: {
                    exclude: ["password", "refreshToken", "otp", "otpExpiry"],
                },
            });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({ user });
        }
        catch (error) {
            console.error("Error fetching profile:", error);
            res.status(500).json({ message: "Error fetching profile" });
        }
    }
    static getIP(req) {
        const forwardedFor = req.headers["x-forwarded-for"];
        if (forwardedFor) {
            return forwardedFor.split(",")[0].trim();
        }
        const realIP = req.headers["x-real-ip"];
        if (realIP) {
            return realIP;
        }
        const ip = req.ip || req.connection.remoteAddress;
        if (ip === "::1" || ip === "::ffff:127.0.0.1") {
            return "127.0.0.1";
        }
        return ip;
    }
}
export default AuthController;
