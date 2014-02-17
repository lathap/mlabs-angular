/* The API controller  
*/
 
var _ = require('underscore');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');
var User = require('../models/user.js');
var Group = require('../models/group.js');

 /**********************************************************************
-------------------------CONSTANTS--------------------------------------
 ***********************************************************************/

var ACTIONS = {
	LIKE:'0',
	DISLIKE:'1',
	FLAG: '2',
	UNFLAG: '3',
	RATE: '4'
};
 /**********************************************************************
-------------------------COMMON--------------------------------------
 ***********************************************************************/
 //setMeta method is helper function 
 //sets likes or dislikes or flags or rating on either comment or post
var setMeta = function(err, post, req, res, action){
	var dirty = false,
	    user = req.session.user._id;
	console.log(req.session.user)
	switch(action){
		case ACTIONS.LIKE:
		case ACTIONS.DISLIKE:			
			var like = _.find(post.meta.likes,function(item){				
				return item.user == user;
			});
			if(like){
				like.like = action;
				console.log(like);
			}else{
				post.meta.likes.push({'user':user,'like':action});				
			}
			dirty = true;
			break;
		case ACTIONS.FLAG:
		case ACTIONS.UNFLAG:
			var flag = _.find(post.meta.flags,function(item){
				return item.user == user;
			});
			if(flag){
				flag.flag = action;
			}else{
				post.meta.flags.push({'user':user,'like':action});
			}
			dirty = true;
			break;
		case ACTIONS.RATE:
			var rating ={};
			post.meta.rating[req.session.user._id] = req.body.rating;
			dirty = true;
			break;
	}
	if(dirty){
		post.save(function(err, post){
			wrapJson(req, res , post);
		});
	}else{
		wrapJson(req, res , null);
	}	
}
var wrapJson = function(req, res, json, errors){
	var response = {
		user: req.session.loggedIn ? req.session.user : 'GUEST',
		data:json,
		errors:errors
	};
	res.send(response);	
}
var getParams = function(req){
	 var p = {};
	 _.extend(p, req.params, req.body)
	 return p;
}
var getAction  = function(req, res, model){
	var id = getParams(req).id;
	var action =(req.path.match('/like') && ACTIONS.LIKE) ||
				(req.path.match('/dislike') && ACTIONS.DISLIKE) ||
				(req.path.match('/flag') && ACTIONS.FLAG) ||
				(req.path.match('/unflag') && ACTIONS.UNFLAG) ||
				(req.path.match('/rate') && ACTIONS.RATE) 
			
	model.findOne.call(model, id, function(err, post){
		setMeta(err, post, req, res, action)
	});
 };
 /**********************************************************************
-------------------------POSTS API--------------------------------------
 ***********************************************************************/
 
//Creates a new post
exports.post = {};
exports.post.add = function(req, res) {
	var params = getParams(req);
	new Post({title: params.title, body: params.body}).save(function(err, post){
		wrapJson(req, res , post);
	});	
}

//Creates a new post
exports.post.add = function(req, res) {
	var params = getParams(req);
    new Post({title: req.body.title, body:req.body.body, groupid: req.body.groupid, owner:req.session.user._id})
	.save(function(err, post){
		//insert post._id in parent group
		Group.findOne({_id:post.groupid}).exec(function(error, group){
			group.posts.push(post._id);			
			group.save(function(err, group){
				wrapJson(req, res , group);
			});			
		});
	});
}

//Get all the posts
exports.post.findAll = function(req, res) {
  Post.find().populate('comments').exec(function(err, posts) {
    wrapJson(req, res , posts);
  });
}

//Get post by id
exports.post.findById = function(req, res) {
  var params = getParams(req);
  Post.findOne({_id:params.id}).populate('comments').exec(function(err, post) {
    wrapJson(req, res , post);
  });
}

exports.post.like = 
exports.post.dislike = 
exports.post.flag = 
exports.post.unflag =
exports.post.rate = function(req, res){
	getAction(req, res, Post);
}

 /**********************************************************************
-------------------------COMMENTS API--------------------------------------
 ***********************************************************************/
exports.comment = {};
//Creates a new comment
exports.comment.add = function(req, res) {
	var params = getParams(req);
    new Comment({
		comment: params.comment, 
		postid: params.postid, 
		owner:req.session.user._id
	})
	.save(function(err, comment){
		//insert comment._id in parent post
		Post.findOne({_id:comment.postid}).exec(function(error, Post){
			Post.comments.push(comment._id);			
			Post.save(function(err, Post){
				wrapJson(req, res , comment);
			});			
		});
	});
}

 
//Get the comments for a post
exports.comment.findById= (function(req, res) {
	var params = getParams(req);
    Comment.findOne({_id: params.id}, function(err, comment) {
        wrapJson(req, res , comment);
    });
});

//find a comment by its Id
exports.comment.findByPostId = (function(req, res) {
	var params = getParams(req);
    Comment.find({postid: params.postid}, function(err, comments) {
        wrapJson(req, res , comments);
    });
});

exports.comment.like = 
exports.comment.dislike = 
exports.comment.flag = 
exports.comment.unflag =
exports.comment.rate = function(req, res){
	getAction(req, res, Comment);
}

