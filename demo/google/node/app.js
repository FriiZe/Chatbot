var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs');

// Imports the Google Cloud client library
const language = require('@google-cloud/language');

// Creates a client
const client = new language.LanguageServiceClient();

// Chargement de la page index.html
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket, nickname) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('new_client', function(nickname) {
        nickname = ent.encode(nickname);
        socket.nickname = nickname;
        socket.broadcast.emit('new_client', nickname);
    });

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('message', function (message) {
        syntax_text(message);
        socket.emit('message', {nickname: 'chatbot', message: 'J\'ai bien reçus ton message'});
        //socket.broadcast.emit('message', {nickname: socket.nickname, message: message});
    });
});

server.listen(8080);

function syntax_text(text){
    // Prepares a document, representing the provided text
    const document = {
        content: text,
        type: 'PLAIN_TEXT',
    };

    console.log("Message: "+text);

    // Detects syntax in the document
    client.analyzeSyntax({document: document}).then(results => {
        const syntax = results[0];
        console.log('Tokens:');
        syntax.tokens.forEach(part => {
            console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
            console.log(`Morphology:`, part.partOfSpeech);
        });
    }).catch(err => {
        console.error('ERROR:', err);
    });
}
