import { DataTypes, Model } from 'sequelize';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
export default function initUserSettingModel(sequelize) {
    class UserSetting extends Model {
        static async validateUserSetting(settingData) {
            const settingInstance = plainToClass(UserSetting, settingData);
            const errors = await validate(settingInstance);
            if (errors.length > 0) {
                throw new Error('Validation failed: ' + errors.map(err => err.toString()).join(', '));
            }
        }
        getSettingDetails() {
            return {
                id: this.id,
                userId: this.userId,
                category: this.category,
                imageSetting: this.imageSetting,
                videoSetting: this.videoSetting,
                createdAt: this.createdAt,
                updatedAt: this.updatedAt
            };
        }
    }
    UserSetting.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isInt: {
                    msg: 'User ID must be an integer'
                }
            }
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Category cannot be empty'
                }
            }
        },
        imageSetting: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {
                width: 1024,
                height: 1024
            },
            validate: {
                isValidImageSetting(value) {
                    if (value) {
                        if (!value.width || !value.height) {
                            throw new Error('Image settings must include width and height');
                        }
                        if (typeof value.width !== 'number' || typeof value.height !== 'number') {
                            throw new Error('Width and height must be numbers');
                        }
                        if (value.width < 64 || value.width > 2048 || value.height < 64 || value.height > 2048) {
                            throw new Error('Width and height must be between 64 and 2048');
                        }
                    }
                }
            }
        },
        videoSetting: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {
                width: 1024,
                height: 576,
                duration: 5
            },
            validate: {
                isValidVideoSetting(value) {
                    if (value) {
                        if (!value.width || !value.height || !value.duration) {
                            throw new Error('Video settings must include width, height, and duration');
                        }
                        if (typeof value.width !== 'number' || typeof value.height !== 'number' ||
                            typeof value.duration !== 'number') {
                            throw new Error('All video settings must be numbers');
                        }
                        if (value.width < 64 || value.width > 2048 || value.height < 64 || value.height > 2048) {
                            throw new Error('Width and height must be between 64 and 2048');
                        }
                        if (value.duration < 1 || value.duration > 200) {
                            throw new Error('Duration must be between 1 and 200');
                        }
                    }
                }
            }
        }
    }, {
        sequelize,
        modelName: 'UserSetting',
        tableName: 'user_settings',
        hooks: {
            beforeValidate: async (model) => {
                await UserSetting.validateUserSetting(model);
            }
        },
        paranoid: true
    });
    return UserSetting;
}
