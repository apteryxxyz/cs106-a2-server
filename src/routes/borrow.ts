import { Router } from 'express';
import type { Database } from '../Database';
import { BorrowController } from '../controllers/borrow';
import { authenticateMember, authenticateUser } from '../middlewares/authenticate';

// Router for '/borrows'
export function borrowRoutes(database: Database): Router {
    const router = Router();
    const controller = new BorrowController(database);

    const __ = (fn: any) => fn.bind(controller);
    const _u = () => authenticateUser(database);
    const _m = () => authenticateMember(database);

    router.get('/borrows', _u(), __(controller.listBorrows));
    router.put('/borrows', _m(), __(controller.createBorrow));

    router.get('/borrows/:borrowId', _m(), __(controller.getBorrow));
    router.delete('/borrows/:borrowId', _m(), __(controller.deleteBorrow));

    return router;
}
