import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import initUserModel from './user.js';
import initApiSettingModel from './apiSetting.js';
import initAiModelModel from './aiModel.js';
import initSystemPromptModel from './systemPrompt.js';
import initChatModel from './chat.js';
import initMessageModel from './message.js';
import initUserSettingModel from './userSetting.js';
import initUsageModel from './usage.js';
import initProductModel from './product.js';
import initServicePricingModel from './servicePricing.js';
dotenv.config();
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    define: {
        logging: false,
        timestamps: true,
    },
});
const User = initUserModel(sequelize);
const ApiSetting = initApiSettingModel(sequelize);
const AiModel = initAiModelModel(sequelize);
const SystemPrompt = initSystemPromptModel(sequelize);
const Chat = initChatModel(sequelize);
const Message = initMessageModel(sequelize);
const UserSetting = initUserSettingModel(sequelize);
const Usage = initUsageModel(sequelize);
const Product = initProductModel(sequelize);
const ServicePricing = initServicePricingModel(sequelize);
User.hasMany(Chat, {
    foreignKey: 'userId',
    as: 'chats'
});
Chat.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});
Chat.hasMany(Message, {
    foreignKey: 'chatId',
    as: 'messages'
});
Message.belongsTo(Chat, {
    foreignKey: 'chatId',
    as: 'chat'
});
User.hasMany(UserSetting, {
    foreignKey: 'userId',
    as: 'settings'
});
UserSetting.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});
User.hasMany(Usage, {
    foreignKey: 'userId',
    as: 'usages'
});
Usage.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});
User.hasMany(ServicePricing, {
    foreignKey: 'lastUpdatedBy',
    as: 'updatedPricings'
});
ServicePricing.belongsTo(User, {
    foreignKey: 'lastUpdatedBy',
    as: 'updatedBy'
});
export { sequelize, User, ApiSetting, AiModel, SystemPrompt, Chat, Message, UserSetting, Usage, Product, ServicePricing };
export default sequelize;
