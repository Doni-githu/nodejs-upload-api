import {Schema, model} from "mongoose"

const FileSchema = new Schema({
    title: {type: String, required: true},
    src: {type: String, required: true},
    type: {type: String, required: true},
    user: {type: Schema.Types.ObjectId, ref: "User"}  
})

const File = model('File', FileSchema)
export default File