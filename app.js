
/**
 * Module dependencies.
 */

var express = require('express');
var mongoose = require('mongoose');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
MemoryStore = require('connect').session.MemoryStore;
var app = express();

// connect to Mongo when the app initializes
mongoose.connect('mongodb://localhost:27017');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('Kl9UvVOIjn7hWSS1zC11343YWOQ0FX61'));
app.use(express.session({secret:"Kl9UvVOIjn7hWSS1zC11343YWOQ0FX61", store:new MemoryStore()}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'web')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

// set up the RESTful API, handler methods are defined in api.js
var api = require('./app/controllers/api.js');

//validate logged in user
function isLoggedIn(req, res, next) {
	if(req.session.loggedIn && req.session.user)
		next();
	else
		res.send({
		  "user": "GUEST",
		  "data": {}
		});
}

/** POSTS API**/
app.post('/api/post', isLoggedIn, api.post.add);
app.get('/api/posts', isLoggedIn, api.post.findAll);
app.get('/api/post/:id', isLoggedIn, api.post.findById);
app.post('/api/post/like', isLoggedIn, api.post.like);
app.post('/api/post/dislike', isLoggedIn, api.post.dislike);
app.post('/api/post/flag', isLoggedIn, api.post.flag);
app.post('/api/post/rate', isLoggedIn, api.post.rate);

app.get('/api/post/:id/like', isLoggedIn, api.post.like);
app.get('/api/post/:id/dislike', isLoggedIn, api.post.dislike);
app.get('/api/post/:id/flag', isLoggedIn, api.post.flag);
app.get('/api/post/:id/unflag', isLoggedIn, api.post.unflag);
app.get('/api/post/:id/rate', isLoggedIn, api.post.rate);


/** COMMENTS API **/
app.post('/api/comment', isLoggedIn, api.comment.add);
app.get('/api/comments/:postid', isLoggedIn, api.comment.findByPostId);
app.get('/api/comment/:id', isLoggedIn, api.comment.findById);
app.post('/api/comment/like', isLoggedIn, api.comment.like);
app.post('/api/comment/dislike', isLoggedIn, api.comment.dislike);
app.post('/api/comment/flag', isLoggedIn, api.comment.flag);
app.post('/api/comment/rate',isLoggedIn, api.comment.rate);

/******** GROUP API ***/
app.post('/api/group', isLoggedIn, api.group.add);
app.get('/api/group/:name/:title/:description', isLoggedIn, api.group.add);
app.post('/api/group/edit/:id', isLoggedIn, api.group.update);
app.get('/api/group/:id', isLoggedIn, api.group.findById);
app.post('/api/group/like', isLoggedIn, api.group.like);
app.post('/api/group/dislike', isLoggedIn, api.group.dislike);
app.post('/api/group/flag', isLoggedIn, api.group.flag);
app.post('/api/group/rate', isLoggedIn, api.group.rate);
app.post('/api/group/members', isLoggedIn, api.group.addMembers);
app.get('/api/group/:id/members',isLoggedIn, api.group.getMembers);
app.get('/api/groups', isLoggedIn, api.group.findAll);

/** USER API **/

app.post('/api/user/create', api.user);
app.post('/api/user/login', api.login);
app.get('/api/user', api.getUser);
app.get('/api/logout', api.logout);

/*******TEST ***********/
app.get('/test/users/create' , api.userTest);
app.get('/test/users', api.listUsers);
app.get('/test/username/:username/password/:password', api.testLogin);
app.get('/test/groups', isLoggedIn, api.groupsTest);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
