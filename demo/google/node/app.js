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
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket, pseudo) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        socket.broadcast.emit('nouveau_client', pseudo);
    });

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('message', function (message) {
        message = ent.encode(message);
        syntax_text('Test');
        socket.emit('message',{pseudo: 'chatbot', message: 'J\'ai bien reçus ton message'});
        //socket.broadcast.emit('message', {pseudo: socket.pseudo, message: message});
    });
});

server.listen(8080);


function syntax_text(text){
 // Prepares a document, representing the provided text
 const document = {
   content: text,
   type: 'PLAIN_TEXT',
 };

 // Detects syntax in the document
 client
   .analyzeSyntax({document: document})
   .then(results => {
     const syntax = results[0];

     console.log('Tokens:');
     syntax.tokens.forEach(part => {
       console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
       console.log(`Morphology:`, part.partOfSpeech);
     });
   })
   .catch(err => {
     console.error('ERROR:', err);
   });
}
