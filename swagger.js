const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    openapi:'3.0.0',
    info: {
      title: 'Pioneer Assignment', // Replace with your API title
      description: `This Node.js application manages user registration, login, and authorization with JWTs. 
      It uses a database to store user credentials. Protected routes require JWT authentication.
       It also fetches external data and provides filtering options based on category and limit.`,
      version: '1.0.0',
    },
    servers: [
      { url: 'http://localhost:3001' }
    ],
  },
  apis: ['./index.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;