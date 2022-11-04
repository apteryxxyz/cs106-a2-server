import { Router } from 'express';
import { BorrowController } from '../controllers/borrow';
import type { Database } from '../Database';
import { authenticateUser } from '../middlewares/authenticate';

// Router for '/borrows'
export function borrowRoutes(database: Database): Router {
    const router = Router();
    const controller = new BorrowController(database);

    const __ = (fn: any) => fn.bind(controller);
    const _u = () => authenticateUser(database);

    router.get('/borrows', _u(), __(controller.listBorrows));
    router.put('/borrows', _u(), __(controller.createBorrow));

    router.get('/borrows/:borrowId', _u(), __(controller.getBorrow));
    router.delete('/borrows/:borrowId', _u(), __(controller.deleteBorrow));

    return router;
}
