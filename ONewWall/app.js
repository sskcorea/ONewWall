/**
 * Module dependencies.
 */

var express = require('express'), http = require('http'), path = require('path'), async = require('async');
var fs = require('fs');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
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

// artists page
app
		.get(
				'/artists',
				function(req, res, next) {
					var files;
					var html = '';
					var root = path.join(__dirname, '/public/page/',
							req.route.path);
					var data_preview = undefined;

					files = fs.readdirSync(root);

					for (i in files) {
						console.log(files[i]);
						if (fs.statSync(path.join(root, files[i]))
								.isDirectory()) {
							data_preview = undefined;
							artists_files = fs.readdirSync(path.join(root,
									files[i]));
							for (j in artists_files) {
								console.log(artists_files[j]);
								if (path.extname(artists_files[j]) === '.jpg') {
									data_preview = artists_files[j];
									break;
								}
							}
							if (data_preview) {
								html += '<li><a href="/page/artists/'
										+ files[i]
										+ '" data-preview="/page/artists/'
										+ files[i] + '/' + data_preview + '">'
										+ files[i] + '</a></li>';
							} else {
								html += '<li><a href="/page/artists/'
										+ files[i] + '">' + files[i]
										+ '</a></li>';
							}
						}
					}
					res.send(html);
				});

// main page
app
		.get(
				'/main',
				function(req, res, next) {
					var root = path.join(__dirname, '/public/page/main');
					var dirname;
					var files;
					var html = '';
					files = fs.readdirSync(root);
					for (i in files) {
						if (fs.statSync(path.join(root, files[i]))
								.isDirectory()) {
							var src = '';
							var h1 = '', h2 = '', h3 = '';
							var exhibition_files;

							dirname = files[i];
							exhibition_files = fs.readdirSync(path.join(root,
									dirname));

							for (j in exhibition_files) {
								if (path.extname(exhibition_files[j]) === ".txt") {
									var line = fs.readFileSync(
											path.join(root, dirname,
													exhibition_files[j]))
											.toString().split("\n");
									for (j in line) {
										console.log(j + line[j]);
										if (j == 0) {
											h1 = "<h1>" + line[j] + "</h1>";
										} else if (j == 1) {
											h2 = "<h2>" + line[j] + "</h2>";
										} else {
											h3 += "<h3>" + line[j] + "</h3>";
										}
									}

								} else if (path.extname(exhibition_files[j]) === '.jpg') {
									src = path.join('/page/main/', dirname,
											exhibition_files[j]);
								}
							}
							// active tab
							if (i == 0) {
								html += '<section class="slide featured ff active-slide">';
							} else {
								html += '<section class="slide featured ff" style="opacity: 0; display: none;">';
							}
							html += ' <img class="ff" src='
									+ src
									+ ' style="max-width:700px; max-height: 600px"/><div class="text ff "><header><hgroup>'
									+ h1 + h2 + ' </hgroup></header>' + h3
									+ ' </div> </section>';
							console.log('html: ' + html);
						}
					}
					res.send(html);
				});