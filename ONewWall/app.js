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

// artists page
app.get('/artists',	function(req, res, next) {
	var root = path.join(__dirname, '/public/data/artists');
	var files = fs.readdirSync(root);
	var artists=[];
	var html='';
	
	for (i in files) {
		if (fs.statSync(path.join(root, files[i])).isDirectory()) {
			artists.push({
				name: files[i],
			});
		}
	}
	for(ii in artists){
		if(ii == 0){
			html += '<div class="span3"><ul class="nav nav-pills nav-stacked">';
			html += '<li class="first-child"><a href="/artist/' + artists[ii].name + '">' + artists[ii].name + '</a>';
		} else if(ii % 9 == 0){
			html += '</div><div class="span3"><ul class="nav nav-pills nav-stacked">';
			html += '<li class="first-child"><a href="/artist/' + artists[ii].name + '">' + artists[ii].name + '</a>';
		}else{
			html += '<li><a href="/artist/' + artists[ii].name + '">' + artists[ii].name + '</a>';
		}
	}
	html += '</div>';
	console.log(html);
	res.render('artists', {
		'artists': artists,
		'html_string':html
	});
});

//artist page
app.get('/artist/:id',	function(req, res, next) {
	var root = path.join(__dirname, '/public/data/artists/', req.params.id);
	var files = fs.readdirSync(root);
	var image='';
	var desc=[];
	
	for(i in files){
		if (files[i] === "DESC.txt") {
			var line = fs.readFileSync(path.join(root, files[i])).toString().split("\n");
			
			for (j in line) {
				desc.push({'text': line[j]});
			}
		}else if (path.extname(files[i]) === '.jpg') {
			image = path.join('/data/main/', files[i]);
		}
	}
	res.render('artist', {
		'name': req.params.id,
		'birthday': '1979',
		'image': image,
		'desc':desc
	});
});

// artworks
app.get('/artworks/:id',	function(req, res, next) {
	var root = path.join(__dirname, '/public/data/artists/', req.params.id, 'artworks');
	var files;
	var image_path='';
	var lines;
	var artworks=[];
	var cnt=0;
	
	if(fs.existsSync(root)){
		 files = fs.readdirSync(root);
		 for(i in files){
			if (path.extname(files[i]) === ".jpg" || path.extname(files[i]) === ".JPG" ) {
				image_path = '/data/artists/' + req.params.id + '/artworks/'+ files[i];
				desc_path = path.join(root, files[i].replace("jpg","txt"));
				
				var descs=[];
				if(fs.existsSync(desc_path)){
					lines = fs.readFileSync(desc_path).toString().split("\n");
					for(j in lines){
						descs.push({'text': lines[j]});
					}
				}
				
				artworks.push({
					image: image_path,
					name:files[i].replace(".jpg",""),
					descs:descs
				});
			}
		}
	}
	
	res.render('artworks',{
		'artist': {
			name: req.params.id
		},
		'artworks': artworks
	});
});
