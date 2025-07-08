import { UserSetting } from '../models/index.js';

class SettingController {
    // Get user settings
    static async getUserSettings(req, res) {
        try {
            const userId = req.user.id;

            // Find or create user settings
            const [userSettings] = await UserSetting.findOrCreate({
                where: { userId },
                defaults: {
                    userId,
                    category: 'General',
                    imageSetting: {
                        width: 1024,
                        height: 1024
                    },
                    videoSetting: {
                        width: 1024,
                        height: 576,
                        duration: 5
                    }
                }
            });

            res.status(200).json(userSettings);
        } catch (error) {
            console.error('Error fetching user settings:', error);
            res.status(500).json({ message: 'Error fetching user settings' });
        }
    }

    // Update user settings
    static async updateUserSettings(req, res) {
        try {
            const userId = req.user.id;
            const { category, imageSetting, videoSetting } = req.body;

            // Find the user's settings
            let userSettings = await UserSetting.findOne({ where: { userId } });

            if (!userSettings) {
                // Create new settings if they don't exist
                userSettings = await UserSetting.create({
                    userId,
                    category: category || 'General',
                    imageSetting,
                    videoSetting
                });
            } else {
                // Update existing settings
                await userSettings.update({
                    category: category || userSettings.category,
                    imageSetting: imageSetting || userSettings.imageSetting,
                    videoSetting: videoSetting || userSettings.videoSetting
                });
            }

            res.status(200).json({
                message: 'Settings updated successfully',
                settings: userSettings
            });
        } catch (error) {
            console.error('Error updating user settings:', error);
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error updating user settings' });
        }
    }
}

export default SettingController;
