Nous hébergeons déjà une version du prototype [ici](http://melvin.even.emi.u-bordeaux.fr/chatbot/index.html)

## Lancer le serveur localement

2. ```export GOOGLE_APPLICATION_CREDENTIALS="chemin_vers_key.json"```
3. ```npm install``` depuis le dossier chatbot/
4. ```node app.js``` depuis le dossier chabot/integration/

## Fonctionnalités du prototype et pile technologique

* Deux arbres décisionnels : un [simple](https://imgur.com/a/PdCsTNY) et un [complexe](https://imgur.com/a/qVJuVVP) 
* Envoie de requêtes au bot via l'API js
* Intégration des "réponses rapides"
* Traitement des requêtes complexes avec un webhook (voir fullfillment) 
* Interface minimale

## Exemples de points d'entrée : 
* j'ai des problèmes de connexion
* je veux envoyer des messages à des étudiants
* comment activer son idnum ?
* j'ai des problèmes de mot de passe

## Liens et ressources

#### Documentation 

* [Detect API](https://github.com/googleapis/nodejs-dialogflow) : intéraction avec le bot (éditer/ajouter intentions, analyser texte/audio)

