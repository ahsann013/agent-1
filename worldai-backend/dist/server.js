import { createServer } from 'http';
import app from './app.js';
import sync from './config/sync.js';
import sequelize from './models/index.js';
import dotenv from 'dotenv';
dotenv.config();
const server = createServer(app);
const PORT = parseInt(process.env.PORT || '3000', 10);
const startServer = async () => {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};
await sequelize.authenticate();
await sync();
console.log("Database connected successfully.");
startServer().catch((error) => {
    console.error('Error starting the server:', error);
});
