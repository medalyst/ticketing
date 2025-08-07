import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    userId?: string;
    username?: string;
}

interface JWTPayload {
    userId: string;
    username: string;
    iat?: number;
    exp?: number;
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.sendStatus(401);

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        req.userId = decoded.userId;
        req.username = decoded.username;
        next();
    } catch {
        res.sendStatus(403);
    }
};
