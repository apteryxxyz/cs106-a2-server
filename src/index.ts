import { API } from './API';
import { Database } from './Database';

const database = new Database();
const api = new API(database);

database.load();
api.open();

export { database, api };