/**********************************************************************
-------------------------GROUPS API--------------------------------------
 ***********************************************************************/
 
 exports.group = {}
 
 exports.group.add = function(req, res){
	var params = getParams(req);
	new Group({
		title: params.title,
		about: params.body,
		owner:req.session.user._id,
		members:[],
		posts:[]		
	})
	.save(function(err, group){
			wrapJson(req, res , group);
	});
 };
 exports.group.remove = function(req, res){
	var params = getParams(req);
	Group.remove({_id:params.id},function(err){
		wrapJson(req, res, {});
	});
 };
 exports.group.update = function(req, res)
 {
	var params = getParams(req);
	console.log(params);
	Group.findOne({_id:params.id},function(err, group){	
		var desc = params.description || group.description || null,
			name = params.name || group.name || null,
			title = params.title || group.title || null,
		    dirty = params.name || params.title || params.description;
		
		if(dirty){
			group.name = name;
			group.description = desc;
			group.title = title;
			group.save(function(err, group){
				wrapJson(req, res , group);
			});
		}else{
			wrapJson(req, res , null);
		}
	});
 };
 
 exports.group.findAll = function(req, res){
	if(req.session.loggedIn && req.session.user._id){
		Group.find({owner:req.session.user._id}).exec(function(err, groups){
			wrapJson(req, res , groups);
		});
	}else{
		wrapJson(req, res , []);
	}
 };
 
 exports.group.findById = function(req, res){
	var params = getParams(req);
	Group.findOne({_id:params.id}).exec(function(err, group){
		wrapJson(req, res , group);
	});
 };
 exports.group.getPosts = function(req, res){
	var params = getParams(req);
	Group.findOne({_id:params.id}).populate('posts').exec(function(err, group){
		wrapJson(req, res , group.posts);
	})
 };
 exports.group.addMembers = function(req, res){
	var params = getParams(req);
	Group.findById(params.id,function(err, group){
		var members = (params.member ? [params.member] : params.members) || []; // TODO add more robust checking
		var validMembers = [];
		_.each(members, function(user){
			User.findById(user,function(err, user){
				validMembers.push(user._id);
			});
		});
		group.members = _.union(group.members, validMembers);		
		group.save(function(err, group){
			Group.populate(group,{path:'members',model:'User'}).exec(function(err, group){
				wrapJson(req, res , group.members);
			});
		});
	});
 };
 exports.group.getMembers = function(req, res){ 
	var params = getParams(req);
	 Group.findById(params.id).populate('members').exec(function(err, group){
		wrapJson(req, res , group.members);
	 });
 };
 
exports.group.like = 
exports.group.dislike = 
exports.group.flag = 
exports.group.unflag =
exports.group.rate = function(req, res){
	getAction(req, res, Group);
}
 
 

 /**********************************************************************
-------------------------USER LOGIN API--------------------------------------
 ***********************************************************************/
 
//LOGIN USER
exports.login = function(req, res) {	
	 User.getAuthenticated(req.body.username, req.body.password, function(err, user, reason) {
        if (err) throw err;

        // login was successful if we have a user
        if (user) {
            // handle login success
            req.session.loggedIn = true;
            wrapJson(req, res , {});
			return;
        }

        // otherwise we can determine why we failed
        var reasons = User.failedLogin;
        switch (reason) {
            case reasons.NOT_FOUND:
            case reasons.PASSWORD_INCORRECT:
                // note: these cases are usually treated the same - don't tell
                // the user *why* the login failed, only that it did
                break;
            case reasons.MAX_ATTEMPTS:
                // send email or otherwise notify user that account is
                // temporarily locked
                break;
        }
		req.sesson.loggedIn = false;
        wrapJson(req, res , {});
    });
}
//CREATE USER
exports.user = function (req, res) {
	var params = getParams(req);
    var user = new User({
        username:params.username,
        password:params.password,
        email:params.email
    });

    user.save(function (err, user) {
        if (err) res.json(err);        
        exports.login(req, res);
    });
};
//GET CURRENT USER
exports.getUser = function(req, res) {
	if(req.session.user){
		wrapJson(req, res , {});
	}else{
		wrapJson(req, res , {});
	}
};

exports.logout = function(req, res){
	req.session.loggedIn = false;
	req.session.user = null;
	wrapJson(req, res , {});
}
/************** test ***************/
exports.userTest = function(req, res){
	var user;
	for(var i=1;i<100;i++){
		user = new User({username:'user'+i, password:'password@'+i});
		user.save();
	}
	wrapJson(req, res , "creating users succeeded, try '/test/users' to view all the users");
}
exports.listUsers = function(req, res) {
	User.find(function(err, users){
		wrapJson(req, res , users);
	});
};
exports.groupsTest = function(req, res){
	var groups =["friends","work"], group = null;
	for(var i=0;i<groups.length;i++){
		group = new Group({title:groups[i], about:'',owner:req.session.user._id});
		group.save();
	}
	wrapJson(req, res , {"success":true});
}
exports.testLogin = function(req, res) {
	User.getAuthenticated(req.params.username, req.params.password, function(err, user, reason) {
        if (err) throw err;
        // login was successful if we have a user
        if (user) {
            // handle login success
            req.session.loggedIn = true;
			req.session.user = user;
            wrapJson(req, res , {});
			return;
        }else{
			req.sesson.loggedIn = false;
			req.session.user = null;
			wrapJson(req, null, resp, {});
		}
    });
};

