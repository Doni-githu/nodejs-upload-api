import { Schema, model } from "mongoose"

const FileSchema = new Schema({
    title: { type: String, required: true, unique: true },
    src: { type: String, required: true },
    type: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    dowloads: { type: Number, default: 0 },
    like: { type: Number, default: 0 },
}, { timestamps: true })

const File = model('File', FileSchema)
export default File