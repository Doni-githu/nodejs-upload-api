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
const file_1 = __importDefault(require("../schemas/file"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("../utils");
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    filename: (req, file, callback) => {
        callback(null, (0, uuid_1.v4)() + "-" + file.originalname);
    },
    destination: function (req, file, callback) {
        callback(null, path_1.default.join(__dirname, '..', '..', 'public'));
    },
});
const upload = (0, multer_1.default)({
    storage: storage,
});
router.post('/upload', upload.array('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.headers.authorization) {
            res.status(400).json({ message: 'User not authenticated' });
            return;
        }
        const token = req.headers.authorization.replace('Token ', '');
        let result = utils_1.JWT.decode(token);
        const files = req.files;
        const result2 = files.map(item => ({
            title: item.originalname,
            src: `http://localhost:8000/${item.filename}`,
            type: item.mimetype,
            user: result.userId
        }));
        const result3 = result2.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const newItem = yield file_1.default.create(item);
            return newItem;
        }));
        res.status(201).json(result3);
    }
    catch (error) {
        res.status(400).json({ message: "Wrong token" });
        return;
    }
}));
router.get('/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = yield file_1.default.find().populate('user');
    res.status(200).json(files);
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const file = yield file_1.default.findById(id).populate('user');
    if (!file) {
        res.status(404).json({ message: "File not found" });
        return;
    }
    res.status(200).json(file);
}));
router.delete('/delete/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    if (!req.headers.authorization) {
        res.status(403).json({ message: "User is not authenticated" });
        return;
    }
    const oldFile = yield file_1.default.findById(id);
    if (!oldFile) {
        res.status(404).json({ message: "File not found" });
        return;
    }
    let pathToFile = String(oldFile === null || oldFile === void 0 ? void 0 : oldFile.src.replace('http://localhost:8000/', ''));
    fs_1.default.rm(path_1.default.join(__dirname, '..', '..', 'public', pathToFile), (error) => {
        if (error) {
            console.log(error);
        }
    });
    const file = yield file_1.default.findByIdAndRemove(id, { new: true });
    res.status(200).json({ message: 'Your file was deleted' });
}));
router.put('/edit/:id/file', upload.single('file'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const id = req.params.id;
    if (!req.headers.authorization) {
        res.status(403).json({ message: "User is not authenticated" });
        return;
    }
    const oldFile = yield file_1.default.findById(id);
    if (!oldFile) {
        res.status(404).json({ message: "File not found" });
        return;
    }
    const pathToFile = String(oldFile === null || oldFile === void 0 ? void 0 : oldFile.src.replace('http://localhost:8000/', ''));
    fs_1.default.rm(path_1.default.join(__dirname, '..', '..', 'public', pathToFile), (error) => {
        if (error) {
            console.log(error);
        }
    });
    const updatedFile = yield file_1.default.findByIdAndUpdate(req.params.id, {
        type: file === null || file === void 0 ? void 0 : file.mimetype,
        src: `http://localhost:8000/${file === null || file === void 0 ? void 0 : file.filename}`,
        title: file === null || file === void 0 ? void 0 : file.originalname
    }, { new: true }).populate('user');
    res.status(202).json(updatedFile);
}));
router.put('/edit/:id/title', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const oldFile = yield file_1.default.findById(req.params.id);
    if (!oldFile) {
        res.status(404).json({ message: "Not found" });
        return;
    }
    const updatedFile = yield file_1.default.findByIdAndUpdate(req.params.id, { title: req.body.title }, { new: true });
    res.status(202).json(updatedFile);
}));
exports.default = router;
