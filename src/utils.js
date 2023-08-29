import jwt from "jsonwebtoken"
class JWT {
    static encode(userId) {
        
        return jwt.sign({userId}, "Doniyor")
    }

    static decode(token) {
        return jwt.decode(token, { complete: true })?.payload
    }
}

export {
    JWT
}