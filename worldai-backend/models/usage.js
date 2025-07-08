import { DataTypes, Model } from 'sequelize';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export default function initUsageModel(sequelize) {
    class Usage extends Model {
        // Custom validation logic
        static async validateUsage(usageData) {
            const usageInstance = plainToClass(Usage, usageData);
            const errors = await validate(usageInstance);
            if (errors.length > 0) {
                throw new Error('Validation failed: ' + errors.map(err => err.toString()).join(', '));
            }
        }
    }

    Usage.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            promptTokens: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            completionTokens: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            totalTokens: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            toolCalls: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            toolUsage: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'JSON string containing details of tools used and their credit costs'
            },
            creditsUsed: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: 'Number of credits deducted for this usage'
            },
            sessionId: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Session identifier to group related usage records'
            },
            functionName: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Name of the specific function or API called'
            },
            creditCost: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Credit cost for this specific function call'
            },
            requestPayload: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'JSON of the request parameters (sanitized)'
            },
            usageMetadata: {
                type: DataTypes.JSONB,
                allowNull: true,
                comment: 'Additional metadata about the usage (e.g., model used, service provider)'
            },
            status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        },
        {
            sequelize,
            modelName: 'Usage',
            tableName: 'usages',
            hooks: {
                beforeCreate: async (usage) => {
                    await Usage.validateUsage(usage);
                },
                beforeUpdate: async (usage) => {
                    await Usage.validateUsage(usage);
                }
            },
            indexes: [
                {
                    fields: ['functionName']
                },
                {
                    fields: ['userId', 'createdAt']
                }
            ]
        }
    );

    return Usage;
}
