
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.get('/', function(req, res, next){
	res.redirect('page/main');
});

app.get('/page/main', function(req, res, next){
	console.log('main/index.html');
	var fs = require('fs');
	console.log(__dirname);
	fs.readdir(__dirname+'/public/page/main', function(err, files) {
		console.log(files);
		
	});
	next();
});