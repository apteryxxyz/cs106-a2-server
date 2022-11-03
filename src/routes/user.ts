import { Router } from 'express';
import { UserController } from '../controllers/user';
import type { Database } from '../Database';

// Router for '/users'
export function userRoutes(database: Database): Router {
    const router = Router();
    const controller = new UserController(database);

    const __ = (fn: any) => fn.bind(controller);

    router.get('/users', __(controller.listUsers));
    router.put('/users', __(controller.createUser));

    router.get('/users/:userId', __(controller.getUser));
    router.patch('/users/:userId', __(controller.modifyUser));
    router.delete('/users/:userId', __(controller.deleteUser));

    router.get('/users/:userId/borrows', __(controller.listUserBorrows));

    return router;
}
