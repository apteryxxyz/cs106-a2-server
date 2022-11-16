import type { Request, Response } from 'express';
import * as fuzzysort from 'fuzzysort';
import { isObject } from 'lodash';
import type { Database } from '../Database';
import { Borrow } from '../models/Borrow';

export class BorrowController {
    private readonly _database: Database;

    public constructor(database: Database) {
        this._database = database;
    }

    public listBorrows(req: Request, res: Response) {
        const search = String(req.query['search']);
        const overdueOnly = Boolean(req.query['overdueOnly'] === '1');

        let borrows = this._database.getBorrows();

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

    public createBorrow(req: Request, res: Response) {
        if (!isObject(req.body) || !Borrow.isNewBorrow(req.body)) return this._sendError(res, 400);
        const newBorrow = Borrow.stripBorrow(req.body);
        newBorrow['id'] = this._database.flake();
        newBorrow['sent_overdue_at'] = null;
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
