"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JWT {
    static encode(userId) {
        return jsonwebtoken_1.default.sign({ userId }, "Doniyor");
    }
    static decode(token) {
        var _a;
        return (_a = jsonwebtoken_1.default.decode(token, { complete: true })) === null || _a === void 0 ? void 0 : _a.payload;
    }
}
exports.JWT = JWT;
