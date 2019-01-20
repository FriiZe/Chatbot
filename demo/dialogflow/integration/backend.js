const dialogflow = require('dialogflow');
const structjson = require('structjson')
const uuid = require('uuid');

class ApiInterface {

    constructor() {
        this.init();
    }

    /**
     * Initializes the session client
     */
    init() {
        this.projectId = 'test-cdda6';
        this.sessionId = uuid.v4();
        this.sessionClient = new dialogflow.SessionsClient();
        this.sessionPath = this.sessionClient.sessionPath(this.projectId, this.sessionId);
        this.languageCode = 'fr-FR';
        this.currentContexts = [];
    }

    /**
     * https://cloud.google.com/dialogflow-enterprise/docs/reference/rpc/google.cloud.dialogflow.v2#google.cloud.dialogflow.v2.DetectIntentRequest
     * Creates a DetectIntentRequest
     * @param {string} message The message to send to the bot
     * @returns The new request 
     */
    createRequest(message) {
        const request = {
            session: this.sessionPath,
            queryInput: {
                text: {
                    text: message,
                    languageCode: this.languageCode,
                },
            },
            queryParams: {
                contexts: this.currentContexts,
            },
        };
        return request;
    }

    /**
     * Sends a request (message) to bot and returns a Promise containing a DetectIntentResponse
     * @param {DetectIntentRequest} request The formatted request to send (https://cloud.google.com/dialogflow-enterprise/docs/reference/rpc/google.cloud.dialogflow.v2#google.cloud.dialogflow.v2.DetectIntentRequest)
     * @returns {QueryResult} The response of the bot
     */
    async sendRequest(request) {
        const responses = await this.sessionClient.detectIntent(request).catch((error) => {
            console.error(error);
        });
        let result = responses[0].queryResult;

        // There is a bug in gRPC that the returned google.protobuf.Struct value contains fields with value of null, which causes error
        // when encoding it back. Converting to JSON and back to proto removes those values.
        result.outputContexts.forEach(context => {
            context.parameters = structjson.jsonToStructProto(
                structjson.structProtoToJson(context.parameters)
            );
        });
        this.currentContexts = result.outputContexts;

        return new Promise((resolve, reject) => {
            resolve(result);
        });
    }
}

module.exports = ApiInterface;