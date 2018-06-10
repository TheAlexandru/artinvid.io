var express = require('express');
const serve   = require('express-static');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');
// var ytAPI = require('./js/ytapi.js');

// app.use(express.static(__dirname +'./public'));
app.use(serve(__dirname + '/public'));

// app.use(express.static('public'));

app.get('/', function (req, res) {
  res.end(fs.readFileSync('../public/index.html'));
})

io.on('connection',(client)=>{
	client.on('load_subs',()=>{
		// ytAPI.handleClientLoad();
		// console.log('hei');
	})
})

server.listen(3000);