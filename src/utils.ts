import jwt from "jsonwebtoken"
import { ITokenPayload } from "./interfaces/types"
class JWT {
    static encode(userId: any): string {
        
        return jwt.sign({userId}, "Doniyor")
    }

    static decode(token: string) {
        return jwt.decode(token, { complete: true })?.payload as ITokenPayload
    }
}

export {
    JWT
}