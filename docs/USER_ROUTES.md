# User Routes

## User Object

Firstly, a user object has the following shape.

-   `id` User ID.
-   `type` 1 for admin, 2 for normal member
-   `first_name` Users first name
-   `last_name` Users family name
-   `email_address` Their email address
-   `password` Account password, for GET requests, always null
-   `phone_number` Users contact phone number
-   `home_address_1` First line of their address
-   `home_address_2` Second line of their address
-   `post_code` Post code for address

## POST /token (E)

Use this endpoint to get a user access token.

**Request** body

-   `email_address` The users email address.
-   `password` Account password.

**Response** body

-   `token` Account access token.

## GET /users (A)

Get an array of **all** of the users.

**Response** body

Array of [User Object](#user-object)s.

## POST /users (A)

Create a brand new user account.

**Request** body

A [User Object](#user-object), ID and type fields are ignored, must include password, email address must be unique.

**Response** body

The the created [User Object](#user-object).

## GET /users/:userId (M)

Get a user by their ID.

**Response** body

A [User Object](#user-object).

## POST /users/:userId (M)

Modify a user by their ID.

**Request** body

A partial [User Object](#user-object), ID and type fields are ignored.

**Response** body

The new [User Object](#user-object).

## DELETE /users/:userId (M)

Delete a user from the database by their ID.

## GET /users/:userId/borrows (M)

Get a list of the borrows this user has.

**Response** body

An array of [Borrow Object](DOCS/BORROW_ROUTES.md#borrow-object)s.
