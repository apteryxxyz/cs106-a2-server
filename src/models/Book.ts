import { type InferType, s } from '@sapphire/shapeshift';
import { pick } from 'lodash';

export type Book = InferType<typeof Book.schema>;

export namespace Book {
    export const tablePath = 'data/books.json';

    export const schema = s.object({
        id: s.string,
        isbn: s.string,
        author_id: s.string,
        title: s.string,
        description: s.string,
        genre: s.string,
        cover_image_url: s.string,
        quantity: s.number,
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
        return pick(data, Object.keys(schema));
    }
}
