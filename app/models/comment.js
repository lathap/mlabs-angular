// The Comment model
 
var mongoose = require('mongoose')
   ,Schema = mongoose.Schema
   ,ObjectId = Schema.ObjectId;
 
var commentSchema = new Schema({
    postid: {type:ObjectId, ref:'Post'}, //id of post to which this comment belongs to.
    date: {type: Date, default: Date.now},
    author: {type: ObjectId, ref:'User'},
    comment: String,
	meta:{
		likes: [{'user':{type:ObjectId, ref:'User'}, 'like':{type:Number,min:0,max:1}}],		
		flags: [{'user':{type:ObjectId, ref: 'User'}, 'flag':{type:Number,min:2,max:3}}],
		ratings: [{
			user:{type:ObjectId, ref: 'User'},
			rating:{type:Number,min:1, max:10}
		}]
	}
});
 
module.exports = mongoose.model('Comment', commentSchema);