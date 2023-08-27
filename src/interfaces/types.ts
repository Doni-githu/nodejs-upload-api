import { Schema } from "mongoose";

export interface IUser {
    username: string,
    email: string,
    password: string,
    _id: Schema.Types.ObjectId,
    __v: number
}
