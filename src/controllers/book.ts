import type { Request, Response } from 'express';
import * as fuzzysort from 'fuzzysort';
import { isObject } from 'lodash';
import type { Database } from '../Database';
import { Book } from '../models/Book';

export class BookContoller {
    private readonly _database: Database;

    public constructor(database: Database) {
        this._database = database;
    }

    public listBooks(req: Request, res: Response) {
        const query = req.query['q'] ? String(req.query['q']).toLowerCase() : null;

        let books = Array.from(this._database.books.clone().values());

        if (query) {
            const keys = ['title', 'description', 'isbn'];
            const results = fuzzysort.go(query, books, { keys });
            books = results.map(res => res.obj);
        }

        return res.json(books);
    }

    public createBook(req: Request, res: Response) {
        if (!isObject(req.body)) return this._sendError(res, 400);
        const newBook: Record<string, any> = { ...req.body };
        newBook['id'] = this._database.flake();

        const author = this._database.authors.get(newBook['author_id']);
        if (!author) return this._sendError(res, 404);

        if (!Book.isBook(newBook)) return this._sendError(res, 400);
        this._database.books.set(newBook.id, newBook);
        this._database.save();
        return res.json(newBook);
    }

    public getBook(req: Request, res: Response) {
        const book = this._database.books.get(req.params['bookId']);
        return book ? res.json(book) : this._sendError(res, 404);
    }

    public listBookBorrows(req: Request, res: Response) {
        const book = this._database.books.get(req.params['bookId']);
        if (!book) return this._sendError(res, 404);

        const bookBorrows = this._database.borrows.filter(brw => brw.book_id === book.id);
        return res.json(Array.from(bookBorrows.values()));
    }

    public modifyBook(req: Request, res: Response) {
        const book = this._database.books.get(req.params['bookId']);
        if (!book) return this._sendError(res, 404);

        if (!isObject(req.body)) return this._sendError(res, 400);
        const newBook: Record<string, any> = { ...req.body };
        delete newBook['id'];

        if (!Book.isPartialBook(newBook)) return this._sendError(res, 400);
        const modifiedBook = { ...book, ...newBook };
        if (!Book.isBook(modifiedBook)) return this._sendError(res, 400);

        this._database.books.set(book.id, modifiedBook);
        this._database.save();
        return res.json(modifiedBook);
    }

    public deleteBook(req: Request, res: Response) {
        const book = this._database.books.get(req.params['bookId']);
        if (!book) return this._sendError(res, 404);

        this._database.books.delete(book.id);
        this._database.save();
        return res.status(204).end();
    }

    private _sendError(res: Response, status: number, message?: string) {
        return res.status(status).json({ status, message });
    }
}
