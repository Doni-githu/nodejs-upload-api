import { Schema } from "mongoose";
import { Request } from "express";
export interface IRequest extends Request {
    user: IUser | null
}


export interface IUser {
    username: string,
    email: string,
    password: string,
    _id: Schema.Types.ObjectId,
    __v: number
}


export interface ITokenPayload {
    userId: string;
    iat: number
}

export interface IFileBody {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
}
