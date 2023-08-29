import { Router } from "express";
import User from "../schemas/user.js";
import bcrypt from "bcrypt"
import { JWT } from "../utils.js";

const router = Router()

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register user
 *     responses:
 *       200:
 *         description: Retrieve token and user
 */
router.post('/register', async (req, res) => {
    const user = req.body


    if (!user.email || !user.password || !user.username) {
        res.status(400).json({ "message": "Username, Email and Password are required fields" })
        return
    }

    const areUserEmailHas = await User.findOne({ email: user.email })
    if (areUserEmailHas) {
        res.status(400).json({ message: 'bu elektron pochta allaqachon mavjud' })
        return
    }

    const hashedPassword = await bcrypt.hash(user.password, 10)

    const userData = {
        ...user,
        password: hashedPassword
    }

    const result = await User.create(userData)
    const token = JWT.encode(result._id)
    res.status(201).json({
        "token": token,
        "user": {
            "username": result?.username,
            "email": result?.email,
            "_id": result?._id
        }
    })
})


/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Login user
 *     responses:
 *       200:
 *         description: Retrieve token and user
 */
router.post('/login', async (req, res) => {
    const user = req.body

    if (!user.email || !user.password) {
        res.status(400).json({ "message": "Email and Password are required fields" })
        return
    }

    const isExistUser = await User.findOne({ email: user.email })


    if (!isExistUser) {
        res.status(404).json({
            message: 'Foydalinuvchi topilmadi'
        })
        return
    }


    const isRightPassword = await bcrypt.compare(user.password, isExistUser.password)

    if (!isRightPassword) {
        res.status(400).json({
            message: 'Parol xato terilgan'
        })
        return
    }

    const token = JWT.encode(isExistUser._id)
    res.status(200).json({
        "token": token,
        "user": {
            "username": isExistUser.username,
            "email": isExistUser.email,
            "_id": isExistUser._id
        }
    })
})

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Get user
 *     description: To get user to must have token in headers Authorization\nWith format `Token {token}`.
 *     responses:
 *       200:
 *         description: Retrieve token and user
 */
router.get('/', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Token ', '')
        const result = JWT.decode(String(token))
        const user = await User.findById(result.userId)
        res.status(200).send({
            "username": user?.username,
            "email": user?.email,
            "_id": user?._id
        })
    } catch (error) {
        res.status(400).json({ "message": "Xato token yubordiz" })
    }
})

export default router