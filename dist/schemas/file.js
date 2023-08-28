"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const FileSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    src: { type: String, required: true },
    type: { type: String, required: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" }
});
const File = (0, mongoose_1.model)('File', FileSchema);
exports.default = File;
