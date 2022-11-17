# Message Routes

## Message Object

-   `id` Message ID
-   `for_admin` Whether this message is for admins
-   `recipient_id` Nullable, the user ID
-   `recipient` Nullable, the user
-   `subject` Message subject
-   `content` Message content
-   `read_at` Nullable, unix timestamp

## GET /messages (A)

Get a list of all messages.

**Query** parameters

-   `search {string}` Search query
-   `admin_only {0|1}` Return admin messages only
-   `member_only {0|1}` Return member messages only

**Response** body

An array of [Message Object](#message-object)s.

## GET /messages/:messageId (A)

Get a single message object.

**Response** body

A [Message Object](#message-object).

## GET /users/:userId/messages

Get a list of all messages for a user.

**Query** parameters

-   `search {string}` Search query

**Response** body

An array of [Message Object](#message-object)s.

## GET /users/:userId/messages/:messageId

Get a users single message object.

**Response** body

A [Message Object](#message-object).
