"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = __importDefault(require("../schemas/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const utils_1 = require("../utils");
const router = (0, express_1.Router)();
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body;
    if (!user.email || !user.password || !user.username) {
        res.status(400).json({ "message": "Username, Email and Password are required fields" });
        return;
    }
    const areUserEmailHas = yield user_1.default.findOne({ email: user.email });
    if (areUserEmailHas) {
        res.status(400).json({ message: 'bu elektron pochta allaqachon mavjud' });
        return;
    }
    const hashedPassword = yield bcrypt_1.default.hash(user.password, 10);
    const userData = Object.assign(Object.assign({}, user), { password: hashedPassword });
    const result = yield user_1.default.create(userData);
    const token = utils_1.JWT.encode(result._id);
    res.status(201).json({
        "token": token,
        "user": {
            "username": result === null || result === void 0 ? void 0 : result.username,
            "email": result === null || result === void 0 ? void 0 : result.email,
            "_id": result === null || result === void 0 ? void 0 : result._id
        }
    });
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body;
    if (!user.email || !user.password) {
        res.status(400).json({ "message": "Email and Password are required fields" });
        return;
    }
    const isExistUser = yield user_1.default.findOne({ email: user.email });
    if (!isExistUser) {
        res.status(404).json({
            message: 'Foydalinuvchi topilmadi'
        });
        return;
    }
    const isRightPassword = yield bcrypt_1.default.compare(user.password, isExistUser.password);
    if (!isRightPassword) {
        res.status(400).json({
            message: 'Parol xato terilgan'
        });
        return;
    }
    const token = utils_1.JWT.encode(isExistUser._id);
    res.status(200).json({
        "token": token,
        "user": {
            "username": isExistUser.username,
            "email": isExistUser.email,
            "_id": isExistUser._id
        }
    });
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Token ', '');
        const result = utils_1.JWT.decode(String(token));
        const user = yield user_1.default.findById(result.userId);
        res.status(200).send({
            "username": user === null || user === void 0 ? void 0 : user.username,
            "email": user === null || user === void 0 ? void 0 : user.email,
            "_id": user === null || user === void 0 ? void 0 : user._id
        });
    }
    catch (error) {
        res.status(400).json({ "message": "Xato token yubordiz" });
    }
}));
exports.default = router;
