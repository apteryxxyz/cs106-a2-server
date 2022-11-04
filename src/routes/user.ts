import { Router } from 'express';
import { UserController } from '../controllers/user';
import type { Database } from '../Database';
import { authenticateAdmin, authenticateMember } from '../middlewares/authenticate';

// Router for '/users'
export function userRoutes(database: Database): Router {
    const router = Router();
    const controller = new UserController(database);

    const __ = (fn: any) => fn.bind(controller);
    const _a = () => authenticateAdmin(database);
    const _m = () => authenticateMember(database);

    router.post('/token', __(controller.createToken));

    router.get('/users', _a(), __(controller.listUsers));
    router.put('/users', _a(), __(controller.createUser));

    router.get('/users/:userId', _m(), __(controller.getUser));
    router.patch('/users/:userId', _m(), __(controller.modifyUser));
    router.delete('/users/:userId', _m(), __(controller.deleteUser));

    router.get('/users/:userId/borrows', _m(), __(controller.listUserBorrows));

    return router;
}
