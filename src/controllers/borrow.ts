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
            borrows = borrows.filter(brw => this._database.now() > brw.issued_at + brw.issued_for);
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
        newBorrow.id = this._database.flake();
        newBorrow.sent_overdue_at = null;

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

    public createUserBorrow(req: Request, res: Response) {
        if (!isObject(req.body)) return this._sendError(res, 400);

        const user = this._database.getUser(req.params['userId']);
        if (!user) return this._sendError(res, 404);

        const newBorrow = Borrow.stripBorrow(req.body);
        newBorrow.id = this._database.flake();
        newBorrow.user_id = user.id;
        newBorrow.issued_at = this._database.now();
        newBorrow.sent_overdue_at = null;

        if (!Borrow.isBorrow(newBorrow)) return this._sendError(res, 400);

        const book = this._database.getBook(newBorrow.book_id);
        console.log(newBorrow, book);
        if (!book) return this._sendError(res, 404);

        this._database.borrows.set(newBorrow.id, newBorrow);
        this._database.save();
        return res.json(newBorrow);
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

    public getUserBorrow(req: Request, res: Response) {
        const user = this._database.getUser(req.params['userId']);
        if (!user) return this._sendError(res, 404);

        const borrow = this._database.getBorrow(req.params['borrowId']);
        if (!borrow) return this._sendError(res, 404);

        if (borrow.user_id !== user.id) return this._sendError(res, 401);

        return res.json(borrow);
    }

    public deleteUserBorrow(req: Request, res: Response) {
        const user = this._database.getUser(req.params['userId']);
        if (!user) return this._sendError(res, 404);

        const borrow = this._database.getBorrow(req.params['borrowId']);
        if (!borrow) return this._sendError(res, 404);

        if (borrow.user_id !== user.id) return this._sendError(res, 401);

        this._database.borrows.delete(borrow.id);
        this._database.save();
        return res.json(borrow);
    }

    private _sendError(res: Response, status: number, message?: string) {
        return res.status(status).json({ status, message });
    }
}
