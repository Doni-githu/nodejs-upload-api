import express from "express"
import mongoose from "mongoose"
import UserRoutes from "./routes/user"
import FileRoutes from "./routes/post"
import dotenv from "dotenv"
dotenv.config()
const app = express()


app.use(express.json())
app.use(express.static("public"))

app.use('/api/user', UserRoutes)
app.use('/api/file', FileRoutes)

function Run() {
    mongoose.connect(String(process.env.MONGO_URI))
        .then((res) => console.log('Mongo DB connted'))
        .catch((errr) => console.log(errr))
    const PORT = process.env.PORT || 8000
    app.listen(PORT, () => {
        console.log('Server running on port ');
    })
}

Run()