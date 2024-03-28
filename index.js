const express = require("express");
require('dotenv').config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger.js');
const getApiData = require('./data.js');
const Web3 = require('web3');

const app = express();

app.use(express.json());

let db=null;
const dbPath = path.join(__dirname,"pioneerlab.db");
const port = process.env.PORT || 3001;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(port, () => {
      console.log(`Server Running at http://localhost:${port}/`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();


const authenticateUser = (req, res, next) => {
  let jwtToken;
  const authHeader = req.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    res.status(401);
    res.send("Invalid JWT Token. Unauthorized, Login to get access");
  } else {
    //console.log(authHeader)
    jwt.verify(jwtToken, "AUTHENTICATION_TOKEN", async (error, payload) => {
      if (error) {
        res.status(401);
        res.send("Invalid JWT Token. Unauthorized, Login to get access");
      } else {
        //console.log("reached")
        next();
      }
    });
  }
};

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user with username, email, and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for the new user
 *               email:
 *                 type: string
 *                 description: Email address of the new user
 *               password:
 *                 type: string
 *                 description: Password for the new user
 *             example:
 *               username: "Varun"
 *               email: "Varun@example.com"
 *               password: "secret123"
 *     responses:
 *       201:
 *         description: User registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *             example:
 *               message: "Registration successful!"
 *       400:
 *         description: Bad request. Missing required fields or username/email already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *             example:
 *               message: "Please provide username, email, and password."
 *       409:
 *         description: Username or email already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *             example:
 *               message: "Username or email already exists."
 *
 */


app.post('/register',async(req,res)=>{
    const {username,email,password} = req.body;
    if (!username || !email || !password) {
        res.status(400)
        res.send({ message: 'Please provide username, email, and password.' });
      }else{
        const checkUserExits = await db.get(`SELECT * FROM user WHERE username = ? OR email = ?`, [username, email.toLowerCase()]);
        if (checkUserExits){
          if(checkUserExits.username===username){
              res.status(409);
              res.send({message:"username already exit."});
          }else{
              res.status(409).json({message:"email already exit."});
          }
        }else{
          const hashedPassword = await bcrypt.hash(password,10);
          const insertQuery = `INSERT INTO user (username, email, password) VALUES (?, ?, ?)`;
          await db.run(insertQuery, [username, email.toLowerCase(), hashedPassword]);
          res.status(201).json({ message: 'Registration successful!'});
        }
     }
  });

  /**
 * @swagger
 * /login:
 *   post:
 *     summary: Login User
 *     description: Login a user with username and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username of the user
 *               password:
 *                 type: string
 *                 description: Password of the user
 *             example:
 *               username: "Suresh"
 *               password: "secret123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jwtToken:
 *                   type: string
 *                   description: JWT token for authorization
 *             example:
 *               jwtToken: "eyJhbGciOiJIUzI1NiIsInR5..."
 *       400:
 *         description: Bad request. Missing credentials or invalid username/password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *             example:
 *               message: "Invalid username or password"
 * 
 *
 */

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password){
    res.status(400)
    res.send({ message: 'Please provide username and password.' });
  }else{
    const selectUserQuery = `SELECT * FROM user WHERE username = ?`;
    const dbUser = await db.get(selectUserQuery,[username]);
    if (dbUser === undefined) {
      res.status(400);
      res.send("Invalid Username. Please register, If you are new.");
    } else {
      const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
      if (isPasswordMatched === true) {
        const payload = {
          username: username,
        };
        const jwtToken = jwt.sign(payload, "AUTHENTICATION_TOKEN");
        res.send({ jwtToken });
      } else {
        res.status(400);
        res.send("Invalid Password");
      }
    }
  }
});

/**
 * @swagger
 * securityDefinitions:
 *   bearerAuth:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 * /user:
 *   get:
 *     summary: Get Protected Data
 *     description: Returns a message for authorized users.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authorized user message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Welcome message for authorized users
 *             example:
 *               message: "Welcome, authorized user!"
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for unauthorized access
 *             example:
 *               message: "Invalid JWT Token. Unauthorized, Login to get access"
 *
 */


app.get("/user", authenticateUser, async(req, res) => {
  res.send({ message: "Welcome, authorized user!" });
});

/**
 * @swagger
 * securityDefinitions:
 *   bearerAuth:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 * /data:
 *   get:
 *     summary: Get API Data (Filtered and Limited)
 *     description: Returns API data, optionally filtered by category and limited by entries.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: category
 *         in: query
 *         description: Filter data by category (optional).
 *         required: false
 *         type: string
 *       - name: limit
 *         in: query
 *         description: Limit the number of returned entries (optional).
 *         required: false
 *         type: integer
 *     responses:
 *       200:
 *         description: Fetched data without parameters or with category or with limit or with both category and limit
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 # Replace with actual properties of your data objects
 *                 properties:
 *                   # ... your data object properties ...
 *             example:
 * 
 *               - {
 *                   id: 1,
 *                   title: "Data Entry 1",
 *                   category: "Technology",
 *                   ...(other properties of your data object 1)
 *                 }
 *               - {
 *                   id: 2,
 *                   title: "Data Entry 2",
 *                   category: "Science",
 *                   ...(other properties of your data object 2)
 *                 }
 *                
 *       400:
 *         description: Bad request (invalid limit value)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for invalid limit
 *             example:
 *               message: "Invalid limit value. Limit must be a positive integer."
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for unauthorized access
 *             example:
 *               message: "Invalid JWT Token. Unauthorized, Login to get access"
 *       404:
 *         description: No entries found for the specified category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for no entries found
 *             example:
 *               message: "No entries found for this category"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for server error
 *             example:
 *               message: "Failed to retrieve data"
 *
 */


app.get('/data', authenticateUser, async (req, res) => {
  const {category,limit} = req.query;
  let data;
  try {
    const d = await getApiData(); 
    //console.log(d)
    data=d.entries
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Failed to retrieve data');
  }
  //console.log(data)
  //console.log(data.filter(each => each.Category === 'Blockchain'))
  switch(true){
    case category!==undefined && limit!==undefined:
      const catagoryData = data.filter(each => each.Category === category);
      const limitResponseData = catagoryData.slice(0,limit);
      res.send(limitResponseData);
      break;
    case category!==undefined:
      const categoryData = data.filter(each => each.Category===category);
      if (categoryData.length > 0) { 
        res.send(categoryData);
      } else {
        res.status(404).send('No entries found for this category'); 
      }
      break;
    case (limit!==undefined && (parseInt(limit) > 0)):
      const limitResponse = data.slice(0, limit)
      res.send(limitResponse)
      break;
    default:
      res.send(data);
  }
});

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Logout (Client-Side Handling)
 *     description: This endpoint does not perform server-side logout actions. 
 *                  It's intended to be used as a client-side notification 
 *                  to clear JWT tokens and user session information.
 *     responses:
 *       200:
 *         description: Logout successful (informational for client)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message for logout
 *             example:
 *               message: "Successfully logged out. Please clear your JWT token and user session information."
 *
 */
app.get('/logout', (req, res) => {
  res.send('Successfully logged out. Please clear your JWT token and user session information.');
});