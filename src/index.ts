import 'dotenv/config';
import * as process from 'node:process';
import { setInterval } from 'node:timers';
import { API } from './API';
import { Database } from './Database';

const database = new Database();
const api = new API(database);
setInterval(() => database.process(), 60_000);

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
