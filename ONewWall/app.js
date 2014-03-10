/**
 * Module dependencies.
 */

var express = require('express'), http = require('http'), path = require('path'), async = require('async');
var fs = require('fs');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/public/views');
app.set('view engine', 'jade');
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

app.get('/old', function(req, res, next) {
	res.redirect('http://onewwall.wordpress.com');
});

// first page
app.get('/', function(req, res, next) {
	var root_path = path.join(__dirname, '/public/data/main');
	var file_path;

	var files = fs.readdirSync(root_path);
	var title, artist_name, img_src;
	var memo = [];

	for ( var i in files) {
		if(files.hasOwnProperty(i)){
			file_path = path.join(root_path, files[i]);
			if (files[i] === 'DESC.txt') {
				var line = fs.readFileSync(file_path).toString().split("\n");

				for (var j in line) {
					if(line.hasOwnProperty(j)){
						if (j == 0) {
							title = line[j];
						} else if (j == 1) {
							artist_name = line[j];
						} else {
							memo.push({
								'text' : line[j]
							});
						}
					}
				}
			} else if (path.extname(files[i]) === '.jpg') {
				img_src = '/data/main/' + files[i];
			}
		}
	}
	res.render('home', {
		'artist_name' : artist_name,
		'title' : title,
		'memo' : memo,
		'img_src' : img_src
	});
});

// artists page
app.get('/artists',	function(req, res, next) {
	var root = path.join(__dirname, '/public/data/artists');
	var files = fs.readdirSync(root);
	var artists = [];
	var html = '';

	for ( var i in files) {
		if (fs.statSync(path.join(root, files[i]))
				.isDirectory()) {
			artists.push({
				name : files[i],
			});
		}
	}
	for ( var ii in artists) {
		if (ii == 0) {
			html += '<div class="span3"><ul class="nav nav-pills nav-stacked">';
			html += '<li class="first-child"><a href="/artist/'
					+ artists[ii].name + '">'
					+ artists[ii].name + '</a>';
		} else if (ii % 9 == 0) {
			html += '</div><div class="span3"><ul class="nav nav-pills nav-stacked">';
			html += '<li class="first-child"><a href="/artist/'
					+ artists[ii].name + '">'
					+ artists[ii].name + '</a>';
		} else {
			html += '<li><a href="/artist/' + artists[ii].name
					+ '">' + artists[ii].name + '</a>';
		}
	}
	html += '</div>';
	console.log(html);
	res.render('artists', {
		'artists' : artists,
		'html_string' : html
	});
});

// artist page
app.get('/artist/:id', function(req, res, next) {
	var root = path.join(__dirname, '/public/data/artists/', req.params.id);
	var files = fs.readdirSync(root);
	var image = '';
	var desc = [];

	for ( var i in files) {
		if (files[i] === "DESC.txt") {
			var line = fs.readFileSync(path.join(root, files[i])).toString()
					.split("\n");

			for ( var j in line) {
				desc.push({
					'text' : line[j]
				});
			}
		} else if (path.extname(files[i]) === '.jpg') {
			image = path.join('/data/artists/', req.params.id, files[i]);
		}
	}
	res.render('artist', {
		'name' : req.params.id,
		// 'birthday': '1979',
		'image' : image,
		'desc' : desc
	});
});

// artworks
app.get('/artworks/:id', function(req, res, next) {
	var root = path.join(__dirname, '/public/data/artists/', req.params.id,
			'artworks');
	var files;
	var image_path = '';
	var artworks = [];

	if (fs.existsSync(root)) {
		files = fs.readdirSync(root);
		for ( var i in files) {
			if (path.extname(files[i]) === ".jpg") {
				image_path = '/data/artists/' + req.params.id + '/artworks/'
						+ files[i];
				artworks.push({
					image : image_path,
					name : files[i],
					title : files[i].replace(".jpg", "")
				});
			}
		}
	}

	res.render('artworks', {
		'artist' : {
			name : req.params.id
		},
		'artworks' : artworks
	});
});

// artworks
app.get('/artworks/:artist/:artwork', function(req, res, next) {
	var filename = path.join(__dirname, '/public/data/artists/',
			req.params.artist, 'artworks', req.params.artwork).replace('.jpg',
			'.txt');
	var dirname = path.join(__dirname, '/public/data/artists/',
			req.params.artist, 'artworks');
	var lines;
	var files;
	var desc = [];
	var artworks = [];
	var current = -1;
	var prev = -1;
	var nxt = -1;

	if (fs.existsSync(filename)) {
		lines = fs.readFileSync(filename).toString().split("\n");
		for ( var i in lines) {
			desc.push({
				text : lines[i]
			});
		}
	}

	if (fs.existsSync(dirname)) {
		files = fs.readdirSync(dirname);

		// folder files
		for ( var ii in files) {
			if (path.extname(files[ii]) === '.jpg') {
				artworks.push({
					name : files[ii]
				});
			}
		}

		// image files
		for ( var iii in artworks) {
			if (artworks[iii].name === req.params.artwork) {
				if (iii > 0) {
					prev = Number(iii - 1);
				}

				if (artworks.length > Number(iii) + 1) {
					nxt = Number(iii) + 1;
				}
			}

		}
	}

	res.render('artwork', {
		artist : {
			name : req.params.artist
		},
		artwork : {
			'name' : req.params.artwork,
			'artworks' : artworks,
			'current' : current,
			'prev' : prev,
			'next' : nxt
		},
		desc : desc
	});
});

