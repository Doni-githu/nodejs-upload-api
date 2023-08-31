import { Router } from "express";
import User from "../schemas/user.js";
import bcrypt from "bcrypt"
import { JWT } from "../utils.js";
import SendMail from "../utils/sender_mail.js"
import vCode from "../utils/code.js";

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
    const isUserUsernameHas = await User.findOne({ username: user.username })

    if (areUserEmailHas) {
        res.status(400).json({ message: 'bu elektron pochta allaqachon mavjud' })
        return
    }

    if (isUserUsernameHas) {
        res.status(400).json({ message: "bu username allaqachon mavjud" })
        return
    }

    const hashedPassword = await bcrypt.hash(user.password, 10)

    const userData = {
        ...user,
        password: hashedPassword,
        verify: false
    }
    const code = vCode()
    const result = await User.create(userData)
    SendMail(user.email, code)
        .then(() => {
            res.status(200).json({ message: "Verification email sent successfully", code: code, id: result._id })
        }).catch((err) => {
            res.status(500).json({ message: "Try again" })
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

    if (!isExistUser.verify) {
        const code = vCode()
        SendMail(isExistUser.email, code)
            .then((response) => {
                console.log(response);
                res.status(200).json({ message: "Verification email sent successfully", code: code, id: isExistUser._id })
            }).catch((err) => {
                console.log(err)
                res.status(500).json({ message: "Try again" })
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
 * /api/user:
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


router.post('/:id', async (req, res) => {
    const { id } = req.params
    const newUpdated = await User.findByIdAndUpdate(id, { verify: true }, { new: true })
    const token = JWT.encode(id)
    res.status(200).json({
        "token": token,
        "user": {
            "email": newUpdated.email,
            "username": newUpdated.username,
            "_id": newUpdated._id
        }
    })
})
export default router