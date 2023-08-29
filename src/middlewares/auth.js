import User from "../schemas/user.js";
import { JWT } from "../utils.js";

export default async function (req, res, next) {
    if (!req.headers.authorization) {
        res.status(400).json({ message: 'You are not authenticated' })
        next()
        return
    }

    const token = req.headers.authorization.replace('Token ', '')
    const userId = JWT.decode(token).userId
    const user = await User.findById(userId)
    req.user = user;
}  