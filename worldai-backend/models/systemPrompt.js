import { DataTypes, Model } from 'sequelize';

export default function initSystemPromptModel(sequelize) {
    class SystemPrompt extends Model {
        // Add any custom methods if required
    }

    SystemPrompt.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    len: [2, 100], // You can adjust the length
                },
            },
            prompt: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                validate: {
                    isBoolean: true,
                },
            },
            isDefault: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                validate: {
                    isBoolean: true,
                },
            },
            category: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'General',
                validate: {
                    notEmpty: true,
                },
            },
        },
        {
            sequelize,
            modelName: 'SystemPrompt',
            tableName: 'system_prompts',
            paranoid: true, // Enable soft deletes if needed
        }
    );

    return SystemPrompt;
}

    
