import { type InferType, s } from '@sapphire/shapeshift';
import { pick } from 'lodash';

export type Message = InferType<typeof Message.schema>;

export namespace Message {
    export const tablePath = 'data/messages.json';

    export const schema = s.object({
        id: s.string,
        for_admin: s.boolean,
        recipient_id: s.string.lengthGreaterThanOrEqual(3).nullable,
        subject: s.string.lengthGreaterThanOrEqual(3),
        content: s.string.lengthGreaterThanOrEqual(3),
        read_at: s.number.positive.nullable,
    });

    export function isPartialMessage(data: unknown): data is Partial<Message> {
        try {
            schema.partial.parse(data);
            return true;
        } catch {
            return false;
        }
    }

    export function isMessage(data: unknown): data is Message {
        try {
            schema.parse(data);
            return true;
        } catch {
            return false;
        }
    }

    export function isNewMessage(data: unknown): data is Omit<Message, 'id'> {
        try {
            schema.omit(['id']).parse(data);
            return true;
        } catch {
            return false;
        }
    }

    export function stripMessage(data: Record<string, any>) {
        return pick(data, Reflect.get(schema, 'keys')) as Message;
    }
}
