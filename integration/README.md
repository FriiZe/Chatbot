## Lancer le serveur node

1. Téléchager la clé privée sous format json
2. ```export GOOGLE_APPLICATION_CREDENTIALS="chemin_vers_clé.json"```
3. ```npm install``` depuis le dossier chatbot/
4. ```node app.js``` depuis le dossier chabot/integration/

## Fonctionnalités du prototype et pile technologique

* Deux arbres décisionnels : un [simple](https://imgur.com/a/PdCsTNY) et un [complexe](https://imgur.com/a/qVJuVVP) 
* Envoie de requêtes au bot via l'API js
* Intégration des "réponses rapides"
* Traitement des requêtes complexes avec un webhook (voir fullfillment) 
* Interface minimale

## Liens et ressources

#### Documentation 

* [Detect API](https://github.com/googleapis/nodejs-dialogflow) : intéraction avec le bot (éditer/ajouter intentions, analyser texte/audio)

