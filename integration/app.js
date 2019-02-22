var http = require('http');
var sock = require('socket.io');
var BotSession = require('./bot_session.js');

var app = require('express')();
var server = http.createServer(app);
var io = sock.listen(server);

const PORT = process.env.PORT || 5000;
let clientList = new Object();

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
    if(clientList[socket.id] == undefined) {  // first connection
        clientList[socket.id] = new BotSession();
    } else { // connection already exists
        // TODO: send back conversation
    }
    
    let botSession = clientList[socket.id];
    console.log('*** New connection: ' + socket.client.id);
    
    // when receiving a user message, we wrap it in a "request", send it via the API and send back the response to the interface 
    socket.on('message', function (message) {
        let request = botSession.createRequest(message);
        botSession.sendRequest(request).then((result) => {
            let quick_reponses = botSession.getQuickResponses(result); // api call example
            let payload = {
                nickname: 'Chatbot', 
                message: result.fulfillmentText, 
                intention: (result.intent != null ? result.intent.displayName : "no intent"), 
                score: result.intentDetectionConfidence, 
                quick_reponses: quick_reponses
            };
            socket.emit('message', payload);
        }).catch(function (error) {
            console.error(error);
        });
    });
});

io.sockets.on("disconnection", function(socket) {
    clientList[socket.id] = undefined;
});

server.listen(PORT, function () {
    console.log('*** Listening on port '+PORT)
});
