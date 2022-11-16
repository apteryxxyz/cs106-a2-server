import type { Request, Response } from 'express';
import * as fuzzysort from 'fuzzysort';
import { isObject } from 'lodash';
import type { Database } from '../Database';
import { User } from '../models/User';

export class UserController {
    private readonly _database: Database;

    public constructor(database: Database) {
        this._database = database;
    }

    public userLogin(req: Request, res: Response) {
        const { email_address, password } = req.body;
        const user = this._database.getUsers().find(usr => usr.email_address === email_address);
        if (!user) return this._sendError(res, 401);

        if (user.password !== password) return this._sendError(res, 401);
        return res.json({
            // IDEA: user: user,
            user_id: user.id,
            user_type: user.type,
            token: this._database.createToken(user),
        });
    }

    public listUsers(req: Request, res: Response) {
        const search = String(req.query['search']);
        const adminOnly = Boolean(req.query['admin_only'] === '1');
        const memberOnly = Boolean(req.query['member_only'] === '1');

        let users = this._database.getUsers();
        for (const usr of users) Reflect.set(usr, 'password', null);

        if (adminOnly) {
            users = users.filter(usr => usr.type === User.Type.Admin);
        } else if (memberOnly) {
            users = users.filter(usr => usr.type === User.Type.Member);
        }

        if (search) {
            const keys = ['id', 'first_name', 'last_name', 'email_address'];
            const results = fuzzysort.go(search, users, { keys });
            users = results.map(res => res.obj);
        }

        return res.json(users);
    }

    public createUser(req: Request, res: Response) {
        if (!isObject(req.body) || !User.isNewUser(req.body)) return this._sendError(res, 400);
        const newUser = User.stripUser(req.body);
        newUser['id'] = this._database.flake();

        if (!User.isUser(newUser)) return this._sendError(res, 400);

        if (
            this._database.users //
                .some(usr => usr.email_address === newUser.email_address)
        )
            return this._sendError(res, 409);

        this._database.users.set(newUser.id, newUser);
        this._database.save();
        return res.json(newUser);
    }

    public getUser(req: Request, res: Response) {
        const user = this._database.getUser(req.params['userId']);
        if (!user) return this._sendError(res, 404);

        const cloned = JSON.parse(JSON.stringify(user));
        Reflect.set(cloned, 'password', null);
        return res.json(cloned);
    }

    public listUserBorrows(req: Request, res: Response) {
        const user = this._database.getUser(req.params['userId']);
        if (!user) return this._sendError(res, 404);

        const search = String(req.query['search']);
        const overdueOnly = Boolean(req.query['overdue_only'] === '1');

        let borrows = this._database
            .getBorrows() //
            .filter(brw => brw.user_id === user.id);

        if (overdueOnly) {
            borrows = borrows.filter(brw => Date.now() / 1_000 > brw.issued_at + brw.issued_for);
        }

        if (search) {
            const keys = ['id', 'user_id', 'book_id', 'book.title', 'book.description'];
            const results = fuzzysort.go(search, borrows, { keys });
            borrows = results.map(res => res.obj);
        }

        return res.json(borrows);
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

    public modifyUser(req: Request, res: Response) {
        const user = this._database.getUser(req.params['userId']);
        if (!user) return this._sendError(res, 404);

        if (!isObject(req.body)) return this._sendError(res, 400);
        const newUser = User.stripUser(req.body);
        delete newUser['id'];
        delete newUser['type'];

        if (!User.isPartialUser(newUser)) return this._sendError(res, 400);

        const modifiedUser = { ...user, ...newUser };
        if (!User.isUser(modifiedUser)) return this._sendError(res, 400);

        this._database.users.set(user.id, modifiedUser);
        this._database.save();
        return res.json(modifiedUser);
    }

    public deleteUser(req: Request, res: Response) {
        const user = this._database.getUser(req.params['userId']);
        if (!user) return this._sendError(res, 404);

        this._database.users.delete(user.id);
        this._database.save();
        return res.status(204).end();
    }

    private _sendError(res: Response, status: number, message?: string) {
        return res.status(status).json({ status, message });
    }
}
