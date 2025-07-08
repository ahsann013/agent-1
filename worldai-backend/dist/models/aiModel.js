import { DataTypes, Model } from 'sequelize';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
export default function initAiModelModel(sequelize) {
    class AiModel extends Model {
        static async validateAiModel(modelData) {
            const modelInstance = plainToClass(AiModel, modelData);
            const errors = await validate(modelInstance);
            if (errors.length > 0) {
                throw new Error('Validation failed: ' + errors.map(err => err.toString()).join(', '));
            }
        }
    }
    AiModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: {
                    msg: 'Model name cannot be empty'
                },
                len: {
                    args: [2, 100],
                    msg: 'Model name must be between 2 and 100 characters'
                }
            }
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Type cannot be empty'
                },
                len: {
                    args: [2, 50],
                    msg: 'Type must be between 2 and 50 characters'
                }
            }
        },
        isDefault: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            validate: {
                isBoolean: {
                    msg: 'isDefault must be a boolean value'
                }
            }
        },
        provider: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            allowNull: false,
            defaultValue: 'active'
        },
        isPremium: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            validate: {
                isBoolean: {
                    msg: 'isPremium must be a boolean value'
                }
            }
        }
    }, {
        sequelize,
        modelName: 'AiModel',
        tableName: 'ai_models',
        hooks: {
            beforeValidate: async (model) => {
                await AiModel.validateAiModel(model);
            }
        },
    });
    return AiModel;
}
