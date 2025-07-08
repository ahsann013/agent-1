import { Usage, User } from "../models/index.js";
import { Op } from "sequelize";

class UsageController {
  // Get all usage records
  static async getAllUsage(req, res) {
    try {
      const usages = await Usage.findAll({
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      if (!usages || usages.length === 0) {
        return res.status(404).json({ message: "No usage records found" });
      }

      // Group usages by user and calculate totals
      const userUsageMap = usages.reduce((map, usage) => {
        const userId = usage.user.id;
        if (!map[userId]) {
          map[userId] = {
            user: usage.user,
            individualUsages: [],
            totalUsage: {}, // Initialize as empty object
          };
        }
        map[userId].individualUsages.push(usage);

        // Sum up all fields in the usage object
        for (const [key, value] of Object.entries(usage.dataValues)) {
          if (typeof value === "number" && key !== "id") {
            map[userId].totalUsage[key] =
              (map[userId].totalUsage[key] || 0) + value;
          }
        }

        return map;
      }, {});

      // Convert map to array of user usage summaries
      const userUsageSummaries = Object.values(userUsageMap);

      res.status(200).json(userUsageSummaries);
    } catch (error) {
      console.error("Error fetching usage:", error);
      res.status(500).json({ message: "Error fetching usage records" });
    }
  }

  // Get usage by user ID
  static async getUsageByUserId(req, res) {
    const { userId } = req.params;
    try {
      const usages = await Usage.findAll({
        where: { userId },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      if (!usages || usages.length === 0) {
        return res
          .status(404)
          .json({ message: "No usage records found for this user" });
      }

      res.status(200).json(usages);
    } catch (error) {
      console.error("Error fetching user usage:", error);
      res.status(500).json({ message: "Error fetching user usage records" });
    }
  }

  // Get single usage record by ID
  static async getUsageById(req, res) {
    const { id } = req.params;
    try {
      const usage = await Usage.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "email"],
          },
        ],
      });

      if (!usage) {
        return res.status(404).json({ message: "Usage record not found" });
      }

      res.status(200).json(usage);
    } catch (error) {
      console.error("Error fetching usage record:", error);
      res.status(500).json({ message: "Error fetching usage record" });
    }
  }

  // Get total credits across all users
  static async getTotalCredits() {
    const result = await User.sum("credits", {
      where: { role: "user" },
    });
    return result || 0;
  }

  // Get total usage across all users
  static async getTotalUsage() {
    const result = await Usage.sum("creditsUsed", {
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });
    return result || 0;
  }
}

export default UsageController;
