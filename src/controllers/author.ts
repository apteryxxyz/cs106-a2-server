import type { Request, Response } from 'express';
import { isObject } from 'lodash';
import type { Database } from '../Database';
import { Author } from '../models/Author';

export class AuthorContoller {
    private readonly _database: Database;

    public constructor(database: Database) {
        this._database = database;
    }

    public listAuthors(_req: Request, res: Response) {
        return res.json(Array.from(this._database.authors.values()));
    }

    public createAuthor(req: Request, res: Response) {
        if (!isObject(req.body) || !Author.isNewAuthor(req.body)) return this._sendError(res, 400);
        const newAuthor: Record<string, any> = { ...req.body };
        newAuthor['id'] = this._database.flake();

        if (!Author.isAuthor(newAuthor)) return this._sendError(res, 400);
        this._database.authors.set(newAuthor.id, newAuthor);
        this._database.save();
        return res.json(newAuthor);
    }

    public getAuthor(req: Request, res: Response) {
        const author = this._database.authors.get(req.params['authorId']);
        return author ? res.json(author) : this._sendError(res, 404);
    }

    public listAuthorsBooks(req: Request, res: Response) {
        const author = this._database.authors.get(req.params['authorId']);
        if (!author) return this._sendError(res, 404);

        const authorBooks = this._database.books.filter(bk => bk.author_id === author.id);
        return res.json(Array.from(authorBooks.values()));
    }

    public modifyAuthor(req: Request, res: Response) {
        const author = this._database.authors.get(req.params['authorId']);
        if (!author) return this._sendError(res, 404);

        if (!isObject(req.body)) return this._sendError(res, 400);
        const newAuthor: Record<string, any> = { ...req.body };
        delete newAuthor['id'];

        if (!Author.isPartialAuthor(newAuthor)) return this._sendError(res, 400);
        const modifiedAuthor = { ...author, ...newAuthor };
        if (!Author.isAuthor(modifiedAuthor)) return this._sendError(res, 400);

        this._database.authors.set(author.id, modifiedAuthor);
        this._database.save();
        return res.json(modifiedAuthor);
    }

    public deleteAuthor(req: Request, res: Response) {
        const author = this._database.authors.get(req.params['authorId']);
        if (!author) return this._sendError(res, 404);

        this._database.authors.delete(author.id);
        this._database.save();
        return res.status(204).end();
    }

    private _sendError(res: Response, status: number, message?: string) {
        return res.status(status).json({ status, message });
    }
}
