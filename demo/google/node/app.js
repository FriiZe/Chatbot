// Imports the Google Cloud client library
const language = require('@google-cloud/language');

// Creates a client
const client = new language.LanguageServiceClient();

/**
* TODO(developer): Uncomment the following line to run this code.
*/
const text = 'Télécharger l\'application "Lime" avec mon code svp !';


function sentiment_text (text){
   // Prepares a document, representing the provided text
   const document = {
     content: text,
     type: 'PLAIN_TEXT',
   };

   // Detects the sentiment of the document
   client
   .analyzeSentiment({document: document})
   .then(results => {
     const sentiment = results[0].documentSentiment;
     console.log(`Document sentiment:`);
     console.log(`  Score: ${sentiment.score}`);
     console.log(`  Magnitude: ${sentiment.magnitude}`);

     const sentences = results[0].sentences;
     sentences.forEach(sentence => {
       console.log(`Sentence: ${sentence.text.content}`);
       console.log(`  Score: ${sentence.sentiment.score}`);
       console.log(`  Magnitude: ${sentence.sentiment.magnitude}`);
    });
  })
 }

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

function entities_text(text) {
  // Prepares a document, representing the provided text
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  // Detects entities in the document
  client
    .analyzeEntities({document: document})
    .then(results => {
      const entities = results[0].entities;

      console.log('Entities:');
      entities.forEach(entity => {
        console.log(entity.name);
        console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
        if (entity.metadata && entity.metadata.wikipedia_url) {
          console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}$`);
        }
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

function entities_sentiment_text(text) {
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  // Detects sentiment of entities in the document
  client
    .analyzeEntitySentiment({document: document})
    .then(results => {
      const entities = results[0].entities;

      console.log(`Entities and sentiments:`);
      entities.forEach(entity => {
        console.log(`  Name: ${entity.name}`);
        console.log(`  Type: ${entity.type}`);
        console.log(`  Score: ${entity.sentiment.score}`);
        console.log(`  Magnitude: ${entity.sentiment.magnitude}`);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

//Sentiment demo
console.log('************* Entity detection demo');
sentiment_text("Salut! Est-ce que tout va bien ?");

//Syntax demo
console.log('************* Syntax demo');
syntax_text("Bonjour, ceci est un test.");

//Entity detection demo
console.log('************* Entity detection demo');
entities_text("Bonjour, je veux aller a Paris");//doesn't support accents (?)

//Entity sentiment detection demo
console.log('************* Entity sentiment detection demo');
entities_text("Bonjour, je voudrais aller a Paris s'il vous plait!");
