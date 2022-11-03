import { Router } from 'express';
import { AuthorContoller } from '../controllers/author';
import type { Database } from '../Database';

// Router for '/authors'
export function authorRoutes(database: Database): Router {
    const router = Router();
    const controller = new AuthorContoller(database);

    const __ = (fn: any) => fn.bind(controller);

    router.get('/authors', __(controller.listAuthors));
    router.put('/authors', __(controller.createAuthor));

    router.get('/authors/:authorId', __(controller.getAuthor));
    router.patch('/authors/:authorId', __(controller.modifyAuthor));
    router.delete('/authors/:authorId', __(controller.deleteAuthor));

    router.get('/authors/:authorId/books', __(controller.listAuthorsBooks));

    return router;
}
