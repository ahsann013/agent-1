import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import initUserModel from './user.js';
import initApiSettingModel from './apiSetting.js';
import initAiModelModel from './aiModel.js';
import initSystemPromptModel from './systemPrompt.js';
import initChatModel from './chat.js'; // Import chat model
import initMessageModel from './message.js'; // Import message model
import initUserSettingModel from './userSetting.js'; // Import user setting model
import initUsageModel from './usage.js'; // Import usage model
import initProductModel from './product.js'; // Import product model
import initServicePricingModel from './servicePricing.js'; // Import service pricing model

dotenv.config();

// Create a new Sequelize instance with database configurations
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    define: {
        logging: false,
        timestamps: true,
    },
});

// Initialize models
const User = initUserModel(sequelize);
const ApiSetting = initApiSettingModel(sequelize);
const AiModel = initAiModelModel(sequelize);
const SystemPrompt = initSystemPromptModel(sequelize);
const Chat = initChatModel(sequelize); // Initialize chat model
const Message = initMessageModel(sequelize); // Initialize message model
const UserSetting = initUserSettingModel(sequelize); // Initialize user setting model
const Usage = initUsageModel(sequelize); // Initialize usage model
const Product = initProductModel(sequelize); // Initialize product model
const ServicePricing = initServicePricingModel(sequelize); // Initialize service pricing model

// One-to-many relationship between User and Chat
User.hasMany(Chat, {
    foreignKey: 'userId',
    as: 'chats'
});

Chat.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// One-to-many relationship between Chat and Message
Chat.hasMany(Message, {
    foreignKey: 'chatId',
    as: 'messages'
});

Message.belongsTo(Chat, {
    foreignKey: 'chatId',
    as: 'chat'
});

// One-to-one relationship between User and UserSetting
User.hasMany(UserSetting, {
    foreignKey: 'userId',
    as: 'settings'
});

UserSetting.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// One-to-many relationship between User and Usage
User.hasMany(Usage, {
    foreignKey: 'userId',
    as: 'usages'
});

Usage.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// A user can update many service pricings (track who last updated a price)
User.hasMany(ServicePricing, {
    foreignKey: 'lastUpdatedBy',
    as: 'updatedPricings'
});

ServicePricing.belongsTo(User, {
    foreignKey: 'lastUpdatedBy',
    as: 'updatedBy'
});

// Export models and sequelize instance
export { 
    sequelize, 
    User, 
    ApiSetting, 
    AiModel,
    SystemPrompt,
    Chat,
    Message,
    UserSetting,
    Usage,
    Product,
    ServicePricing
};

export default sequelize;
