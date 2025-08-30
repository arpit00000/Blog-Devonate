import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config'; // Ensure you have a config file for your secrets

export const generateToken = (userId: string) => {
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
    return token;
};

export const verifyToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
};