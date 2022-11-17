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
            user: User.stripUser(user);
            user_id: user.id,
            user_type: user.type,
            token: this._database.createToken(user),
        });
    }

    public listUsers(req: Request, res: Response) {
        const search = String(req.query['search'] ?? '');
        const adminOnly = Boolean(req.query['admins_only'] === '1');
        const memberOnly = Boolean(req.query['members_only'] === '1');

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
        newUser.id = this._database.flake();

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

    public modifyUser(req: Request, res: Response) {
        const user = this._database.getUser(req.params['userId']);
        if (!user) return this._sendError(res, 404);

        if (!isObject(req.body)) return this._sendError(res, 400);
        const newUser = User.stripUser(req.body);
        Reflect.deleteProperty(newUser, 'id');
        Reflect.deleteProperty(newUser, 'type');
        Reflect.deleteProperty(newUser, 'password');

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
