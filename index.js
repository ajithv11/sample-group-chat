var express 	 	= 	require('express');
var cookieParser 	= 	require('cookie-parser');
var bodyParser 	 	= 	require('body-parser');
var fs 				=   require('fs');
var path 			= 	require('path');
var favicon 		= 	require('serve-favicon');
var logger 		 	= 	require('morgan');



var app 		 = express();
var server 		 = require('http').createServer(app);
var io  		 = require('socket.io').listen(server);
var port 	 	 = 3611;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




var connection   = require('express-myconnection'); 
var mysql 		 = require('mysql');


var options = {
					host: 'localhost',
					port: 3306,
					user: 'root',
					password: '',
					dateStrings:true,
					database: 'wp_groupchat'
			  };

var con = mysql.createConnection(options);



var config		    =  require('./config/config')(app, io);
var chat 		 	=  require('./socket/chat')(app,io,config,con);
var users 		 	=  require('./socket/users')(app,io,config,con);

app.get('/', function(req, res) {
  res.send('Initialize');
});



var listen = server.listen(port, function(){
	
});
console.log("Listening on port " + port);