// exhibitions
app.get('/exhibitions/current', function(req, res, next) {
	var root_path = path.join(__dirname, '/public/data/exhibitions/current');
	var file_path;

	var files;
	var title, image, location, date;
	var desc = [];

	if (fs.existsSync(root_path)) {

		files = fs.readdirSync(root_path);

		for ( var i in files) {
			file_path = path.join(root_path, files[i]);
			console.log(files[i]);
			if (files[i] === 'DESC.txt') {
				var line = fs.readFileSync(file_path).toString().split("\n");
				for ( var j in line) {
					if (j == 0) {
						title = line[j];
					} else if (j == 1) {
						date = line[j];
					}
				}
			} else if (files[i] === 'TEXT.txt') {
				var text = fs.readFileSync(file_path).toString().split("\n");

				for ( var k in text) {
					desc.push({
						'text' : text[k]
					});
				}
				console.log(desc);
			} else if (path.extname(files[i]) === '.jpg') {
				image = '/data/exhibitions/current/' + files[i];
			}
		}
	}
	res.render('exhibitions_current', {
		'title' : title,
		'image' : image,
		'date' : date,
		'desc' : desc
	});
});

// exhibition
app.get('/exhibition/past/:year/:title', function(req, res, next) {
	console.log('/exhibition/past/:year/:title' + req.query.yr);
	
	var root_path = path.join(__dirname, '/public/data/exhibitions/past/',
			req.params.year, req.params.title);
	var file_path;

	var files;
	var title = 'unknown';
	var image, location;
	var date = new Date().getFullYear();
	var desc = [];

	if (fs.existsSync(root_path)) {

		files = fs.readdirSync(root_path);

		for ( var i in files) {
			file_path = path.join(root_path, files[i]);
			
			if (files[i] === 'DESC.txt') {
				var line = fs.readFileSync(file_path).toString().split("\n");
				for ( var j in line) {
					if (j == 0) {
						title = line[j];
					} else if (j == 1) {
						date = line[j];
					}
				}
			} else if (files[i] === 'TEXT.txt') {
				var text = fs.readFileSync(file_path).toString().split("\n");

				for (var k in text) {
					desc.push({
						'text' : text[k]
					});
				}
				console.log(desc);
			} else if (path.extname(files[i]) === '.jpg') {
				image = '/data/exhibitions/past/'+req.params.year + '/' + req.params.title + '/' + files[i];
			}
		}
	}
	res.render('exhibition', {
		'title' : title,
		'image' : image,
		'date' : date,
		'desc' : desc
	});
});

// exhibitions
app.get('/exhibitions/past/:year', function(req, res, next) {
	console.log('/exhibitions/past/:year');
	
	var year = req.params.year;
	var root = path.join(__dirname, '/public/data/exhibitions/past', year);
	var title = 'unknown';
	var date = new Date().getFullYear();
	var image;
	var lines;
	var dirs;
	var files;
	var exhibitions = [];
	var main_flag=false;
	console.log('root :' + root);
	
	if (fs.existsSync(root)) {
		dirs = fs.readdirSync(root);
		for (var i in dirs) {
			if(dirs.hasOwnProperty(i)){
				console.log('dirs: ' +'[' +i +']' + dirs);
				files = fs.readdirSync(path.join(root, dirs[i]));

				for (var ii in files) {
					console.log('files: ' + files[ii]);
					if (files[ii] === 'DESC.txt') {
						lines = fs.readFileSync(path.join(root, dirs[i], files[ii])).toString().split("\n");
						console.log(lines);
						for (var j in lines) {
							if (j == 0) {
								title = lines[j];
								console.log('title: ' + title);
							} else if (j == 1) {
								date = lines[j];
							}
						}
					} else if (files[ii] === 'main.jpg') {
						image = '/data/exhibitions/past/'+ year + '/' + dirs[i] + '/' + files[ii];
						main_flag=true;
					} else if (path.extname(files[ii]) === '.jpg' && main_flag === false) {
						image = '/data/exhibitions/past/'+ year + '/' + dirs[i] + '/' + files[ii];
					}
				}
				console.log('files.length ' + files.length );
				if(files.length > 0){
					exhibitions.push({
						'title':title,
						'date':date,
						'year':year,
						'image':image
					});					
				}
			}
		}
	}
//	console.log('exhibitions :' + exhibitions);

	res.render('exhibitions_past',{
		'exhibitions' : exhibitions,
		'year':year
	});
});

//exhibitions
app.get('/exhibitions/upcoming', function(req, res, next) {

	res.render('exhibitions_upcoming');
});

// select form
app.get('/exhibitions/year', function(req, res, next) {
	console.log('/exhibitions/year/');
	res.redirect('/exhibitions/past/' + req.query.yr);
});

//exhibitions
app.get('/projects', function(req, res, next) {

	res.send("<h1>under construction!</h1>");
});

//exhibitions
app.get('/publications', function(req, res, next) {

	res.send("<h1>under construction!</h1>");
});

//exhibition
app.get('/exhibition/:name', function(req, res, next) {

	res.render('exhibition');
});

// about
app.get('/about', function(req, res, next) {
	res.render('about');
});

// contacts
app.get('/contacts', function(req, res, next) {
	res.render('contacts');
});

// direction
app.get('/location', function(req, res, next) {
	res.render('location');
});

// members
app.get('/members', function(req, res, next) {
	res.render('members');
});