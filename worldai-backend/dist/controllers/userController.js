import { User } from "../models/index.js";
import { Op } from "sequelize";
import nodemailer from "nodemailer";
import EmailTemplates from "../utils/emailTemplates.js";
class UserController {
    static async getAllUsers(req, res) {
        try {
            const { limit = 10, page = 0, query = "" } = req.query;
            const limitInt = parseInt(limit, 10) || 10;
            const pageInt = parseInt(page, 10) || 0;
            const whereCondition = {
                role: "user",
            };
            if (query) {
                whereCondition[Op.or] = [
                    { username: { [Op.iLike]: `%${query}%` } },
                    { name: { [Op.iLike]: `%${query}%` } },
                    { email: { [Op.iLike]: `%${query}%` } },
                ];
            }
            const users = await User.findAll({
                where: whereCondition,
                limit: limitInt,
                offset: pageInt * limitInt,
                attributes: {
                    exclude: [
                        "password",
                        "refreshToken",
                        "resetPasswordToken",
                        "resetPasswordExpires",
                        "otp",
                        "otpExpiry",
                    ],
                },
            });
            const usersCount = await User.count({
                where: whereCondition,
                attributes: {
                    exclude: [
                        "password",
                        "refreshToken",
                        "resetPasswordToken",
                        "resetPasswordExpires",
                        "otp",
                        "otpExpiry",
                    ],
                },
            });
            res.status(200).json({
                data: users,
                total: usersCount,
            });
        }
        catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ message: "Error fetching users" });
        }
    }
    static async getUserById(req, res) {
        const { id } = req.params;
        try {
            const user = await User.findByPk(id, {
                attributes: {
                    exclude: [
                        "password",
                        "refreshToken",
                        "resetPasswordToken",
                        "resetPasswordExpires",
                        "otp",
                        "otpExpiry",
                    ],
                },
            });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json(user);
        }
        catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ message: "Error fetching user" });
        }
    }
    static async createUser(req, res) {
        const { name, email, username, password, role } = req.body;
        try {
            const existingUserByEmail = await User.findOne({ where: { email } });
            if (existingUserByEmail) {
                return res.status(400).json({ message: "Email is already in use" });
            }
            const existingUserByUsername = await User.findOne({
                where: { username },
            });
            if (existingUserByUsername) {
                return res.status(400).json({ message: "Username is already taken" });
            }
            const user = await User.create({
                name,
                email,
                username,
                password,
                role: role || "user",
                isActive: true,
                isEmailVerified: true
            });
            res.status(201).json({
                message: "User created successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    isActive: user.isActive,
                },
            });
        }
        catch (error) {
            console.error("Error creating user:", error);
            res.status(500).json({ message: "Error creating user" });
        }
    }
    static async updateUser(req, res) {
        const { id } = req.params;
        const { name, email, username, role, isActive } = req.body;
        try {
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            if (email && email !== user.email) {
                const existingUserByEmail = await User.findOne({ where: { email } });
                if (existingUserByEmail) {
                    return res.status(400).json({ message: "Email is already in use" });
                }
            }
            if (username && username !== user.username) {
                const existingUserByUsername = await User.findOne({
                    where: { username },
                });
                if (existingUserByUsername) {
                    return res.status(400).json({ message: "Username is already taken" });
                }
            }
            await user.update({
                name: name || user.name,
                email: email || user.email,
                username: username || user.username,
                role: role || user.role,
                isActive: isActive !== undefined ? isActive : user.isActive,
            });
            res.status(200).json({
                message: "User updated successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    isActive: user.isActive,
                },
            });
        }
        catch (error) {
            console.error("Error updating user:", error);
            res.status(500).json({ message: "Error updating user" });
        }
    }
    static async deleteUser(req, res) {
        const { id } = req.params;
        try {
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            await user.update({ isActive: false });
            res.status(200).json({ message: "User deleted successfully" });
        }
        catch (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ message: "Error deleting user" });
        }
    }
    static async restoreUser(req, res) {
        const { id } = req.params;
        try {
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            await user.update({ isActive: true });
            res.status(200).json({ message: "User restored successfully" });
        }
        catch (error) {
            console.error("Error restoring user:", error);
            res.status(500).json({ message: "Error restoring user" });
        }
    }
    static async sendContactEmail(req, res) {
        const { name, email, subject, phone, message } = req.body;
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.MAIL_HOST,
                port: process.env.MAIL_PORT,
                secure: false,
                auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD,
                },
            });
            const emailContent = await EmailTemplates.loadTemplate("contact", {
                name,
                subject,
                email,
                message,
                phone,
                date: new Date().toLocaleDateString(),
            });
            await transporter.sendMail({
                from: process.env.MAIL_FROM_ADDRESS,
                to: "alper@awish.com",
                subject: `Contact Form: ${subject}`,
                html: emailContent,
            });
            res.status(200).json({ message: "Contact email sent successfully" });
        }
        catch (error) {
            console.error("Error sending contact email:", error);
            res.status(500).json({ message: "Error sending contact email" });
        }
    }
    static async getCredits(req, res) {
        const { id } = req.user;
        try {
            const user = await User.findByPk(id, {
                attributes: [
                    "id",
                    "name",
                    "email",
                    "username",
                    "role",
                    "isActive",
                    "credits",
                ],
            });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({
                message: "User credits fetched successfully",
                credits: user.credits,
            });
        }
        catch (error) {
            console.error("Error fetching user credits:", error);
            res.status(500).json({ message: "Error fetching user credits" });
        }
    }
    static async getTotalUsers() {
        return await User.count({
            where: { role: "user" },
        });
    }
    static async getActiveUsers() {
        return await User.count({
            where: {
                role: "user",
                isActive: true,
            },
        });
    }
}
export default UserController;
