const fs = require("fs");
const uuid = require('uuid');
const dialogflow = require('dialogflow');

const projectId = "test-cdda6";
const sessionId = uuid.v4();
const contextsClient = new dialogflow.ContextsClient();
const contextSessionPath = contextsClient.sessionPath(projectId, sessionId);

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

// parse all files
for (const file of files) {
    console.log("Parsing file \'"+file+"\'...");
    let fileData = fs.readFileSync(file);
    let intents = JSON.parse(fileData);

    // create contexts
    for (const intent of intents) {
        const input = intent.input;
        const output = intent.output;
        if (contextPaths[input] == undefined && input != "") 
            createContextRequest(input);
        if (contextPaths[output] == undefined && output != "") 
            createContextRequest(output);
    }
    
    // create intents
    for (const intent of intents) {
        console.log("  Creating intent \'"+intent.label+"\'");
        let request = createIntentRequest(intent);
    }
    console.log("Finished parsing file \'"+file+"\'");
}

/**
 * Takes an intent object from the json and wraps it in a request for the API
 */
function createIntentRequest(intent) {

}

/**
 * Takes a context object from the json and wraps it in a request for the API
 */
async function createContextRequest(context) {
    const contextPath = contextsClient.contextPath(projectId, sessionId, context);
    contextPaths[context] = contextPath;
    const request = {
        parent: contextSessionPath,
        context: {
          name: contextPath,
          lifespanCount: 1
        }
    };
    let res = await contextsClient.createContext(request);
    return res;
}