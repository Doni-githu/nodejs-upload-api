import {Schema, model} from "mongoose"

const PostSchema = new Schema({
    uploads: {type: Schema.Types.Array, required: true}
})

const Post = model('Post', PostSchema)
export default Post