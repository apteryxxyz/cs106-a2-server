import { type InferType, s } from '@sapphire/shapeshift';
import { pick } from 'lodash';

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
        first_name: s.string.lengthGreaterThanOrEqual(3),
        last_name: s.string.lengthGreaterThanOrEqual(3),
        email_address: s.string.email,
        password: s.string.lengthGreaterThanOrEqual(3),
        phone_number: s.string.phone(),
        home_address_1: s.string.lengthGreaterThanOrEqual(3),
        home_address_2: s.string.lengthGreaterThanOrEqual(3),
        post_code: s.string.lengthGreaterThanOrEqual(3),
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

    export function stripUser(data: Record<string, any>) {
        return pick(data, Reflect.get(schema, 'keys')) as User;
    }
}
