import sequelize, { User } from '../models/index.js';
import { validate } from 'class-validator';
const insertAdminUser = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        const adminUserData = {
            name: 'admin',
            email: 'admin@gmail.com',
            password: '12345678',
            username: 'admin',
            isActive: true,
            role: 'admin',
        };
        const userInstance = Object.assign(new User(), adminUserData);
        const errors = await validate(userInstance);
        if (errors.length > 0) {
            throw new Error('Validation failed: ' + errors.map(err => err.toString()).join(', '));
        }
        const adminUser = await User.create(adminUserData);
        console.log('Admin user created:', adminUser.toJSON());
    }
    catch (error) {
        console.error('Error inserting admin user:', error);
    }
    finally {
        await sequelize.close();
    }
};
insertAdminUser();
