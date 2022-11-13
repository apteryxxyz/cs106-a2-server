import { type InferType, s } from '@sapphire/shapeshift';
import { pick } from 'lodash';

export type Author = InferType<typeof Author.schema>;

export namespace Author {
    export const tablePath = 'data/authors.json';

    export const schema = s.object({
        id: s.string,
        first_name: s.string,
        last_name: s.string,
    });

    export function isPartialAuthor(data: unknown): data is Partial<Author> {
        try {
            schema.partial.parse(data);
            return true;
        } catch {
            return false;
        }
    }

    export function isAuthor(data: unknown): data is Author {
        try {
            schema.parse(data);
            return true;
        } catch {
            return false;
        }
    }

    export function isNewAuthor(data: unknown): data is Omit<Author, 'id'> {
        try {
            schema.omit(['id']).parse(data);
            return true;
        } catch {
            return false;
        }
    }

    export function stripAuthor(data: Record<string, any>) {
        return pick(data, Object.keys(schema));
    }
}
