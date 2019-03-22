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
        socket.emit('historique',clientList[socket.id].messages);
    }

    let botSession = clientList[socket.id];
    console.log('*** New connection: ' + socket.client.id);

    // when receiving a user message, we wrap it in a "request", send it via the API and send back the response to the interface
    socket.on('message', function (message) {
        let request = botSession.createRequest(message);
        clientList[socket.id].messages.push({"isMe" : true, "message" : message});
        botSession.sendRequest(request).then((result) => {
            let quick_reponses = botSession.getQuickResponses(result); // api call example
            let payload = {
                nickname: 'Chatbot',
                message: result.fulfillmentText,
                intention: (result.intent != null ? result.intent.displayName : "no intent"),
                score: result.intentDetectionConfidence,
                quick_reponses: quick_reponses
            };
            clientList[socket.id].messages.push({"isMe" : false, "message" : payload.message});
            console.log(clientList[socket.id].messages);
            socket.emit('message', payload);
        }).catch(function (error) {
            console.error(error);
        });
    });

    // when the connection is closed
    socket.on('disconnect', function () {
        console.log("deleting instance");
        delete clientList[socket.id];
    });
});

server.listen(PORT, function () {
    console.log('*** Listening on port '+PORT)
});
