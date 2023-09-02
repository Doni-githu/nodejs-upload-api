import { Router } from "express";
import File from "../schemas/file.js"
import multer from "multer";
import { v4 as uuid4 } from "uuid"
import path, { dirname } from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import { JWT } from "../utils.js";
const BASE_URL = process.env.BASE_URL


const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)


const router = Router()
const storage = multer.diskStorage({
    filename: (req, file, callback) => {
        callback(null, uuid4() + path.extname(file.originalname))
    },
    destination: function (req, file, callback) {
        callback(null, path.join(__dirname, '..', 'public'))
    },
})


const fileFilter = function (req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(new Error('File type not supported'), false);
    } else {
        cb(null, true);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
})

const uploadFiles = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'audio/mpeg', 'audio/wav'];
        if (!allowedTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error('Unsupported file type'), false);
        }
    },
}).array('file')

/**
 * @swagger
 * /api/file/upload:
 *   post:
 *     summary: Upload files
 *     description: to upload you have to send with content-type:multipart/form-data 
 *     responses:
 *       200:
 *         description: Retrieve uploaded files
 */
router.post('/upload', async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            res.status(400).json({ message: 'User not authenticated' })
            return
        }

        const token = req.headers.authorization.replace('Token ', '')
        let result = JWT.decode(token)
        uploadFiles(req, res, async function (err) {
            if (err) {
                res.status(400).json({ "message": "Unsupported file type" })
                next()
                return
            } else {
                const files = req.files
                console.log(req.files);
                const result2 = files.map(item => ({
                    title: item.originalname,
                    src: `http://localhost:8000/${item.filename}`,
                    type: item.mimetype,
                    user: result.userId
                }))
                const messages = []
                for (let i = 0; i < result2.length; i++) {
                    const element = result2[i];
                    const existingPost = await File.findOne({ title: element.title })
                    if (existingPost) {
                        messages.push(element.title + " : bu file allachon bor")
                    }
                }

                if (messages.length !== 0) {
                    res.status(400).json(messages)
                }
                const newData = []
                for (let i = 0; i < result2.length; i++) {
                    const element = result2[i];
                    const newFile = await File.create(element)
                    newData.push(newFile)
                }
                res.status(201).json(newData)
            }
        });
    } catch (error) {
        res.status(400).json({ message: "Some things went to wrong" })
        return
    }

})

/**
 * @swagger
 * /api/file/all:
 *   get:
 *     summary: Get all files
 *     description: Retrieve a list of all files.
 *     responses:
 *       200:
 *         description: A list of files.
 */
router.get('/all', async (req, res) => {
    const files = await File.find().populate('user')
    res.status(200).json(files)
})


/**
 * @swagger
 * /api/file/:id:
 *   get:
 *     summary: Get one file
 *     description: Retrieve file.
 *     responses:
 *       200:
 *         description: Retrieve file.
 */
router.get('/:id', async (req, res) => {
    const id = Number(req.params.id)
    const file = await File.findById(id).populate('user', '_id username email')
    if (!file) {
        res.status(404).json({ message: "File not found" })
        return
    }
    res.status(200).json(file)
})

/**
 * @swagger
 * /api/file/delete/:id:
 *   delete:
 *     summary: Delete one file
 *     description: Delete one file.
 *     responses:
 *       200:
 *         description: Retrieve success message.
 */
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
    let pathToFile = String(oldFile?.src.replace(`http://localhost:8000/`, ''))
    fs.rm(path.join(__dirname, '..', 'public', pathToFile), (error,) => {
        if (error) {
            console.log(error);
        }
    })
    const file = await File.findByIdAndRemove(id, { new: true })
    res.status(200).json({ message: 'Your file was deleted' })
})
/**
 * @swagger
 * /api/file/edit/:id/file:
 *   put:
 *     summary: Update file
 *     description: Update file.
 *     responses:
 *       200:
 *         description: Retrieve success message.
 */
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
    const pathToFile = String(oldFile?.src.replace(`http://localhost:8000/`, ''))
    fs.rm(path.join(__dirname, '..', 'public', pathToFile), (error) => {
        if (error) {
            console.log(error);
        }
    })
    const updatedFile = await File.findByIdAndUpdate(req.params.id, {
        type: file?.mimetype,
        src: `${BASE_URL}/${file?.filename}`,
        title: file?.originalname
    }, { new: true }).populate('user', '_id username email')
    res.status(202).json(updatedFile)
})


/**
 * @swagger
 * /api/file/edit/{id}/title:
 *   put:
 *     description: Get all Employee by Email 
 *     responses:Update title of file:
 *         200:
 *            description: Get all Employee by Email 
 * 
 */
router.put('/edit/:id/title', async (req, res, next) => {
    const oldFile = await File.findById(req.params.id)
    if (!oldFile) {
        res.status(404).json({ message: "Not found" })
        return
    }
    const updatedFile = await File.findByIdAndUpdate(
        req.params.id,
        {
            title: req.body.title
        },
        {
            new: true
        }).populate('user', '_id username email')
    res.status(202).json(updatedFile)
})

/**
 * @swagger
 * /api/file/like/{id}:
 *   post:
 *     summary: Like file
 *     responses:
 *       200:
 *         description: Retrieve liked file
 */
router.put('/like/:id', async (req, res) => {
    const id = req.params.id
    const oldFile = await File.findById(id)
    const file = await File.findByIdAndUpdate(id, {
        like: oldFile.like + 1
    })
    res.status(200).json(file)
})


/**
 * @swagger
 * /api/file/unlike/{id}:
 *   post:
 *     summary: UnLike file
 *     responses:
 *       200:
 *         description: Retrieve UnLiked file
 */
router.put('/unlike/:id', async (req, res) => {
    const id = req.params.id
    const oldFile = await File.findById(id)
    const file = await File.findByIdAndUpdate(id, {
        like: oldFile.like - 1
    })
    res.status(200).json(file)
})

/**
 * @swagger
 * /api/file/dowload/{id}:
 *   post:
 *     summary: Dowload file
 *     responses:
 *       200:
 *         description: Retrieve Dowload file
 */
router.get('/dowload/:id', async (req, res) => {
    const id = req.params.id
    const oldFile = await File.findById(id)
    if (!oldFile) {
        res.status(404).json({ message: 'file not found' })
        return
    }
    const file = await File.findByIdAndUpdate(id, {
        like: oldFile.dowloads + 1
    })

    const path = file.src.replace('http://localhost:8000/', '')
    res.download(path, (error) => {
        console.log(error);
    })
})

export default router