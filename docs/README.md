# Library Management System Server

This project is the backend server for our Library Management System. It contains the database and an API to connect to it. This document is intended to explain the API endpoints.

## Access Token

Firstly, I'll say that all endpoints (beside the login endpoint) require a users access token in order to work. To get a token, you must pass account credentials to the `/login` endpoint.

All endponts will have letter in brackets to represent who can access it.

-   `(A)` Library administrator
-   `(U)` Any logged in user
-   `(M)` Current user (same as access token)
-   `(E)` Anyone, logged in or not
