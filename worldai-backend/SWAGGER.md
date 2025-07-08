# Swagger API Documentation

This project uses Swagger UI to provide interactive API documentation.

## Accessing the Documentation

After starting the server, you can access the Swagger UI documentation at:

```
http://localhost:YOUR_PORT/api-docs
```

## Adding Documentation to API Endpoints

To document an API endpoint, add JSDoc-style comments above the route definitions. Here's an example:

```javascript
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user and get access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', AuthController.signin);
```

## Schema Definitions

Common schema definitions can be found in the `swagger.js` file. If you create new models, consider adding their schema definitions to this file.

## Further Reading

For more information on how to document your API with Swagger, refer to the official documentation:

- [Swagger JSDoc](https://github.com/Surnet/swagger-jsdoc/blob/master/docs/README.md)
- [OpenAPI Specification](https://swagger.io/specification/) 