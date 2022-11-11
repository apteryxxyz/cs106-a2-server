import type { Request, Response } from 'express';
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
        const user = this._database.users.find(usr => usr.email_address === email_address);
        if (!user) return this._sendError(res, 401);

        if (user.password !== password) return this._sendError(res, 401);
        return res.json({
            user_id: user.id,
            user_type: user.type,
            token: this._database.createToken(user),
        });
    }

    public listUsers(_req: Request, res: Response) {
        const users = Array.from(this._database.users.clone().values());
        for (const usr of users) Reflect.set(usr, 'password', null);
        return res.json(users);
    }

    public createUser(req: Request, res: Response) {
        if (!isObject(req.body)) return this._sendError(res, 400);
        const newUser: Record<string, any> = { ...req.body };
        newUser['id'] = this._database.flake();

        if (this._database.users.some(usr => usr.email_address === newUser['email_address']))
            return this._sendError(res, 409);

        if (!User.isUser(newUser)) return this._sendError(res, 400);
        this._database.users.set(newUser.id, newUser);
        this._database.save();
        return res.json(newUser);
    }

    public getUser(req: Request, res: Response) {
        const user = this._database.users.clone().get(req.params['userId']);
        if (user) Reflect.set(user, 'password', null);
        return user ? res.json(user) : this._sendError(res, 404);
    }

    public listUserBorrows(req: Request, res: Response) {
        const user = this._database.users.get(req.params['userId']);
        if (!user) return this._sendError(res, 404);

        const userBorrows = this._database.borrows.filter(brw => brw.borrower_id === user.id);
        return res.json(Array.from(userBorrows.values()));
    }

    public modifyUser(req: Request, res: Response) {
        const user = this._database.users.get(req.params['userId']);
        if (!user) return this._sendError(res, 404);

        if (!isObject(req.body)) return this._sendError(res, 400);
        const newUser: Record<string, any> = { ...req.body };
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
        const user = this._database.users.get(req.params['userId']);
        if (!user) return this._sendError(res, 404);

        this._database.users.delete(user.id);
        this._database.save();
        return res.status(204).end();
    }

    private _sendError(res: Response, status: number, message?: string) {
        return res.status(status).json({ status, message });
    }
}
