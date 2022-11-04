import type { NextFunction, Request, Response } from 'express';
import type { Database } from '../Database';
import { User } from '../models/User';

export function authenticateAdmin(database: Database) {
    return function (req: Request, res: Response, next: NextFunction) {
        const token = req.headers['authorization'];
        const user = token ? database.verifyToken(token) : null;
        if (!user) return res.status(401).end({ status: 401 });

        if (user.type === User.Type.Admin) return next();
        return res.status(403).end({ status: 403 });
    };
}

export function authenticateMember(database: Database) {
    return function (req: Request, res: Response, next: NextFunction) {
        const token = req.headers['authorization'];
        const user = token ? database.verifyToken(token) : null;
        if (!user) return res.status(401).end({ status: 401 });

        const userId = req.params['userId'];
        if (user.id === userId || user.type === User.Type.Admin) return next();
        return res.status(403).end({ status: 403 });
    };
}

export function authenticateUser(database: Database) {
    return function (req: Request, res: Response, next: NextFunction) {
        const token = req.headers['authorization'];
        const user = token ? database.verifyToken(token) : null;
        if (!user) return res.status(401).end({ status: 401 });
        return next();
    };
}
