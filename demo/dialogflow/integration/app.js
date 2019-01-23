
var http = require('http');
var sock = require('socket.io');
var ent = require('ent');
var fs = require('fs');
var ApiInterface = require('./backend.js');

var app = require('express')();
var server = http.createServer(app);
var io = sock.listen(server);
const api = new ApiInterface();

const port = 3000;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
    console.log('new user connected: ' + socket.client.id);
    socket.on('message', function (message) {
        request = api.createRequest(message);
        api.sendRequest(request).then((result) => {
            socket.emit('message', {nickname: 'Chatbot', message: result.fulfillmentText, intention: result.intent.displayName, score: result.intentDetectionConfidence});
        });
    });
});

server.listen(port, function () {
  console.log('Example app listening on port 3000!')
});
