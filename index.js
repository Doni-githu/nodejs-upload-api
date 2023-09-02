import express, { application } from "express"
import mongoose from "mongoose"
import UserRoutes from "./routes/user.js"
import FileRoutes from "./routes/post.js"
import * as dotenv from "dotenv"
import cors from "cors"
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
dotenv.config()
const app = express()




app.use(express.json())
app.use(express.static("public"))
app.use(cors({
    origin: '*',
    allowedHeaders: '*',
    exposedHeaders: '*',
    credentials: 'true'
}))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api/user', UserRoutes)
app.use('/api/file', FileRoutes)

function Run() {
    mongoose.connect(String(process.env.MONGO_URI_LOCAL))
        .then((res) => console.log('Mongo DB connted'))
        .catch((errr) => console.log(errr))
    const PORT = process.env.PORT ?? 8000
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    })
}

Run()