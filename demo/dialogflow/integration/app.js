var http = require('http');
var sock = require('socket.io');
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
            let quick_reponses = api.getQuickResponses(result); // api call example
            socket.emit('message', {nickname: 'Chatbot', message: result.fulfillmentText, intention: result.intent.displayName, score: result.intentDetectionConfidence, quick_reponses: quick_reponses});
        });
    });
});

server.listen(port, function () {
    console.log('listening on port 3000')
});
