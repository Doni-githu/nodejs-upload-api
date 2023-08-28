import { Request, Response, NextFunction } from "express";
import { IRequest, IUser } from "../interfaces/types";
import User from "../schemas/user";
import { JWT } from "../utils";

export default async function (req: IRequest, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
        res.status(400).json({ message: 'You are not authenticated' })
        next()
        return
    }

    const token = req.headers.authorization.replace('Token ', '')
    const userId = JWT.decode(token).userId
    const user = await User.findById<IUser>(userId)
    req.user = user;
}  