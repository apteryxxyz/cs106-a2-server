import { type InferType, s } from '@sapphire/shapeshift';

export type Borrow = InferType<typeof Borrow.schema>;

export namespace Borrow {
    export const tablePath = 'data/borrows.json';

    export const schema = s.object({
        id: s.string,
        book_id: s.string,
        user_id: s.string,
        issued_at: s.number,
        issued_for: s.number,
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
}
