import { Router } from 'express';
import type { Database } from '../Database';
import { UserController } from '../controllers/user';
import { authenticateAdmin, authenticateMember } from '../middlewares/authenticate';
import { resolveUserId } from '../middlewares/resolve';

// Router for '/users'
export function userRoutes(database: Database): Router {
    const router = Router();
    const controller = new UserController(database);

    const __ = (fn: any) => fn.bind(controller);
    const _a = () => authenticateAdmin(database);
    const _m = () => authenticateMember(database);
    const _r = () => resolveUserId(database);

    router.post('/login', __(controller.userLogin));

    router.get('/users', _a(), __(controller.listUsers));
    router.put('/users', _a(), __(controller.createUser));

    router.get('/users/:userId', _r(), _m(), __(controller.getUser));
    router.post('/users/:userId', _r(), _m(), __(controller.modifyUser));
    router.delete('/users/:userId', _r(), _m(), __(controller.deleteUser));

    router.get('/users/:userId/borrows', _r(), _m(), __(controller.listUserBorrows));
    router.put('/users/:userId/borrows', _r(), _m(), __(controller.createUserBorrow));
    router.get('/users/:userId/borrows/:borrowId', _r(), _m(), __(controller.getUserBorrow));

    router.get('/users/:userId/messages', _r(), _m(), __(controller.listUserMessages));
    router.get('/users/:userId/messages/:messageId', _r(), _m(), __(controller.getUserMessage));

    return router;
}
