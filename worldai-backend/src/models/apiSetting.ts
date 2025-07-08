import { DataTypes, Model } from 'sequelize';
import { IsString, IsBoolean, IsDate, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export default function initApiSettingModel(sequelize) {
    class ApiSetting extends Model {
        // Method to encrypt API key
       
        static async validateApiSetting(settingData) {
            const settingInstance = plainToClass(ApiSetting, settingData);
            const errors = await validate(settingInstance);
            if (errors.length > 0) {
                throw new Error('Validation failed: ' + errors.map(err => err.toString()).join(', '));
            }
        }
    }

    ApiSetting.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            serviceName: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    len: [2, 50],
                },
            },
            apiKey: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                validate: {
                    isBoolean: true,
                },
            },
            systemPrompt: {
                type: DataTypes.TEXT,
                allowNull: true,
                defaultValue: "You are a helpful AI assistant."
            },
            webhookSecret: {
                type: DataTypes.TEXT,
                allowNull: true,
                defaultValue: ""
            },
            model: {
                type: DataTypes.TEXT,
                allowNull: true,
                defaultValue: "gpt-3"
            }
        },
        {
            sequelize,
            modelName: 'ApiSetting',
            tableName: 'api_settings',
            hooks: {
                beforeValidate: async (setting) => {
                    await ApiSetting.validateApiSetting(setting);
                },
            },
            paranoid: true, // Enable soft deletes
        }
    );

    return ApiSetting;
} 