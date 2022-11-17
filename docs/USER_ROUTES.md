# User Routes

## User Object

Firstly, a user object has the following shape.

-   `id` User ID
-   `type` 1 for admin, 2 for normal member
-   `first_name` Users first name
-   `last_name` Users family name
-   `email_address` Their email address
-   `password` Account password, for GET requests, always null
-   `phone_number` Users contact phone number
-   `home_address_1` First line of their address
-   `home_address_2` Second line of their address
-   `post_code` Post code for address

## POST /login (E)

Get a new access token for a users account.

**Request** body

-   `email_address` The users email address.
-   `password` Account password.

**Response** body

-   `user_id` ID of the account.
-   `user_type` The type of the account.
-   `token` Account access token.

## GET /users (A)

Get a list of all the of users, including admins and members. All user `password` fields will be `null`.

**Query** parameters

-   `search {string}` Search query
-   `members_only {0|1}` Return members only
-   `admins_only {0|1}` Return admins only

**Response** body

An array of [User Object](#user-object)s.

## PUT /users (A)

Register a new user account.

**Request** body

A [User Object](#user-object), ID field is ignored, must include password, email address must be unique.

**Response** body

The created [User Object](#user-object), `password` will be `null`.

## GET /users/:userId (M)

Get a user by their ID.

**Response** body

A [User Object](#user-object),`password` will be `null`.

## POST /users/:userId (M)

Modify a user by their ID.

**Request** body

A partial [User Object](#user-object), ID and type fields are ignored.

**Response** body

The new [User Object](#user-object).

## DELETE /users/:userId (M)

Delete a user by their ID.
