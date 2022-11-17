import { type InferType, s } from '@sapphire/shapeshift';
import { pick } from 'lodash';

export type Borrow = InferType<typeof Borrow.schema>;

export namespace Borrow {
    export const tablePath = 'data/borrows.json';

    export const schema = s.object({
        id: s.string,
        book_id: s.string.lengthGreaterThanOrEqual(3),
        user_id: s.string.lengthGreaterThanOrEqual(3),
        issued_at: s.number.positive,
        issued_for: s.number.positive,
        sent_overdue_at: s.number.positive.nullable,
    });

    export function isPartialBorrow(data: unknown): data is Partial<Borrow> {
        try {
            schema.partial.parse(data);
            return true;
        } catch {
            return false;
        }
    }

    export function isBorrow(data: unknown): data is Borrow {
        try {
            schema.parse(data);
            return true;
        } catch {
            return false;
        }
    }

    export function isNewBorrow(data: unknown): data is Omit<Borrow, 'id'> {
        try {
            schema.omit(['id']).parse(data);
            return true;
        } catch {
            return false;
        }
    }

    export function stripBorrow(data: Record<string, any>) {
        return pick(data, Reflect.get(schema, 'keys')) as Borrow;
    }
}
