import 'dotenv/config';
import * as process from 'node:process';
import { API } from './API';
import { Database } from './Database';

const database = new Database();
const api = new API(database);

database.load();
api.open(Number.parseInt(process.env.PORT as string, 10));

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            JWT_SECRET: string;
            PORT: string;
        }
    }
}

export { database, api };
