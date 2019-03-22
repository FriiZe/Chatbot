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

let contextStructs = {} 

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
        if (contextStructs[input] == undefined && input != "") { 
            await createContextRequest(input);
            console.log("  Context %s successfully added", input);
        }
        if (contextStructs[output] == undefined && output != "") {
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
            const res = await createIntentRequest(intent);
            // console.log(res);
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
    let trainingPhrases = [];
    let inputNames = [];
    let outputContexts = [];
    let messages = [];
    if (intent.input != "") inputNames.push(contextStructs[intent.input]["name"]);
    if (intent.output != "") outputContexts.push(contextStructs[intent.output]);
    if ((intent.quick_responses).length != 0) {
        let replies = [];
        for (const reply of intent.quick_responses) {
            replies.push({title:reply});
        }
        messages.push({
            suggestions: {
                suggestions : replies
            }
        });
    }
    (intent.training_sentences).forEach(trainingSentencePart => {
        const trainingPhrase = {
            type: 'EXAMPLE',
            parts: [
                {
                    text: trainingSentencePart
                }
            ]
        };
        trainingPhrases.push(trainingPhrase);
    });
    messages.push({
        text: {
            text: [intent.response]
        }
    });
    const intentRequest = {
        displayName: intent.label,
        trainingPhrases: trainingPhrases,
        messages: messages,
        inputContextNames: inputNames, 
        outputContexts: outputContexts,
        defaultResponsePlatforms: ["ACTIONS_ON_GOOGLE"]
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
    const request = {
        parent: contextSessionPath,
        context: {
          name: contextPath,
          lifespanCount: 1
        }
    };
    const res = await contextsClient.createContext(request);
    contextStructs[context] = res[0];
    return res[0];
}

async function deleteIntent(intent) {
    const id = getId(intent.label);
    const request = {name: id};
    return await intentsClient.deleteIntent(request);
}