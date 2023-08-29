import { Router } from "express";
import File from "../schemas/file.js"
import multer from "multer";
import { v4 as uuid4 } from "uuid"
import path from "path"
import fs from "fs"

import { JWT } from "../utils.js";
import User from "../schemas/user.js";
import auth from "../middlewares/auth.js";
const router = Router()
const storage = multer.diskStorage({
    filename: (req, file, callback) => {
        callback(null, uuid4() + "-" + file.originalname)
    },
    destination: function (req, file, callback) {
        callback(null, path.join(__dirname, '..', '..', 'public'))
    },
})


const upload = multer({
    storage: storage,
})

router.post('/upload', upload.array('file'), async (req, res) => {
    try {
        if (!req.headers.authorization) {
            res.status(400).json({ message: 'User not authenticated' })
            return
        }

        const token = req.headers.authorization.replace('Token ', '')
        let result = JWT.decode(token)

        const files = req.files
        const result2 = files.map(item => ({
            title: item.originalname,
            src: `http://localhost:8000/${item.filename}`,
            type: item.mimetype,
            user: result.userId
        }))

        const result3 = result2.map(async (item) => {
            const newItem = await File.create(item)
            return newItem
        })
        res.status(201).json(result3)
    } catch (error) {
        res.status(400).json({ message: "Wrong token" })
        return
    }

})


router.get('/all', async (req, res) => {
    const files = await File.find().populate('user')
    res.status(200).json(files)
})

router.get('/:id', async (req, res) => {
    const id = Number(req.params.id)
    const file = await File.findById(id).populate('user')
    if (!file) {
        res.status(404).json({ message: "File not found" })
        return
    }
    res.status(200).json(file)
})


router.delete('/delete/:id', async (req, res, next) => {
    const id = req.params.id
    if (!req.headers.authorization) {
        res.status(403).json({ message: "User is not authenticated" })
        return
    }
    const oldFile = await File.findById(id)
    if (!oldFile) {
        res.status(404).json({ message: "File not found" })
        return
    }
    let pathToFile = String(oldFile?.src.replace('http://localhost:8000/', ''))
    fs.rm(path.join(__dirname, '..', '..', 'public', pathToFile), (error,) => {
        if (error) {
            console.log(error);
        }
    })
    const file = await File.findByIdAndRemove(id, { new: true })
    res.status(200).json({ message: 'Your file was deleted' })
})

router.put('/edit/:id/file', upload.single('file'), async (req, res, next) => {
    const file = req.file
    const id = req.params.id
    if (!req.headers.authorization) {
        res.status(403).json({ message: "User is not authenticated" })
        return
    }
    const oldFile = await File.findById(id)
    if (!oldFile) {
        res.status(404).json({ message: "File not found" })
        return
    }
    const pathToFile = String(oldFile?.src.replace('http://localhost:8000/', ''))
    fs.rm(path.join(__dirname, '..', '..', 'public', pathToFile), (error) => {
        if (error) {
            console.log(error);
        }
    })
    const updatedFile = await File.findByIdAndUpdate(req.params.id, {
        type: file?.mimetype,
        src: `http://localhost:8000/${file?.filename}`,
        title: file?.originalname
    }, { new: true }).populate('user')
    res.status(202).json(updatedFile)
})

router.put('/edit/:id/title', async (req, res, next) => {
    const oldFile = await File.findById(req.params.id)
    if (!oldFile) {
        res.status(404).json({ message: "Not found" })
        return
    }
    const updatedFile = await File.findByIdAndUpdate(req.params.id, { title: req.body.title }, { new: true })
    res.status(202).json(updatedFile)
})


export default router