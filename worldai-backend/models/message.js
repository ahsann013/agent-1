import { DataTypes, Model } from 'sequelize';
import { IsString, IsBoolean, IsInt, IsEnum, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export default function initMessageModel(sequelize) {
    class Message extends Model {
        // Custom validation logic
        static async validateMessage(messageData) {
            const messageInstance = plainToClass(Message, messageData);
            const errors = await validate(messageInstance);
            if (errors.length > 0) {
                throw new Error('Validation failed: ' + errors.map(err => err.toString()).join(', '));
            }
        }

        // Method to get message details
        getMessageDetails() {
            return {
                id: this.id,
                chatId: this.chatId,
                sender: this.sender,
                content: this.content,
                createdAt: this.createdAt
            };
        }
    }

    Message.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            timestamp: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            chatId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    isInt: {
                        msg: 'Chat ID must be an integer'
                    }
                }
            },
            role: {
                type: DataTypes.ENUM('user', 'assistant'),
                allowNull: false,
                validate: {
                    isIn: {
                        args: [['user', 'assistant']],
                        msg: 'Sender must be either "user" or "chatbot"'
                    }
                }
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: {
                        msg: 'Message content cannot be empty'
                    }
                }
            },
            fileUrl: {
                type: DataTypes.STRING,
                allowNull: true
            },
            fileType: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    isIn: {
                        args: [['image', 'video', 'audio', null]],
                        msg: 'File type must be either "image", "video", "audio", or null'
                    }
                }
            }
        },
        {
            sequelize,
            modelName: 'Message',
            tableName: 'messages',
            hooks: {
                beforeValidate:  async (model) => {
                    await Message.validateMessage(model);
                }
            },
            paranoid: true, // soft delete
        }
    );

    return Message;
}
