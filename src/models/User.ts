import { type InferType, s } from '@sapphire/shapeshift';

export type User = InferType<typeof User.schema>;

export namespace User {
    export const tablePath = 'data/users.json';

    export enum Type {
        Admin = 1,
        Member,
    }

    export const schema = s.object({
        id: s.string,
        type: s.nativeEnum(Type),
        first_name: s.string,
        last_name: s.string,
        email_address: s.string.email,
        password: s.string,
        phone_number: s.string.phone(),
        home_address_1: s.string,
        home_address_2: s.string,
        post_code: s.string,
    });

    export function isPartialUser(data: unknown): data is Partial<User> {
        try {
            schema.partial.parse(data);
            return true;
        } catch {
            return false;
        }
    }

    export function isUser(data: unknown): data is User {
        try {
            schema.parse(data);
            return true;
        } catch {
            return false;
        }
    }

    export function isNewUser(data: unknown): data is Omit<User, 'id'> {
        try {
            schema.omit(['id']).parse(data);
            return true;
        } catch {
            return false;
        }
    }
}
