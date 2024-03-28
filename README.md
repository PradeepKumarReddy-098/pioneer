
This Node.js application provides user registration, login, authorization, and data retrieval functionalities.

## Deployment Links
 -  Deploy Link: https://pioneer-0zen.onrender.com/
 -  add path at the end of the url <br />
   eg:  `https://pioneer-0zen.onrender.com/user`, `https://pioneer-0zen.onrender.com/login`
 -  Swagger doc Link: https://pioneer-0zen.onrender.com/api-docs/

## Features:

- User registration and login with JWT-based authentication
- Secure access to protected routes using JWT tokens
- External data fetching with filtering options (category and limit)

## Prerequisites:

- Node.js and npm (or yarn) installed on your system
- A database (SQLite used in this example)

## Setup:

- Clone this repository.
- Install dependencies: npm install (or yarn install)
- Create a file named .env (ignored by Git) containing environment variables:
- DATABASE_URL: Path to your SQLite database file (e.g., sqlite://pioneerlab.db)
- AUTHENTICATION_TOKEN: Secret key used for JWT token generation

## Running the Application:

- Start the server: node index.js (main file)
- The server will run on port 3001 by default (http://localhost:3001/)

## Swagger Doc
- You can access the swagger documentation at http://localhost:3001/api-docs/
- and also at https://pioneer-0zen.onrender.com/api-docs/

**User Table**

| Column   | Type         |
| -------- | ------------ |
| id       | INTEGER      |
| username | varchar(250) |
| email    | varchar(250) |
| password | TEXT         |

## API Endpoints:

<Section id="section1" >

# Registration:

#### Path: `/register/`

#### Method: `POST`

**Body**

```
{
  "username": "adam_richard",
  "email": "adam_richard@gmail.com",
  "password": "richard_567"
}
```

</Section>

<Section id="section2" >

# Login:

#### Path: `/login`

#### Method: `POST`

**Body**

```
{
  "username": "adam_richard",
  "password": "richard_567"
}
```

</Section>

<Section id="section3" >

# Protected Route (requires JWT authorization):

#### Path: `/user`

#### Method: `GET`

**response**

Returns a welcome message for authorized users.

</Section>

<Section id="section4" >

# Data Retrieval (requires JWT authorization):

#### Path: `/data`

#### Method: `GET`

**Query Parameters(optional)**

- category: Filter data by category (string)
- limit: Limit the number of returned entries (integer)

**response**

JSON object containing the requested data

</Section>

<Section id="section5" >

## Logout (Client-Side Handling):

#### Path: `/logout`

#### Method: `GET`

**response**

```
{
  message:"logout successfully"
}
```

</Section>

Use `npm install` to install the packages.

**Export the express instance using the default export syntax.**

**Use Common JS module syntax.**
