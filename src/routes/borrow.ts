import { Router } from 'express';
import type { Database } from '../Database';
import { BorrowController } from '../controllers/borrow';
import { authenticateAdmin, authenticateMember } from '../middlewares/authenticate';
import { resolveUserId } from '../middlewares/resolve';

// Router for '/borrows'
export function borrowRoutes(database: Database): Router {
    const router = Router();
    const controller = new BorrowController(database);

    const __ = (fn: any) => fn.bind(controller);
    const _a = () => authenticateAdmin(database);
    const _m = () => authenticateMember(database);
    const _r = () => resolveUserId(database);

    router.get('/borrows', _a(), __(controller.listBorrows));
    router.put('/borrows', _a(), __(controller.createBorrow));

    router.get('/borrows/:borrowId', _a(), __(controller.getBorrow));
    router.delete('/borrows/:borrowId', _a(), __(controller.deleteBorrow));

    router.get('/users/:userId/borrows', _r(), _m(), __(controller.listUserBorrows));
    router.put('/users/:userId/borrows', _r(), _m(), __(controller.createUserBorrow));
    router.get('/users/:userId/borrows/:borrowId', _r(), _m(), __(controller.getUserBorrow));
    router.delete('/users/:userId/borrows/:borrowId', _r(), _m(), __(controller.deleteUserBorrow));

    return router;
}
