Nous hébergeons déjà une version du prototype [ici](http://melvin.even.emi.u-bordeaux.fr/chatbot/index.html)

## Lancer le serveur localement

#### Prérequis : 
1. Se placer dans le dossier racine "Chatbot/"
2. ```export GOOGLE_APPLICATION_CREDENTIALS="key.json"```

#### Lancer le serveur web localement
1. ```npm install``` depuis le dossier Chatbot/
2. ```node app.js``` depuis le dossier Chabot/integration/

#### Création/modification d'intention
Dans un arbre décisionnel, une intention une paire (arête entrante, noeud) où l'arête entrante contient la liste de phrases d'exemples menant à la réponse stocké dans le noeud.
Les propriétés Tulip obligatoires pour créer un arbre décisionnel :
* response [String] : les noeuds stockent la réponse du bot dans cette propriété.
* quickResponses [StringVector] : les noeuds stockent les "réponses rapides" ou "suggestions" dans cette propriété.
* trainingSentences [StringVector] : les arêtes stockent les phrases d'exemples dans cette propriété.
* viewLabel [String] : chaque noeud doit contenir un unique viewLabel qui le décrit (sans espace ni accent).

Il est aussi conseillé de donner un nom à l'arbre qui décrit son domaine d'intention. 

Pour convertir l'arbre en JSON, il faut lancer le script graph_to_intent.py depuis Tulip.
Pour envoyer les intentions dans le bot, il faut lancer le script ```node create_intent.js nom_fichier_json.js```

Le même procédé est utlisé pour modifier les intentions, il suffit de relancer les scripts.

## Fonctionnalités du prototype et pile technologique

* Deux arbres décisionnels : un [simple](https://imgur.com/a/PdCsTNY) et un [complexe](https://imgur.com/a/qVJuVVP) 
* Envoie de requêtes au bot via l'API js
* Intégration des "réponses rapides"
* Traitement des requêtes complexes avec un webhook (voir fullfillment) 
* Interface minimale
* Convertion d'arbres décisionnels fait sous Tulip en intention

## Exemples de points d'entrée : 
* j'ai des problèmes de connexion
* je veux envoyer des messages à des étudiants
* comment activer son idnum ?
* j'ai des problèmes de mot de passe

## Liens et ressources

#### Documentation 

* [Detect API](https://github.com/googleapis/nodejs-dialogflow) : intéraction avec le bot (éditer/ajouter intentions, analyser texte/audio)

