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


//first page
app.get('/', function(req, res, next) {
	var root_path = path.join(__dirname, '/public/data/main');
	var file_path;
	
	var files = fs.readdirSync(root_path);
	var title, artist_name, img_src;
	var memo=[];
	
	for (i in files) {
		file_path = path.join(root_path, files[i]);
		if(files[i] === 'DESC.txt'){
			var line = fs.readFileSync(file_path).toString().split("\n");
			
			for (j in line) {
				if(j==0) {
					title = line[j];
				}
				else if(j==1){
					artist_name = line[j];
				}
				else {
					memo.push({'text': line[j]});
				}
			}
		}else if (path.extname(files[i]) === '.jpg') {
			img_src = '/data/main/' + files[i];
		}
	}
	res.render('home', {
		'artist_name': artist_name, 
		'title': title,
		'memo': memo,
		'img_src': img_src
	});
});

// artist main page
app.get('/page/artists/:id', function(req, res, next) {
	console.log(req.params.id + '\'s page start!');

	var root = path.join(__dirname, '/public/page/artists/');
	var artist_folder = path.join(root, req.params.id, 'exhibitions/main');
	
	var root_files = fs.readdirSync(root);
	var artist_files = fs.readdirSync(artist_folder);
	var artist_lists=[];
	var exhibition_desc=[];
	var artworks=[];
	var title;
	var subtitle;
	var img_count=0;
	
	// artists list
	for (i in root_files){
		
		if (fs.statSync(path.join(root, root_files[i])).isDirectory()) {
			artist_lists.push({
				'name': root_files[i],
				'href': '/page/artists/' + root_files[i]
			});
		}
	}
	
	// description of exhibition
	for (var ii in artist_files) {
		if (artist_files[ii] === 'README.txt') continue;
		
		if (artist_files[ii] === "DESC.txt") {
			var line = fs.readFileSync(path.join(artist_folder, artist_files[ii])).toString().split("\n");
			
			for (j in line) {
				if(j==0) {
					title = line[j];
				}
				else if(j==1){
					subtitle = line[j];
				}
				else {
					exhibition_desc.push({'text': line[j]});
				}
			}
		}else{
			if(path.extname(artist_files[ii]) === ".txt"){
				var line = fs.readFileSync(path.join(artist_folder, artist_files[ii])).toString().split("\n");
				
				artworks.push({
					'src': '/page/artists/' + req.params.id + '/exhibitions/main/' + artist_files[ii].replace("txt","jpg"),
					'data': '/page/artists/' + req.params.id + '/exhibitions/main/' + artist_files[ii].replace("txt","jpg"),
					'title': title,
					'subtitle' : subtitle,
					'name': line[1],
					'year': line[2],
					'materials': line[3],
					'size': line[4]
				});
				img_count++;
			}
		}
	}
	
	console.log(artist_lists);
	console.log(exhibition_desc);
	console.log(artworks);
	console.log(img_count);
	// description of artworks
	res.render('artist', { 
		'artist_name': req.params.id, 
		'artist_lists': artist_lists,
		'title': title,
		'exhibition_desc': exhibition_desc,
		'artworks' : artworks,
		'img_count': img_count
	});
});

// artists page
app.get('/artists',	function(req, res, next) {
	var root = path.join(__dirname, '/public/data/artists');
	var files = fs.readdirSync(root);
	var artists=[];
	
	for (i in files) {
		if (fs.statSync(path.join(root, files[i])).isDirectory()) {
			artists.push({
				name: files[i],
			});
		}
	}
	res.render('artists', {
		'artists': artists
	});
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
						}
					}
					res.send(html);
				});
