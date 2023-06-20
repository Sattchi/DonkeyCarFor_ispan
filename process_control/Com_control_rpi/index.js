var express = require('express');
var io = require('socket.io');
// var spawn = require('child_process').spawn;
var app = express();

app.use(express.static("www"));

var server = app.listen(5438, function () {
    console.log('伺服器在5438埠口開工了。');
});


var sio = io.listen(server);

sio.on('connection', function (socket) {

});