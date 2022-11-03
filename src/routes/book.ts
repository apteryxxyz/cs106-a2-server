import { Router } from 'express';
import { BookContoller } from '../controllers/book';
import type { Database } from '../Database';

// Router for '/books'
export function bookRoutes(database: Database): Router {
    const router = Router();
    const controller = new BookContoller(database);

    const __ = (fn: any) => fn.bind(controller);

    router.get('/books', __(controller.listBooks));
    router.put('/books', __(controller.createBook));

    router.get('/books/:bookId', __(controller.getBook));
    router.patch('/books/:bookId', __(controller.modifyBook));
    router.delete('/books/:bookId', __(controller.deleteBook));

    router.get('/books/:bookId/borrows', __(controller.listBookBorrows));

    return router;
}
