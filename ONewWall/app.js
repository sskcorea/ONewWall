/**
 * Module dependencies.
 */

var express = require('express'), http = require('http'), path = require('path');

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
if ('development' === app.get('env')) {
	app.use(express.errorHandler());
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

app.get('/', function(req, res, next) {
	res.redirect('page/main');
});

app.get('/page/main/exhibitions', function(req, res, next) {

	var fs = require('fs');
	
	console.log(__dirname);
	var path = __dirname + '/public/page/main';
	
	fs.readdir(path, function(err, files) {
		for(var i in files){
			var name = path+'/'+files[i];
			if (fs.statSync(name).isDirectory()){
				res.type('html');
				res.send('<section class="slide featured ff">' +
								' <a class="block" href="//127.0.0.1:3000/page/artists/park_juhyun/" title="Darren Almond - To Leave a Light Impression | O\'NewWall" >' + 
								' <img class="ff" src="/images/content/tool-story.jpg" style="max-width:700px; max-height: 600px"/>' + 
								' <div class="text ff ">' + 
								' <header>' + 
								' <hgroup>' + 
								' <h1>TOOL STORY 1-2 SPACE TIME</h1>' + 
								' <h2>Park Juhyun</h2>' + 
								' </hgroup>' + 
								' </header>' + 
								' <h3>2013.12.20(Fri.) - 2014.02.02 (Sun.) 설날 연휴 휴무</h3>' + 
								' <h3>Opening 2013. 12.20 (Fri) 05:00pm</h3>' + 
								' </div>' + ' </a>' + ' </section>');
	        }else{
	        	res.send('<h1> no exhibitions </h1>');
	        }
		}
	});
});