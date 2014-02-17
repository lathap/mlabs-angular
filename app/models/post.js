// The Post model
 
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;
var ACCESS_TYPES = ['user', 'group']
var postSchema = new Schema({
	groupid:{type:ObjectId, ref:'Group'},
    title:  String,
	body: String,
    date: {type: Date, default: Date.now},
	owner: {type:ObjectId, ref:'User'},
	comments:[{ type: ObjectId, ref: 'Comment' }],
	meta:{
		likes: [{'user':{type:ObjectId, ref:'User'}, 'like':{type:Number,min:0,max:1}}],		
		flags: [{'user':{type:ObjectId, ref: 'User'}, 'flag':{type:Number,min:2,max:3}}],
		ratings: [{
			user:{type:ObjectId, ref: 'User'},
			rating:{type:Number,min:1, max:10}
		}]
	}
});

postSchema.virtual("likes").get(function(){
	return this.meta.likes.length;
});
postSchema.virtual("dislikes").get(function(){
	return this.meta.dislikes.length;
});
postSchema.virtual("flags").get(function(){
	return this.meta.flags.length;
});

postSchema.virtual("rating").get(function(){
	var ratings = this.meta.ratings, totalRating = 0;		
	for(var i=0;i<ratings.length;i++){
		totalRating += ratings[i].rating;
	}
	return totalRating/rating.length;
});



module.exports = mongoose.model('Post', postSchema);