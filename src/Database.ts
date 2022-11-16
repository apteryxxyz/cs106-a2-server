import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import * as process from 'node:process';
import { setTimeout } from 'node:timers';
import { Collection } from '@discordjs/collection';
import * as jwt from 'jsonwebtoken';
import * as uniqid from 'uniqid';
import { Author } from './models/Author';
import { Book } from './models/Book';
import { Borrow } from './models/Borrow';
import { Message } from './models/Message';
import { User } from './models/User';

export class Database {
    public authors = new Collection<string, Author>();

    public books = new Collection<string, Book>();

    public borrows = new Collection<string, Borrow>();

    public messages = new Collection<string, Message>();

    public users = new Collection<string, User>();

    public constructor() {
        this.ensure();
        this.load();
    }

    public flake = () => uniqid();

    public ensure() {
        const paths = [
            Author.tablePath,
            Book.tablePath,
            Borrow.tablePath,
            Message.tablePath,
            User.tablePath,
        ];
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

        const rawMessages = JSON.parse(readFileSync(Message.tablePath, 'utf8')) as Message[];
        for (const message of rawMessages) this.messages.set(message.id, message);

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

        const newMessages = Array.from(this.messages.values());
        writeFileSync(Message.tablePath, JSON.stringify(newMessages, null, 4));

        const newUsers = Array.from(this.users.values());
        writeFileSync(User.tablePath, JSON.stringify(newUsers, null, 4));

        return this;
    }

    public process() {
        setTimeout(() => {
            const borrows = this.getBorrows();
            const now = Date.now() / 1_000;
            const overdueBorrows = borrows.filter(brw => now > brw.issued_at + brw.issued_for);

            for (const borrow of overdueBorrows) {
                const adminMessageId = this.flake();
                this.messages.set(adminMessageId, {
                    id: adminMessageId,
                    for_admin: true,
                    recipient_id: null,
                    subject: 'Borrow overdue',
                    content: `The book ${borrow.book.title} borrowed by ${borrow.user.email_address} is overdue.`,
                    read_at: null,
                });

                const memberMessageId = this.flake();
                this.messages.set(memberMessageId, {
                    id: memberMessageId,
                    for_admin: false,
                    recipient_id: borrow.user_id,
                    subject: `${borrow.book.title} is overdue`,
                    content: `You borrowed the book "${borrow.book.title}", but you didn't return it on time. Please return it as soon as possible.`,
                    read_at: null,
                });

                borrow.sent_overdue_at = now;
                this.borrows.set(borrow.id, borrow);
            }
        }, 600_000);
    }

    public getAuthor(id: string): Author | null {
        return this._clone(this.authors.clone().get(id));
    }

    public getAuthors(): Author[] {
        return this._clone(Array.from(this.authors.values()));
    }

    public getBook(id: string): Book | null {
        const book = this._clone(this.books.get(id));
        return book ? Object.assign(book, { author: this.getAuthor(book.author_id) }) : null;
    }

    public getBooks(): (Book & { author: Author })[] {
        return this._clone(Array.from(this.books.values())).map((bk: Book) =>
            Object.assign(bk, { author: this.getAuthor(bk.author_id) })
        );
    }

    public getBorrow(id: string): (Borrow & { book: Book; user: User }) | null {
        const borrow = this._clone(this.borrows.get(id));
        return borrow
            ? Object.assign(borrow, {
                  book: this.getBook(borrow.book_id),
                  user: this.getUser(borrow.user_id),
              })
            : null;
    }

    public getBorrows(): (Borrow & { book: Book; user: User })[] {
        return this._clone(Array.from(this.borrows.values())).map((br: Borrow) =>
            Object.assign(br, {
                book: this.getBook(br.book_id),
                user: this.getUser(br.user_id),
            })
        );
    }

    public getMessage(id: string): (Message & { recipient: User }) | null {
        const message = this._clone(this.messages.get(id));
        return message
            ? Object.assign(message, { recipient: this.getUser(message.recipient_id) })
            : null;
    }

    public getMessages(): (Message & { recipient: User | null })[] {
        return this._clone(Array.from(this.messages.values())).map((msg: Message) =>
            Object.assign(msg, {
                recipient: msg.recipient_id ? this.getUser(msg.recipient_id) : null,
            })
        );
    }

    public getUser(id: string): User | null {
        return this._clone(this.users.get(id));
    }

    public getUsers(): User[] {
        return this._clone(Array.from(this.users.values()));
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

    private _clone(data: any) {
        if (!data) return null;
        return JSON.parse(JSON.stringify(data));
    }
}
