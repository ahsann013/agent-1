import { DataTypes, Model } from 'sequelize';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
export default function initChatModel(sequelize) {
    class Chat extends Model {
        static async validateChat(chatData) {
            const chatInstance = plainToClass(Chat, chatData);
            const errors = await validate(chatInstance);
            if (errors.length > 0) {
                throw new Error('Validation failed: ' + errors.map(err => err.toString()).join(', '));
            }
        }
        getChatDetails() {
            return {
                id: this.id,
                title: this.title,
                archived: this.archived,
                deleted: this.deleted
            };
        }
    }
    Chat.init({
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
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Chat title cannot be empty'
                },
                len: {
                    args: [2, 255],
                    msg: 'Chat title must be between 2 and 255 characters'
                }
            }
        },
        archived: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            validate: {
                isBoolean: {
                    msg: 'Archived must be a boolean value'
                }
            }
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            validate: {
                isBoolean: {
                    msg: 'Deleted must be a boolean value'
                }
            }
        },
    }, {
        sequelize,
        modelName: 'Chat',
        tableName: 'chats',
        hooks: {
            beforeValidate: async (model) => {
                await Chat.validateChat(model);
            }
        },
        paranoid: true,
    });
    return Chat;
}
