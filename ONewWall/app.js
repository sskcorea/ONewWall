/**
 * Module dependencies.
 */

var express = require('express'), 
	http = require('http'), 
	path = require('path'), 
	routes = require('./routes'),
	async = require('async'),
	fs = require('fs'),
	app = express();

// all environments
//app.set('port', process.env.PORT || 3000);
app.set('port', 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// This tells express to route ALL requests through this middleware
// This middleware ends up being a "catch all" error handler
app.use(function(err, req, res, next) {
	if (err.msg) {
		res.send(500, {
			error : err.msg
		});
	} else {
		res.send(500, {
			error : '500 - Internal Server Error'
		});
	}
});

// development only
if ('development' === app.get('env')) {
	app.use(express.errorHandler());
	app.locals.pretty = true;
}

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});

// for CORS (cross-orgin resource sharing)
app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

app.get('/old', routes.old);
app.get('/', routes.root);

app.get('/artists',	routes.artists);
app.get('/artist/:id', routes.artist);
app.get('/artworks/:id', routes.artworks);
app.get('/artworks/:artist/:artwork', routes.artwork);

app.get('/exhibitions/current', routes.exhibitions_current);
app.get('/exhibitions/past/:year', routes.exhibitions_past);
app.get('/exhibition/past/:year/:title', routes.exhibition);

app.get('/projects', routes.projects);
app.get('/project/:year/:title', routes.project);

app.get('/publications', routes.publications);

app.get('/about', routes.about);
app.get('/contacts', routes.contacts);
app.get('/location', routes.location);
app.get('/members', routes.members);

// select form
app.get('/exhibitions/year', function(req, res, next) {
	console.log('/exhibitions/year/');
	res.redirect('/exhibitions/past/' + req.query.yr);
});