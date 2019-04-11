var http = require('http');
var sock = require('socket.io');
var BotSession = require('./bot_session.js');

var app = require('express')();
var server = http.createServer(app);
var io = sock.listen(server);

const PORT = process.env.PORT || 5000;
let clientList = new Object();

/*
* Send html page to client
*/
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/style.css', function (req, res) {
    res.sendFile(__dirname + '/style.css');
});

/*Initialise user event on user connexion */
io.sockets.on('connection', function(socket) {
    if(clientList[socket.id] == undefined) {  // first connection
        clientList[socket.id] = new BotSession();
    } else { // connection already exists
        socket.emit('historique', clientList[socket.id].messages);
    }

    let botSession = clientList[socket.id];
    console.log('*** New connection: ' + socket.client.id);

    // when receiving a user message, we wrap it in a "request", send it via the API and send back the response to the interface
    socket.on('message', function (message) {
        let request = botSession.createRequest(message); //Create user request 
        clientList[socket.id].messages.push({"isMe" : true, "message" : message}); //add user message to history conversation
        botSession.sendRequest(request).then((result) => { //send request to DialogFlow
            let quick_reponses = botSession.getQuickResponses(result); // api call example
            let payload = {
                nickname: 'Chatbot',
                message: result.fulfillmentText,
                intention: (result.intent != null ? result.intent.displayName : "no intent"),
                score: result.intentDetectionConfidence,
                quick_reponses: quick_reponses
            }; //retrieve data  
            clientList[socket.id].messages.push({"isMe" : false, "message" : payload.message}); //add bot message to history conversation
            console.log(clientList[socket.id].messages);
            socket.emit('message', payload); //send response to user
        }).catch(function (error) {
            console.error(error);
        });
    });

    // when the connection is closed
    socket.on('disconnect', function () {
        console.log("deleting instance");
        delete clientList[socket.id]; //delete user to user list
    });
});

/*Lauch server */
server.listen(PORT, function () {
    console.log('*** Listening on port '+PORT)
});
