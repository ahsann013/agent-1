import { createServer } from 'http';
import app from './app.js';
import sync from './config/sync.js';
import sequelize from './models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const server = createServer(app);

const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Sync database and then start the server
const startServer = async (): Promise<void> => {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
    // Sync the database first
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

await sequelize.authenticate();
await sync();
console.log("Database connected successfully.");
startServer().catch((error: Error) => {
    console.error('Error starting the server:', error);
});
