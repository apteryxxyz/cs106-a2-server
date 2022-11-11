import type { Server } from 'node:http';
import type { Express } from 'express';
import * as express from 'express';
import type { Database } from './Database';
import { authorRoutes } from './routes/author';
import { bookRoutes } from './routes/book';
import { borrowRoutes } from './routes/borrow';
import { userRoutes } from './routes/user';

export class API {
    public server?: Server;

    public rest: Express;

    public database: Database;

    public constructor(database: Database) {
        this.rest = express();
        this.database = database;

        this.rest.use(express.json());

        this.rest.use(
            '/api',
            authorRoutes(database),
            bookRoutes(database),
            borrowRoutes(database),
            userRoutes(database)
        );
    }

    public open(port: number) {
        this.server = this.rest.listen(port);
    }

    public close() {
        if (!this.server) return;
        this.server.close();
    }
}
