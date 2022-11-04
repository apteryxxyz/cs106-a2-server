import { Router } from 'express';
import { BookContoller } from '../controllers/book';
import type { Database } from '../Database';
import { authenticateAdmin, authenticateUser } from '../middlewares/authenticate';

// Router for '/books'
export function bookRoutes(database: Database): Router {
    const router = Router();
    const controller = new BookContoller(database);

    const __ = (fn: any) => fn.bind(controller);
    const _a = () => authenticateAdmin(database);
    const _u = () => authenticateUser(database);

    router.get('/books', _u(), __(controller.listBooks));
    router.put('/books', _a(), __(controller.createBook));

    router.get('/books/:bookId', _u(), __(controller.getBook));
    router.patch('/books/:bookId', _a(), __(controller.modifyBook));
    router.delete('/books/:bookId', _a(), __(controller.deleteBook));

    router.get('/books/:bookId/borrows', _a(), __(controller.listBookBorrows));

    return router;
}
