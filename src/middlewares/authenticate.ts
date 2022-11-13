import type { NextFunction, Request, Response } from 'express';
import type { Database } from '../Database';
import { User } from '../models/User';

export function authenticateAdmin(database: Database) {
    return function _(req: Request, res: Response, next: NextFunction) {
        const token = req.headers.authorization ?? String(req.query['token']);
        const user = token ? database.verifyToken(token) : null;
        if (!user) return res.status(401).json({ status: 401 });

        if (user.type === User.Type.Admin) {
            next();
            return;
        }

        return res.status(403).json({ status: 403 });
    };
}

export function authenticateMember(database: Database) {
    return function _(req: Request, res: Response, next: NextFunction) {
        const token = req.headers.authorization ?? String(req.query['token']);
        const user = token ? database.verifyToken(token) : null;
        if (!user) return res.status(401).json({ status: 401 });

        if (user.type === User.Type.Admin) {
            next();
            return;
        }

        const { userId, borrowId } = req.params;

        if (userId && user.id === userId) {
            next();
            return;
        } else if (borrowId) {
            const borrow = database.getBorrow(borrowId);
            if (borrow && borrow.user_id === user.id) {
                next();
                return;
            }
        }

        return res.status(403).json({ status: 403 });
    };
}

export function authenticateUser(database: Database) {
    return function _(req: Request, res: Response, next: NextFunction) {
        const token = req.headers.authorization ?? String(req.query['token']);
        const user = token ? database.verifyToken(token) : null;
        if (!user) {
            res.status(401).json({ status: 401 });
            return;
        }

        next();
    };
}
