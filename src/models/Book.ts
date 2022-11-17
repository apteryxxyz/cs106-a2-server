import { type InferType, s } from '@sapphire/shapeshift';
import { pick } from 'lodash';

export type Book = InferType<typeof Book.schema>;

export namespace Book {
    export const tablePath = 'data/books.json';

    export const schema = s.object({
        id: s.string,
        isbn: s.string.regex(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/),
        author_id: s.string.lengthGreaterThanOrEqual(3),
        title: s.string.lengthGreaterThanOrEqual(3),
        description: s.string.lengthGreaterThanOrEqual(3),
        genre: s.string.lengthGreaterThanOrEqual(3),
        cover_image_url: s.string.url(),
        quantity: s.number.positive,
    });

    export function isPartialBook(data: unknown): data is Partial<Book> {
        try {
            schema.partial.parse(data);
            return true;
        } catch {
            return false;
        }
    }

    export function isBook(data: unknown): data is Book {
        try {
            schema.parse(data);
            return true;
        } catch {
            return false;
        }
    }

    export function isNewBook(data: unknown): data is Omit<Book, 'id'> {
        try {
            schema.omit(['id']).parse(data);
            return true;
        } catch {
            return false;
        }
    }

    export function stripBook(data: Record<string, any>) {
        return pick(data, Reflect.get(schema, 'keys')) as Book;
    }
}
