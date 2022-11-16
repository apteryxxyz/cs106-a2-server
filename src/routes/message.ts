import { Router } from 'express';
import type { Database } from '../Database';
import { MessageController } from '../controllers/message';
import { authenticateAdmin } from '../middlewares/authenticate';

// Router for '/messages'
export function messageRoutes(database: Database): Router {
    const router = Router();
    const controller = new MessageController(database);

    const __ = (fn: any) => fn.bind(controller);
    const _a = () => authenticateAdmin(database);

    router.get('/messages', _a(), __(controller.listMessages));
    router.get('/messages/:messageId', _a(), __(controller.getMessage));

    return router;
}
