const fs = require("fs");
const uuid = require('uuid');
const dialogflow = require('dialogflow');

const projectId = "test-cdda6";
const sessionIdContext = uuid.v4();
const contextsClient = new dialogflow.ContextsClient();
const intentsClient = new dialogflow.IntentsClient();
const agentsClient = new dialogflow.AgentsClient();
const contextSessionPath = contextsClient.sessionPath(projectId, sessionIdContext);
const agentPath = intentsClient.projectAgentPath(projectId);
const lang = "fr";

let file_format = /([a-zA-Z0-9\_\-\(\)\\\s])+.json/;
let files = [];

let contextPaths = {} // dict ("context_name" : "context_path")

// process args
if (process.argv.length <= 2) {
    console.error("Usage: node create_intents.js file.json [other_files.json ...]")
    process.exit(1);
} else {
    let args = process.argv.slice(2);
    for (const arg of args) {
        let res = file_format.exec(arg);
        if (res == null || res[0] != arg) {
            if (res != null) console.error("Found "+res[0]);
            console.error("File \""+arg+"\" is not a json file");
            process.exit(1);
        }
        files.push(arg);
    }
}

// save the current state of the bot
// const exportRequest = {};
// agentsClient.exportAgent();

// list all current intents id and names then parse the files
let intentsList = []; // list of 2-tuple (id, name)
initIntentsList()
    .then(res => parseFiles())
    .catch(err => console.error(err));

/**
 * Parses the given files (creates contexts and intents)
 */
async function parseFiles() {
    for (const file of files) {
        console.log("Parsing file \'"+file+"\'...");
        let fileData = fs.readFileSync(file);
        let intents = JSON.parse(fileData);
        await createContexts(intents);
        await createIntents(intents);
    }
}

/**
 * Initializes the list of intents
 */
async function initIntentsList() {
    const request = {
        parent: agentPath,
    };
    const [res] = await intentsClient.listIntents(request);    
    res.forEach(i => {
        intentsList.push([i.name, i.displayName]);
    });
}

/**
 * Returns true of the given intent already exists
 */
function intentAlreadyExist(intentName) {
    for (const intent of intentsList) {
        if (intentName == intent[1])
            return true; 
    }
    return false;
}

/**
 * Creates the contexts used by the given list of intents
 */
async function createContexts(intents) {
    for (const intent of intents) {
        const input = intent.input;
        const output = intent.output;
        if (contextPaths[input] == undefined && input != "") { 
            await createContextRequest(input);
            console.log("  Context %s successfully added", input);
        }
        if (contextPaths[output] == undefined && output != "") {
            await createContextRequest(output);
            console.log("  Context %s successfully added", output);
        }
    }
}

/**
 * Creates the intents (via the API) based on the given list of intents 
 */
async function createIntents(intents) {
    for (const intent of intents) {
        console.log("  * Creating intent "+intent.label+"...");
        if (intentAlreadyExist(intent.label)) {
            console.log("    Intent %s already exists, updating it...", intent.label);
            await deleteIntent(intent);
            console.log("    Intent %s deleted", intent.label); 
            await createIntentRequest(intent);
            console.log("    Intent %s successfully added", intent.label);
        } else {
            await createIntentRequest(intent);
            console.log("    Intent %s successfully added", intent.label);
        }
    }
}

/**
 * Returns the path of the given intent 
 */
function getId(intentName) {
    for (const intent of intentsList) {
        if (intent[1] == intentName)
            return intent[0];
    }
    return "";
}

/**
 * Takes an intent object from the json and wraps it in a request for the API
 */
async function createIntentRequest(intent) {
    const trainingPhrases = [];
    (intent.training_sentences).forEach(trainingSentencePart => {
        const part = {
            text: trainingSentencePart
        };
        const trainingPhrase = {
            type: 'EXAMPLE',
            parts: [part]
        };
        trainingPhrases.push(trainingPhrase);
    });
    const messageText = {
        text: [intent.response]
    };
    const message = {
        text: messageText
    };
    const intentRequest = {
        displayName: intent.label,
        trainingPhrases: trainingPhrases,
        messages: [message]
    };
    const createIntentRequest = {
        parent: agentPath,
        intent: intentRequest,
        languageCode: lang
    };
    return await intentsClient.createIntent(createIntentRequest);
}

/**
 * Takes a context object from the json and wraps it in a request for the API
 */
async function createContextRequest(context) {
    const contextPath = contextsClient.contextPath(projectId, sessionIdContext, context);
    contextPaths[context] = contextPath;
    const request = {
        parent: contextSessionPath,
        context: {
          name: contextPath,
          lifespanCount: 1
        }
    };
    return await contextsClient.createContext(request);
}

async function deleteIntent(intent) {
    const id = getId(intent.label);
    const request = {name: id};
    return await intentsClient.deleteIntent(request);
}