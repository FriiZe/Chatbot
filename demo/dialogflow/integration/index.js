/**
 * Quick TODO:
 *      - Handle promise (sessionClient.detectIntent)
 *      - Use socket.io instead of the command line
 */

const dialogflow = require('dialogflow');
const readline = require('readline');
const structjson = require('structjson')
const uuid = require('uuid'); // used to generate session id

// bot parameters
const projectId = 'test-cdda6';
const languageCode = 'fr-FR';
const sessionId = uuid.v4();
const sessionClient = new dialogflow.SessionsClient();
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

// where to read and write for the user input/bot response
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var currentContexts; // the list of current contexts

/**
 * Read text from the command line
 */
function readResponse() {
    rl.question('> ', (answer) => {
        if (answer == 'quit')
            return rl.close();
        parseResponse(answer);
    });
}

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
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

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

    // log the bot response 
    var intentName = result.intent ? result.intent.displayName : "no intent matched"; 
    console.log(result.fulfillmentText, '(', intentName, ')');
    
    // read the next user input
    readResponse();        
}

readResponse();