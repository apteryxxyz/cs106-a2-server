import { Router } from 'express';
import { AuthorContoller } from '../controllers/author';
import type { Database } from '../Database';
import { authenticateAdmin, authenticateUser } from '../middlewares/authenticate';

// Router for '/authors'
export function authorRoutes(database: Database): Router {
    const router = Router();
    const controller = new AuthorContoller(database);

    const __ = (fn: any) => fn.bind(controller);
    const _a = () => authenticateAdmin(database);
    const _u = () => authenticateUser(database);

    router.get('/authors', _u(), __(controller.listAuthors));
    router.put('/authors', _a(), __(controller.createAuthor));

    router.get('/authors/:authorId', _u(), __(controller.getAuthor));
    router.patch('/authors/:authorId', _a(), __(controller.modifyAuthor));
    router.delete('/authors/:authorId', _a(), __(controller.deleteAuthor));

    router.get('/authors/:authorId/books', _u(), __(controller.listAuthorsBooks));

    return router;
}
