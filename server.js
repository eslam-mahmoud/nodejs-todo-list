//read the config
var config = require('./config.json');
//Getting express
var express = require('express');
// getting-started.js
var mongoose = require('mongoose');
//This will allow us to grab information from the POST.
var bodyParser = require('body-parser');
//Session.
var cookieParser = require('cookie-parser');
var session = require('express-session');
var connectMongo = require('connect-mongo')(session);
//path helper
var path = require('path');
//create the app
var app = express();
//connection port
var port = process.env.PORT || config.port;

/*------------------------------------------------------------------------------*/

//set the view engine
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html')
app.use(express.static(path.join(__dirname, 'public')));
//session
app.use(cookieParser());
app.use(session({
	secret: config.secret, 
	saveUninitialized: true, 
	resave: true,
	store: new connectMongo({
		url:config.mongoUrl,
		stringify: true
	}),
}));
//listen to the calls
app.listen(port, function(){
	console.log('App started and listen on port ' + port);
});
//handle the post request
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

/*------------------------------------------------------------------------------*/

//MONGO RELATED//
// With Mongoose, everything is derived from a Schema.
var userSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});
//compiling our schema into a Model.
var User = mongoose.model('User', userSchema);

var itemSchema = mongoose.Schema({
	done: {type: Boolean, required: true, default: false},
	title: { type: String, required: true },
	userId: { type: String, required: true },
});
//compiling our schema into a Model.
var Item = mongoose.model('Item', itemSchema);

//connect to mongo db
mongoose.connect(config.mongoUrl);
//We have a pending connection to the test database running on localhost.
//We now need to get notified if we connect successfully or if a connection error occurs:
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log('we are connected to Mongo');
	//all code can be within this callback.
});

/*------------------------------------------------------------------------------*/

//handle the routes
//index page
app.get('/', function(req, res, next){
	if (req.session.user) {
		res.render('todo', {title: 'Todo list'});
	} else {		
		res.render('login', {title: 'Todo list'});
	}
});

//register page
app.get('/register', function(req, res, next){
	res.render('register', {title: 'Todo list'});
});

app.post('/api/user/create', function(req, res, next){
	//create new user
	var user1 = new User({
		username: req.body.username,
		password: req.body.password
	});
	// Each document can be saved to the database by calling its save method.
	//The first argument to the callback will be an error if any occured.
	user1.save(function(error, user1){
		if (error) {
			console.error(error);
			res.send(false);
		}
		res.status(200).json({msg: 'OK', user: user1});
	});	
});

app.post('/api/user/login', function(req, res, next){
	User.find(
		{
			password: req.body.password, 
			username: req.body.username
		}, 
		function (error, users) {
			if (error) {
				console.error(error);
				res.send(false);
			}
			req.session.user = users[0];
			res.status(200).json({msg: 'OK'});
		}
	);
});

app.post('/api/todo/create', function(req, res, next){
	//create new item
	var item1 = new Item({
		userId: req.session.user._id,
		title: req.body.title,
		done: false
	});

	// Each document can be saved to the database by calling its save method.
	//The first argument to the callback will be an error if any occured.
	item1.save(function(error, item1){
		if (error) {
			console.error(error);
			res.send(false);
		}
		res.status(200).json({msg: 'OK', item: item1});
	});	
});

app.post('/api/todo/update', function(req, res, next){
	Item.findOneAndUpdate(
		{_id: req.body.id, userId: req.session.user._id},//conditions
		{title:req.body.title, done: req.body.done},//update
		{new: true, upsert: true}, //options
		function (error, item) { //callback
			if (error) {
				console.error(error);
				res.send(false);
			}
			res.status(200).json({msg: 'OK', item: item});
		}
	);
});

app.post('/api/todo/delete', function(req, res, next){
	Item.findOneAndRemove(
		{_id: req.body.id, userId: req.session.user._id},//conditions
		function (error, item) { //callback
			if (error) {
				console.error(error);
				res.send(false);
			}
			res.status(200).json({msg: 'OK'});
		}
	);
});

app.get('/api/todo/get', function(req, res, next){
	//Find all saved items
	Item.find({
		userId: req.session.user._id
		},
		function (error, items) {
			if (error) {
				console.error(error);
				res.send(false);
			}
			res.status(200).json(items);
		}
	);
});
