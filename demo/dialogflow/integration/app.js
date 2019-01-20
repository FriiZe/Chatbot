const express = require('express');
const http = require('http');
const sock = require('socket.io');
const ent = require('ent'); 
const fs = require('fs');
const ApiInterface = require('./backend.js');

const app = express();
const server = http.createServer();
const io = sock.listen(server);
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
            socket.emit('message', {nickname: 'Chatbot', message: result.fulfillmentText, intention: result.intent.displayName, score: result.intentDectectionConfidence});
        });
    });
});

server.listen(port, function () {
  console.log('Example app listening on port 3000!')
});