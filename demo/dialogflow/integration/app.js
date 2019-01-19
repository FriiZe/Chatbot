/**
 * Quick TODO:
 *      - Handle promise (sessionClient.detectIntent) v
 *      - Use socket.io instead of the command line v
 */

const dialogflow = require('dialogflow');
const readline = require('readline');
const structjson = require('structjson')
const uuid = require('uuid'); // used to generate session id

const express = require('express');
const app = express();
const server = require('http').createServer(app);

const io = require('socket.io').listen(server);
const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const  fs = require('fs');
// bot parameters
const projectId = 'test-cdda6';
const languageCode = 'fr-FR';
const sessionId = uuid.v4();
const sessionClient = new dialogflow.SessionsClient();


const sessionPath = sessionClient.sessionPath(projectId, sessionId);

var result;
var currentContexts; // the list of current contexts




/**
 * Sends a request to the bot and log the response.
 * @param {string} The sentence of the user
 */
async function parseResponse(answer) {
    // create the request
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: answer,
                languageCode: languageCode,
            },
        },
        queryParams: {
            contexts: currentContexts,
        },
    };

    // send the request
    const responses = await sessionClient.detectIntent(request).catch(
      (error) => {
        console.log(error);
      }
    );
    result = responses[0].queryResult;

    // Update the current context with the output context
    // There is a bug in gRPC that the returned google.protobuf.Struct
    // value contains fields with value of null, which causes error
    // when encoding it back. Converting to JSON and back to proto
    // removes those values.
    result.outputContexts.forEach(context => {
        context.parameters = structjson.jsonToStructProto(
            structjson.structProtoToJson(context.parameters)
        );
    });
    currentContexts = result.outputContexts;
    console.log("#contexts: ", currentContexts);

    // log the bot response
    var intentName = result.intent ? result.intent.displayName : "no intent matched";
    console.log(result.fulfillmentText, '( intent:', intentName, ', confidence: ', result.intentDetectionConfidence ,')');
}
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
    console.log('Un nouvel utilisateur s\'est connecter');
    socket.on('message', function (message) {
        parseResponse(message).then(
          ()=>{
            socket.emit('message', {nickname: 'Chatbot', message: result.fulfillmentText, intention: result.intent.displayName, score: result.intentDetectionConfidence });
          });
    });
});

server.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
