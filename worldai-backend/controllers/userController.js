import { User } from "../models/index.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import nodemailer from "nodemailer";
import EmailTemplates from "../utils/emailTemplates.js";

class UserController {
  // Get all users
  static async getAllUsers(req, res) {
    try {
      const { limit = 10, page = 0, query = "" } = req.query;

      // Convert limit and page to integers safely
      const limitInt = parseInt(limit, 10) || 10;
      const pageInt = parseInt(page, 10) || 0;

      // Build where condition with role and optional search on username or email (or any fields)
      const whereCondition = {
        role: "user",
      };

      if (query) {
        // Add search condition (case-insensitive) on username or email (change fields as needed)
        whereCondition[Op.or] = [
          { username: { [Op.iLike]: `%${query}%` } }, // PostgreSQL ILIKE for case-insensitive
          { name: { [Op.iLike]: `%${query}%` } }, // PostgreSQL ILIKE for case-insensitive
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
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  }

  // Get user by ID
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
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Error fetching user" });
    }
  }

  // Create new user
  static async createUser(req, res) {
    const { name, email, username, password, role } = req.body;

    try {
      // Check if email already exists
      const existingUserByEmail = await User.findOne({ where: { email } });
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email is already in use" });
      }

      // Check if username already exists
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
        isActive: true, // Set to true since this is admin creating the user
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
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  }

  // Update user
  static async updateUser(req, res) {
    const { id } = req.params;
    const { name, email, username, role, isActive } = req.body;

    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check email uniqueness if it's being updated
      if (email && email !== user.email) {
        const existingUserByEmail = await User.findOne({ where: { email } });
        if (existingUserByEmail) {
          return res.status(400).json({ message: "Email is already in use" });
        }
      }

      // Check username uniqueness if it's being updated
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
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  }

  // Delete user
  static async deleteUser(req, res) {
    const { id } = req.params;

    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await user.update({ isActive: false });
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
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
    } catch (error) {
      console.error("Error restoring user:", error);
      res.status(500).json({ message: "Error restoring user" });
    }
  }

  static async sendContactEmail(req, res) {
    const { name, email, subject, phone, message } = req.body;

    try {
      // Create transporter using nodemailer
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      });

      // Load and populate the contact email template
      const emailContent = await EmailTemplates.loadTemplate("contact", {
        name,
        subject,
        email,
        message,
        phone,
        date: new Date().toLocaleDateString(),
      });

      // Send email
      await transporter.sendMail({
        from: process.env.MAIL_FROM_ADDRESS,
        to: "alper@awish.com", // The email address where you want to receive contact form submissions
        subject: `Contact Form: ${subject}`,
        html: emailContent,
      });

      res.status(200).json({ message: "Contact email sent successfully" });
    } catch (error) {
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
    } catch (error) {
      console.error("Error fetching user credits:", error);
      res.status(500).json({ message: "Error fetching user credits" });
    }
  }

  // Get total users count
  static async getTotalUsers() {
    return await User.count({
      where: { role: "user" },
    });
  }

  // Get active users count
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
