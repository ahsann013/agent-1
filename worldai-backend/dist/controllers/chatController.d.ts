declare class ChatController {
    static getAllChats(req: any, res: any): Promise<void>;
    static getChat(req: any, res: any): Promise<any>;
    static createChat(req: any, res: any): Promise<void>;
    static updateChatTitle(req: any, res: any): Promise<any>;
    static archiveChat(req: any, res: any): Promise<any>;
    static deleteChat(req: any, res: any): Promise<any>;
    static addMessage(req: any, res: any): Promise<any>;
    static getChatMessages(req: any, res: any): Promise<any>;
    static updateMessage(req: any, res: any): Promise<any>;
}
export default ChatController;
