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
        const search = String(req.query['search'] ?? req.query['q']);

        let books = this._database.getBooks();

        if (search) {
            const keys = ['title', 'description', 'isbn', 'author.first_name', 'author.last_name'];
            const results = fuzzysort.go(search, books, { keys });
            books = results.map(res => res.obj);
        }

        return res.json(books);
    }

    public createBook(req: Request, res: Response) {
        if (!isObject(req.body) || !Book.isNewBook(req.body)) return this._sendError(res, 400);
        const newBook = Book.stripBook(req.body);
        newBook.id = this._database.flake();

        if (this._database.books.some(bk => bk.isbn === newBook.isbn))
            return this._sendError(res, 409);

        if (!Book.isBook(newBook)) return this._sendError(res, 400);

        const author = this._database.getAuthor(newBook.author_id);
        if (!author) return this._sendError(res, 404);

        this._database.books.set(newBook.id, newBook);
        this._database.save();
        return res.json(newBook);
    }

    public getBook(req: Request, res: Response) {
        const book = this._database.getBook(req.params['bookId']);
        return book ? res.json(book) : this._sendError(res, 404);
    }

    public listBookBorrows(req: Request, res: Response) {
        const book = this._database.getBook(req.params['bookId']);
        if (!book) return this._sendError(res, 404);

        const bookBorrows = this._database
            .getBorrows() //
            .filter(brw => brw.book_id === book.id);
        return res.json(bookBorrows);
    }

    public modifyBook(req: Request, res: Response) {
        const book = this._database.getBook(req.params['bookId']);
        if (!book) return this._sendError(res, 404);

        if (!isObject(req.body)) return this._sendError(res, 400);
        const newBook = Book.stripBook(req.body);
        Reflect.deleteProperty(newBook, 'id');

        if (!Book.isPartialBook(newBook)) return this._sendError(res, 400);

        const modifiedBook = { ...book, ...newBook };
        if (!Book.isBook(modifiedBook)) return this._sendError(res, 400);

        this._database.books.set(book.id, modifiedBook);
        this._database.save();
        return res.json(modifiedBook);
    }

    public deleteBook(req: Request, res: Response) {
        const book = this._database.getBook(req.params['bookId']);
        if (!book) return this._sendError(res, 404);

        this._database.books.delete(book.id);
        this._database.save();
        return res.status(204).end();
    }

    private _sendError(res: Response, status: number, message?: string) {
        return res.status(status).json({ status, message });
    }
}
