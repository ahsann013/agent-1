import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const verifyRefreshToken = async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token is required' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        // Check if refresh token exists in database
        const user = await User.findOne({ 
            where: { 
                id: decoded.id,
                refreshToken 
            } 
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};

export default verifyRefreshToken;