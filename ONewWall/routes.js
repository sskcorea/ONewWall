var path = require('path'),
	fs = require('fs'),
	async = require('async');

exports.root = function(req, res, next) {
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
		'title' : title,
		'memo' : memo,
		'img_src' : img_src
	});
}

exports.artists= function(req, res, next) {
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
}

exports.artist=function(req, res, next) {
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
}

exports.artworks=function(req, res, next) {
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
}

exports.artwork=function(req, res, next) {
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
}

exports.exhibitions_current=function(req, res, next) {
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
}

exports.exhibition=function(req, res, next) {
	console.log('/exhibition/past/:year/:title' + req.params.year + req.params.title);

	var root_path = path.join(__dirname, '/public/data/exhibitions/past/',
			req.params.year, req.params.title);
	var file_path;

	var files;
	var title = 'unknown';
	var image, location;
	var date = new Date().getFullYear();
	console.log('date' + date);
	var desc = [];

	console.log('root_path: ' + root_path);
	console.log('fs.existsSync(root_path): ' + fs.existsSync(root_path));
	if (fs.existsSync(root_path)) {

		files = fs.readdirSync(root_path);
		console.log('files: ' + files);
		for ( var i in files) {
			file_path = path.join(root_path, files[i]);
			console.log('files[' + i + ']' + files[i]);
			if (files[i] === 'DESC.txt') {
				var line = fs.readFileSync(file_path).toString().split("\n");
				console.log('line: ' + line);
				for ( var j in line) {
					if (j == 0) {
						title = line[j].trim();
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
			} else if (path.extname(files[i]) === '.jpg' || path.extname(files[i]) === '.JPG') {
				image = '/data/exhibitions/past/'+req.params.year + '/' + req.params.title + '/' + files[i];
			}
		}
	}
	console.log('image: ' + image);
	res.render('exhibition', {
		'title' : title,
		'image' : image,
		'date' : date,
		'desc' : desc
	});
}

exports.exhibitions_past=function(req, res, next) {
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
						console.log('lines: ' + lines);
						for (var j in lines) {
							if (j == 0) {
								title = lines[j].trim();
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
}

exports.projects=function(req, res, next) {
	console.log('/projects');
	
	var year = '2014';
	var root = path.join(__dirname, '/public/data/projects', year);
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
						console.log('lines: ' + lines);
						for (var j in lines) {
							if (j == 0) {
								title = lines[j].trim();
								console.log('title: ' + title);
							} else if (j == 1) {
								date = lines[j];
							}
						}
					} else if (files[ii] === 'main.jpg') {
						image = '/data/projects/'+ year + '/' + dirs[i] + '/' + files[ii];
						main_flag=true;
					} else if ((path.extname(files[ii]) === '.jpg'|| path.extname(files[ii]) === '.JPG') && main_flag === false) {
						image = '/data/projects/'+ year + '/' + dirs[i] + '/' + files[ii];
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

	res.render('projects',{
		'exhibitions' : exhibitions,
		'year':year
	});
}

exports.project=function(req, res, next) {
	console.log('/project/:year/:title' + req.params.year + req.params.title);

	var year = '2014';
	var root_path = path.join(__dirname, '/public/data/projects/', year, req.params.title);
	var file_path;

	var files;
	var title = 'unknown';
	var image, location;
	var date = new Date().getFullYear();
	console.log('date' + date);
	var desc = [];

	console.log('root_path: ' + root_path);
	console.log('fs.existsSync(root_path): ' + fs.existsSync(root_path));
	if (fs.existsSync(root_path)) {

		files = fs.readdirSync(root_path);
		console.log('files: ' + files);
		for ( var i in files) {
			file_path = path.join(root_path, files[i]);
			console.log('files[' + i + ']' + files[i]);
			if (files[i] === 'DESC.txt') {
				var line = fs.readFileSync(file_path).toString().split("\n");
				console.log('line: ' + line);
				for ( var j in line) {
					if (j == 0) {
						title = line[j].trim();
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
			} else if (path.extname(files[i]) === '.jpg' || path.extname(files[i]) === '.JPG') {
				image = '/data/projects/'+ year + '/' + req.params.title + '/' + files[i];
			}
		}
	}
	console.log('image: ' + image);
	res.render('project', {
		'title' : title,
		'image' : image,
		'date' : date,
		'desc' : desc
	});
}

exports.about=function(req, res, next) {
	res.render('about');
}

exports.contacts=function(req, res, next) {
	res.render('contacts');
}
exports.location=function(req, res, next) {
	res.render('location');
}

exports.members=function(req, res, next) {
	res.render('members');
}

exports.old=function(req, res, next) {
	res.redirect('http://onewwall.wordpress.com');
}