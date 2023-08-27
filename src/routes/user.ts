import { Router } from "express";
import { IUser } from "src/interfaces/types";
import User from "src/schemas/user";
import bcrypt from "bcrypt"
import { JWT } from "src/utils";

const router = Router()


router.post('/register', async (req, res) => {
    const user = req.body as Omit<IUser, "_id" | "__v">
    
    const areUserEmailHas = await User.findOne({email: user.email})
    if(areUserEmailHas){
        res.status(400).json({message: 'bu elektron pochta allaqachon mavjud'})
        return
    }

    const hashedPassword = await bcrypt.hash(user.password, 10)

    const userData:Omit<IUser, "_id" | "__v"> = {
        ...user,
        password: hashedPassword
    }

    const result = await User.create(userData)
    const token = JWT.encode(result._id)
    res.status(201).json({
        "token": token,
        "user": result
    })
})

router.post('/login', async (req, res) => {
    const user = req.body as Pick<IUser, "email" | "password">

    const isExistUser = await User.findOne({email: user.email})
    

    if(!isExistUser){
        res.status(404).json({
            message: 'Foydalinuvchi topilmadi'
        })
        return
    }


    const isRightPassword = await bcrypt.compare(user.password, isExistUser.password)

    if(!isRightPassword){
        res.status(400).json({
            message: 'Parol xato terilgan'
        })
        return
    }

    const token = JWT.encode(isExistUser._id)
    res.status(200).json({
        "token": token,
        "user": isExistUser
    })
})

router.get('/get', async (req, res) => {
    const token = req.headers.authorization?.replace('Token ', '')
    const result = JWT.decode(String(token))
    console.log(result?.payload);
})

export default router