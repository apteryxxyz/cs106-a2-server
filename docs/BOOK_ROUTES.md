# Book Routes

## Book Object

Firstly, a book object has the following shape.

-   `id` Book ID
-   `isbn` The books ISBN code
-   `author_id` ID of the books author
-   `title` Books title
-   `description` A description of the book
-   `cover_image_url` URL to the cover image
-   `quantity` The amount of this book that the library has

## GET /books (U)

Get a list of all of the books.

**Response** body

An array of [Book Object](#book-object)s.

## PUT /authors (A)

Enter a new book into the database, author must be created before this.

**Request** body

A [Book Object](#book-object), ID field is ignored.

**Response** body

The created [Book Object](#book-object).

## GET /books/:bookId (U)

Get a book by its ID.

**Response** body

A [Book Object](#book-object).

## POST /books/:bookId (A)

Modify a book by its ID.

**Request** body

A partial [Book Object](#book-object), ID field is ignored.

**Response** body

The new [Book Object](#book-object).

## DELETE /books/:bookId (A)

Delete a book from the database by its ID.

## GET /books/:authorId/borrows

Get a list of the borrows this book has.

**Response** body

An array of [Borrow Object](docs/BORROW_ROUTES.md#borrow-object)s.
