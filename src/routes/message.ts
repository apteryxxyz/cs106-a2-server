import { Router } from 'express';
import type { Database } from '../Database';
import { MessageController } from '../controllers/message';
import { authenticateAdmin, authenticateMember } from '../middlewares/authenticate';
import { resolveUserId } from '../middlewares/resolve';

// Router for '/messages'
export function messageRoutes(database: Database): Router {
    const router = Router();
    const controller = new MessageController(database);

    const __ = (fn: any) => fn.bind(controller);
    const _a = () => authenticateAdmin(database);
    const _m = () => authenticateMember(database);
    const _r = () => resolveUserId(database);

    router.get('/messages', _a(), __(controller.listMessages));
    router.get('/messages/:messageId', _a(), __(controller.getMessage));

    router.get('/users/:userId/messages', _r(), _m(), __(controller.listUserMessages));
    router.get('/users/:userId/messages/:messageId', _r(), _m(), __(controller.getUserMessage));

    return router;
}
