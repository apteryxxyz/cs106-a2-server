import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import * as process from 'node:process';
import { Collection } from '@discordjs/collection';
import * as jwt from 'jsonwebtoken';
import * as uniqid from 'uniqid';
import { Author } from './models/Author';
import { Book } from './models/Book';
import { Borrow } from './models/Borrow';
import { User } from './models/User';

export class Database {
    public authors = new Collection<string, Author>();

    public books = new Collection<string, Book>();

    public users = new Collection<string, User>();

    public borrows = new Collection<string, Borrow>();

    public constructor() {
        this.ensure();
        this.load();
    }

    public flake = () => uniqid();

    public ensure() {
        const paths = [Author.tablePath, Book.tablePath, Borrow.tablePath, User.tablePath];
        for (const path of paths) if (!existsSync(path)) writeFileSync(path, '[]');
        return this;
    }

    public load() {
        const rawAuthors = JSON.parse(readFileSync(Author.tablePath, 'utf8')) as Author[];
        for (const author of rawAuthors) this.authors.set(author.id, author);

        const rawBooks = JSON.parse(readFileSync(Book.tablePath, 'utf8')) as Book[];
        for (const book of rawBooks) this.books.set(book.id, book);

        const rawBorrows = JSON.parse(readFileSync(Borrow.tablePath, 'utf8')) as Borrow[];
        for (const borrow of rawBorrows) this.borrows.set(borrow.id, borrow);

        const rawUsers = JSON.parse(readFileSync(User.tablePath, 'utf8')) as User[];
        for (const user of rawUsers) this.users.set(user.id, user);

        return this;
    }

    public save() {
        const newAuthors = Array.from(this.authors.values());
        writeFileSync(Author.tablePath, JSON.stringify(newAuthors, null, 4));

        const newBooks = Array.from(this.books.values());
        writeFileSync(Book.tablePath, JSON.stringify(newBooks, null, 4));

        const newBorrows = Array.from(this.borrows.values());
        writeFileSync(Borrow.tablePath, JSON.stringify(newBorrows, null, 4));

        const newUsers = Array.from(this.users.values());
        writeFileSync(User.tablePath, JSON.stringify(newUsers, null, 4));

        return this;
    }

    public createToken(user: User) {
        return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    }

    public verifyToken(token: string) {
        try {
            const { id } = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
            return this.users.get(id);
        } catch {
            return null;
        }
    }
}
