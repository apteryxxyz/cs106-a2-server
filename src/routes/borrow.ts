import { Router } from 'express';
import { BorrowController } from '../controllers/borrow';
import type { Database } from '../Database';

// Router for '/borrows'
export function borrowRoutes(database: Database): Router {
    const router = Router();
    const controller = new BorrowController(database);

    const __ = (fn: any) => fn.bind(controller);

    router.get('/borrows', __(controller.listBorrows));
    router.put('/borrows', __(controller.createBorrow));

    router.get('/borrows/:BorrowId', __(controller.getBorrow));
    router.delete('/borrows/:BorrowId', __(controller.deleteBorrow));

    return router;
}
