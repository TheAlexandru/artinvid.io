var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req,res){
	res.writeHead(200, {'Content-Type':'text/html'});
	res.end(fs.readFileSync('../index.html'));
});

server.listen(3000);