import type { Request, Response } from 'express';
import { isObject } from 'lodash';
import type { Database } from '../Database';
import { Borrow } from '../models/Borrow';

export class BorrowController {
    private readonly _database: Database;

    public constructor(database: Database) {
        this._database = database;
    }

    public listBorrows(_req: Request, res: Response) {
        return res.json(this._database.getBorrows());
    }

    public createBorrow(req: Request, res: Response) {
        if (!isObject(req.body) || !Borrow.isNewBorrow(req.body)) return this._sendError(res, 400);
        const newBorrow = Borrow.stripBorrow(req.body);
        newBorrow['id'] = this._database.flake();
        delete newBorrow['user'];
        delete newBorrow['book'];

        if (!Borrow.isBorrow(newBorrow)) return this._sendError(res, 400);

        const book = this._database.getBook(newBorrow.book_id);
        if (!book) return this._sendError(res, 404);

        const user = this._database.getUser(newBorrow.user_id);
        if (!user) return this._sendError(res, 404);

        this._database.borrows.set(newBorrow.id, newBorrow);
        this._database.save();
        return res.json(newBorrow);
    }

    public getBorrow(req: Request, res: Response) {
        const borrow = this._database.getBorrow(req.params['borrowId']);
        return borrow ? res.json(borrow) : this._sendError(res, 404);
    }

    public deleteBorrow(req: Request, res: Response) {
        const borrow = this._database.getBorrow(req.params['borrowId']);
        if (!borrow) return this._sendError(res, 404);

        this._database.books.delete(borrow.id);
        this._database.save();
        return res.status(204).end();
    }

    private _sendError(res: Response, status: number, message?: string) {
        return res.status(status).json({ status, message });
    }
}
