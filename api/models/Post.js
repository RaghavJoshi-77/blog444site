const mongoose = require ('mongoose')
const {Schema,model} = mongoose
//to show the creat3ed post
const PostSchema = new Schema ({
    title:String,
    summary:String,
    content:String,
    cover:String,
    author:{type:Schema.Types.ObjectId,ref:"User"}

},{
    timestamps:true,
})



const PostModel = model ('post', PostSchema)

module.exports = PostModel