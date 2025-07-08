import admin from '../config/firebase-admin.js';

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'No authorization header found' });
        }

        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Invalid authorization format. Must be Bearer token' });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        try {
            const decoded = await admin.auth().verifyIdToken(token);
            req.user = decoded;
            next();
        } catch (verifyError) {
            console.error('Token verification error:', verifyError);
            
            if (verifyError.code === 'auth/id-token-expired') {
                return res.status(401).json({ message: 'Token has expired', code: 'TOKEN_EXPIRED' });
            }
            
            if (verifyError.code === 'auth/argument-error') {
                return res.status(401).json({ message: 'Invalid token format', code: 'INVALID_TOKEN' });
            }
            
            return res.status(403).json({ 
                message: 'Invalid token', 
                code: verifyError.code || 'UNKNOWN_ERROR',
                error: verifyError.message 
            });
        }
    } catch (error) {
        console.error('Authorization middleware error:', error);
        res.status(500).json({ 
            message: 'Internal server error during authorization',
            error: error.message
        });
    }
}

export default verifyToken;