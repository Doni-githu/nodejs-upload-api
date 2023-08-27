import express from "express"
import mongoose from "mongoose"
const app = express()

    

app.use(express.json())
app.use(express.static("public"))


function Run() {
    mongoose.connect('mongodb://localhost:27017/upload')
        .then((res) => console.log('Mongo DB connted'))
        .catch((errr) => console.log(errr))
    const PORT = process.env.PORT || 8000
    app.listen(PORT, () => {
        console.log('Server running on port ');
    })
}

Run()