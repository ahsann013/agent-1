import { Chat, Message } from '../models/index.js';
class ChatController {
    static async getAllChats(req, res) {
        try {
            const userId = req.user.id;
            const chats = await Chat.findAll({
                where: {
                    userId,
                    deleted: false
                },
                order: [['updatedAt', 'DESC']]
            });
            res.json(chats);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getChat(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const chat = await Chat.findOne({
                where: {
                    id,
                    userId,
                    deleted: false
                },
                include: [{
                        model: Message,
                        as: 'messages',
                        order: [['createdAt', 'ASC']]
                    }]
            });
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }
            res.json(chat);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async createChat(req, res) {
        try {
            const { title } = req.body;
            const userId = req.user.id;
            const chat = await Chat.create({
                title,
                userId,
                archived: false,
                deleted: false
            });
            res.status(201).json(chat);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async updateChatTitle(req, res) {
        try {
            const { id } = req.params;
            const { title } = req.body;
            const userId = req.user.id;
            const chat = await Chat.findOne({
                where: {
                    id,
                    userId,
                    deleted: false
                }
            });
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }
            chat.title = title;
            await chat.save();
            res.json(chat);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async archiveChat(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const chat = await Chat.findOne({
                where: {
                    id,
                    userId,
                    deleted: false
                }
            });
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }
            chat.archived = true;
            await chat.save();
            res.json({ message: 'Chat archived successfully' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async deleteChat(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const chat = await Chat.findOne({
                where: {
                    id,
                    userId
                }
            });
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }
            chat.deleted = true;
            await chat.save();
            res.json({ message: 'Chat deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async addMessage(req, res) {
        try {
            const { id: chatId } = req.params;
            const { content, role, timestamp } = req.body;
            const userId = req.user.id;
            const file = req.file;
            let fileUrl = null;
            let fileType = null;
            if (file) {
                fileUrl = `${process.env.BACKEND_BASE_URL}/uploads/request/${file.filename}`;
                fileType = file.mimetype.split('/')[0];
            }
            const chat = await Chat.findOne({
                where: {
                    id: chatId,
                    userId,
                    deleted: false
                }
            });
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }
            const message = await Message.create({
                chatId,
                content,
                role,
                fileUrl,
                fileType,
                timestamp: timestamp || new Date().toISOString()
            });
            res.status(201).json(message);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getChatMessages(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const chat = await Chat.findOne({
                where: {
                    id,
                    userId,
                    deleted: false
                }
            });
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }
            const messages = await Message.findAll({
                where: {
                    chatId: id
                },
                order: [['createdAt', 'ASC']]
            });
            res.json(messages);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async updateMessage(req, res) {
        try {
            const { id: chatId, messageId } = req.params;
            const { content } = req.body;
            const userId = req.user.id;
            const chat = await Chat.findOne({
                where: {
                    id: chatId,
                    userId,
                    deleted: false
                }
            });
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }
            const message = await Message.findOne({
                where: {
                    id: messageId,
                    chatId
                }
            });
            if (!message) {
                return res.status(404).json({ error: 'Message not found' });
            }
            message.content = content;
            await message.save();
            res.json(message);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
export default ChatController;
