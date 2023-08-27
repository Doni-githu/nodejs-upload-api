import jwt from "jsonwebtoken"
import { Schema } from "mongoose"
class JWT {
    static encode(userId: any): string {
        return jwt.sign(userId, "Doniyor")
    }

    static decode(token: string) {
        return jwt.decode(token, { complete: true })
    }
}

export {
    JWT
}