var http = require('http');
var sock = require('socket.io');
var ApiInterface = require('./backend.js');

var app = require('express')();
var server = http.createServer(app);
var io = sock.listen(server);


const port = 3000;

var client_arr = new Object();

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  if(client_arr[socket.id] == undefined ){
    client_arr[socket.id] = new ApiInterface();
  }else{
    //TODO: Redonner historique
  }
    console.log('new user connected: ' + socket.client.id);
    socket.on('message', function (message) {
        request = api.createRequest(message);
        client_arr[socket.id].sendRequest(request).then((result) => {
            let quick_reponses = client_arr[socket.id].getQuickResponses(result); // api call example
            socket.emit('message', {nickname: 'Chatbot', message: result.fulfillmentText, intention: result.intent.displayName, score: result.intentDetectionConfidence, quick_reponses: quick_reponses});
        });
    });
});

server.listen(port, function () {
    console.log('listening on port 3000')
});
