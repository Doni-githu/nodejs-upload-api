import swaggerJSDoc from "swagger-jsdoc"

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Your API',
            version: '1.0.0',
            description: 'API documentation for your Node.js Express application',
        },
    },
    apis: ['./routes/user.js', './routes/post.js']
};


const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec