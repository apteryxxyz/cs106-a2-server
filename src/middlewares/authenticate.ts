import type { NextFunction, Request, Response } from 'express';
import type { Database } from '../Database';
import { User } from '../models/User';

export function authenticateAdmin(database: Database) {
    return function (req: Request, res: Response, next: NextFunction) {
        const token = req.headers['authorization'];
        const user = token ? database.verifyToken(token) : null;
        if (!user) return res.status(401).json({ status: 401 });

        if (user.type === User.Type.Admin) return next();
        return res.status(403).json({ status: 403 });
    };
}

export function authenticateMember(database: Database) {
    return function (req: Request, res: Response, next: NextFunction) {
        const token = req.headers['authorization'];
        const user = token ? database.verifyToken(token) : null;
        if (!user) return res.status(401).json({ status: 401 });

        if (user.type === User.Type.Admin) return next();

        const { userId, borrowId } = req.params;

        if (userId && user.id === userId) return next();
        else if (borrowId) {
            const borrow = database.borrows.get(borrowId);
            if (borrow && borrow.borrower_id === user.id) return next();
        }

        return res.status(403).json({ status: 403 });
    };
}

export function authenticateUser(database: Database) {
    return function (req: Request, res: Response, next: NextFunction) {
        const token = req.headers['authorization'];
        const user = token ? database.verifyToken(token) : null;
        if (!user) return res.status(401).json({ status: 401 });
        return next();
    };
}
