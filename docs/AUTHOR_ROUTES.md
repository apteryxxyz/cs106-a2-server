# Author Routes

## Author Object

Firstly, a author object has the following shape.

-   `id` Authors ID
-   `first_name` Authors first name
-   `last_name` Authors last name

## GET /authors (U)

Get a list of all of the book authors.

**Response** body

An array of [Author Object](#author-object)s.

## PUT /authors (A)

Create a new book author.

**Request** body

The created [Author Object](#author-object), ID field is ignored.

## GET /author/:authorId (U)

Get an author by their ID.

**Response** body

A [Author Object](#author-object).

## POST /authors/:authorId (A)

Modify an author by their ID.

**Request** body

A partial [Author Object](#author-object), ID field is ignored.

**Response** body

The new [Author Object](#author-object).

## DELETE /authors/:authorId (A)

Delete an author from the database by their ID.

## GET /authors/:authorId/books (U)

Get a list of the books that belong to a author.

**Response** body

An array of [Book Object](docs/AUTHOR_ROUTES#book-object)s.
