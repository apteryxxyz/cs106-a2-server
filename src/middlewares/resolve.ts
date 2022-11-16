import type { NextFunction, Request, Response } from 'express';
import type { Database } from '../Database';

export function resolveUserId(database: Database) {
    return function _(req: Request, res: Response, next: NextFunction) {
        const userId = req.params['userId'];

        if (userId === '@me') {
            const token = req.headers.authorization ?? String(req.query['token']);
            const user = token ? database.verifyToken(token) : null;
            if (user) req.params['userId'] = user.id;
            else {
                res.status(401).json({ status: 401 });
                return;
            }
        }

        next();
    };
}
