var mongoose = require('mongoose')
   ,Schema = mongoose.Schema
   ,ObjectId = Schema.ObjectId;

 
var groupSchema = new Schema({
    owner:{type:ObjectId, ref: 'User'},
	createdOn: {type:Date, default:Date.now},
	lastModified: {type:Date, default: Date.now},
	members:[{type:ObjectId, ref:'User'}],	
	title:{type:String},
	about:{type:String},
    posts:[{type:ObjectId, ref: 'Post'}],
	meta:{
		likes: [{'user':{type:ObjectId, ref:'User'}, 'like':{type:Number,min:0,max:1}}],		
		flags: [{'user':{type:ObjectId, ref: 'User'}, 'flag':{type:Number,min:2,max:3}}],
		ratings: [{
			user:{type:ObjectId, ref: 'User'},
			rating:{type:Number,min:1, max:10}
		}]
	}
});

module.exports = mongoose.model('Group', groupSchema);