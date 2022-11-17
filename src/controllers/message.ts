import type { Request, Response } from 'express';
import * as fuzzysort from 'fuzzysort';
import type { Database } from '../Database';

export class MessageController {
    private readonly _database: Database;

    public constructor(database: Database) {
        this._database = database;
    }

    public listMessages(req: Request, res: Response) {
        const search = String(req.query['search']);
        const adminOnly = Boolean(req.query['admin_only'] === '1');
        const memberOnly = Boolean(req.query['member_only'] === '1');

        let messages = this._database.getMessages();

        if (adminOnly) {
            messages = messages.filter(msg => msg.for_admin === true);
        } else if (memberOnly) {
            messages = messages.filter(msg => msg.for_admin === false);
        }

        if (search) {
            const keys = ['id', 'subject', 'content'];
            const results = fuzzysort.go(search, messages, { keys });
            messages = results.map(res => res.obj);
        }

        return res.json(messages);
    }

    public getMessage(req: Request, res: Response) {
        const message = this._database.getMessage(req.params['messageId']);
        if (!message) return this._sendError(res, 404);

        message.read_at = this._database.now();
        this._database.messages.set(message.id, message);
        this._database.save();

        return res.json(message);
    }

    public listUserMessages(req: Request, res: Response) {
        const user = this._database.getUser(req.params['userId']);
        if (!user) return this._sendError(res, 404);

        const search = String(req.query['search']);
        const unreadOnly = Boolean(req.query['unread_only'] === '1');

        let messages = this._database
            .getMessages() //
            .filter(msg => msg.recipient_id === user.id);

        if (unreadOnly) {
            messages = messages.filter(msg => !msg.read_at);
        }

        if (search) {
            const keys = ['id', 'subject', 'content'];
            const results = fuzzysort.go(search, messages, { keys });
            messages = results.map(res => res.obj);
        }

        return res.json(messages);
    }

    public getUserMessage(req: Request, res: Response) {
        const user = this._database.getUser(req.params['userId']);
        if (!user) return this._sendError(res, 404);

        const message = this._database.getMessage(req.params['messageId']);
        if (!message) return this._sendError(res, 404);

        if (message.recipient_id !== user.id) return this._sendError(res, 401);

        return res.json(message);
    }

    private _sendError(res: Response, status: number, message?: string) {
        return res.status(status).json({ status, message });
    }
}
