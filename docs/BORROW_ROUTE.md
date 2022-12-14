# Borrow Routes

## Borrow Object

Firstly, a borrow object has the following shape.

-   `id` Borrow ID
-   `book_id` The ID of the book with borrow is for
-   `book` [Book Object](./BOOK_ROUTES.md#book-object)
-   `user_id` ID of the user that is borrowing this book
-   `user` [User Object](./USER_ROUTES.md#user-object)
-   `issued_at` Unix timestamp that this book was borrowed at
-   `issued_for` Amount of time for this borrow in seconds

## GET /borrows (A)

Get a list of all of current borrows.

**Query** parameters

-   `search {string}` Search query
-   `overdue_only {0|1}` Return overdue borrows only

**Response** body

An array of [Borrow Object](#borrow-object)s.

## PUT /borrows (A)

Borrow a book.

**Request** body

A [Borrow Object](#borrow-object), ID field is ignored.

**Response** body

The created [Borrow Object](#borrow-object).

## GET /borrows/:borrowId (A)

Get a borrow by its ID.

**Response** body

A [Borrow Object](#borrow-object).

## DELETE /borrows/:borrowId (A)

Return a book.

## GET /users/:userId/borrows (M)

Get a list of the currently borrowed books a user has.

**Query** parameters

-   `search {string}` Search query
-   `overdue_only {0|1}` Return overdue borrows only

**Response** body

An array of [Borrow Object](#borrow-object)s.

## PUT /users/:userId/borrows (M)

Borrow a book as a user.

**Request** body

A [Borrow Object](#borrow-object), ID and user ID fields are ignored.

**Response** body

The created [Borrow Object](#borrow-object).

## GET /users/:userId/borrows/:borrowId (M)

Get a users borrow by its ID.

**Response** body

A [Borrow Object](#borrow-object).

## DELETE /users/:userId/borrows/:borrowId (M)

Return a users book.
