import { Router } from 'express';
import type { Database } from '../Database';
import { BorrowController } from '../controllers/borrow';
import { authenticateAdmin } from '../middlewares/authenticate';

// Router for '/borrows'
export function borrowRoutes(database: Database): Router {
    const router = Router();
    const controller = new BorrowController(database);

    const __ = (fn: any) => fn.bind(controller);
    const _a = () => authenticateAdmin(database);

    router.get('/borrows', _a(), __(controller.listBorrows));
    router.put('/borrows', _a(), __(controller.createBorrow));

    router.get('/borrows/:borrowId', _a(), __(controller.getBorrow));
    router.delete('/borrows/:borrowId', _a(), __(controller.deleteBorrow));

    return router;
}
