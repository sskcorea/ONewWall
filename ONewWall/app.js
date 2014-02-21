/**
 * Module dependencies.
 */

var express = require('express'), http = require('http'), path = require('path'), async = require('async');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
//This tells express to route ALL requests through this middleware
//This middleware ends up being a "catch all" error handler
app.use(function (err, req, res, next) {
	if (err.msg) {
		res.send(500, { error: err.msg });
	} else {
		res.send(500, { error: '500 - Internal Server Error' });
	}
});

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

// first page
app.get('/', function(req, res, next) {
	res.redirect('page/main');
});


// main page
app.get('/page/main/exhibitions', function(req, res, next) {
	var fs = require('fs');
	var readline = require('readline');
	
	var root = path.join(__dirname, '/public/page/main');
	var dirname;

//	var h1;
//	var h2 = "<h2>Park Juhyun</h2>";
//	var h3 = "<h3>2013.12.20(Fri.) - 2014.02.02 (Sun.) 설날 연휴 휴무</h3>" + 
//	 "<h3>Opening 2013. 12.20 (Fri) 05:00pm</h3>";
//	var html;

	fs.readdir(root, function(err, files) {
		if (err) next(err);

		files.forEach(function(f){
			fs.stat(path.join(root, f), function(err, stats){
				if (err) next(err);

				if(stats.isDirectory()){
					dirname = f;
					fs.readdir(path.join(root ,dirname), function(err, files){
						if (err) next(err);
						
						var h1, h2, h3='';
						var html;
						files.forEach(function(f){
							if(path.extname(f) === ".txt") {
								var line = fs.readFileSync(path.join(root, dirname, f)).toString().split("\n");
								for(i in line) {
								    console.log(i + line[i]);
								    if(i == 0){
								    	h1 = "<h1>" + line[i] + "</h1>";
								    }else if(i == 1){
								    	h2 = "<h2>" + line[i] + "</h2>";
								    }else{
								    	h3 += "<h3>" + line[i] +"</h3>";
								    }
								}

							}else if(path.extname(f) === '.jpg'){
								src = path.join('/page/main/',dirname, f);
								console.log('src: ' + src);
							}
						});
						
						html = '<section class="slide featured ff">' + 
						' <img class="ff" src=' + src + ' style="max-width:700px; max-height: 600px"/><div class="text ff "><header><hgroup>' + 
						h1 + h2 + ' </hgroup></header>' + 
						h3 + ' </div> </section>';
						
						console.log(html);
						res.send(html);
					});
				}
			});
		});
	});
});