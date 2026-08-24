import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';
import { config } from '../config/config.js';

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Authentication required. Please log in.' });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired authentication token', error: error.message });
    }
};

export const authorizeRole = (roles = []) => {
    return async (req, res, next) => {
        try {
            const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({ message: 'Authentication required. Please log in.' });
            }

            const decoded = jwt.verify(token, config.JWT_SECRET);
            const user = await userModel.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (roles.length && !roles.includes(user.role)) {
                return res.status(403).json({ message: `Access denied. Requires one of roles: [${roles.join(', ')}]` });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Invalid or expired authentication token', error: error.message });
        }
    };
};

export default {
    protect,
    authorizeRole,
};
