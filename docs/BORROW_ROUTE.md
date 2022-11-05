# Borrow Routes

## Borrow Object

Firstly, a borrow object has the following shape.

-   `id` Borrow ID
-   `book_id` The ID of the book with borrow is for
-   `borrower_id` ID of the user that is borrowing this book
-   `issued_at` Unix timestamp that this book was borrowed at
-   `issued_for` Amount of time for this borrow in seconds

## GET /borrows (A)

Get a list of all of current borrows.

**Response** body

An array of [Borrow Object](#borrow-object)s.

## PUT /borrows (U)

Borrow a book.

**Request** body

A [Borrow Object](#borrow-object), ID field is ignored.

**Response** body

The created [Borrow Object](#borrow-object).

## GET /borrows/:borrowId (M)

Get a borrow by its ID.

**Response** body

A [Borrow Object](#borrow-object).

## DELETE /borrows/:borrowId (M)

Return a book.
