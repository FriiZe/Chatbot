# -*- coding: utf-8 -*- 
import json
from flask import Flask
from flask import request
from flask import make_response
from flask import jsonify


course_urls = {
    u"Mathématiques":u"https://www.u-bordeaux.fr/formation/2018/PRLIMA_110/mathematiques", 
    u"Chimie":u"https://www.u-bordeaux.fr/formation/2018/PRLICH_110/chimie",
    u"Physique":u"https://www.u-bordeaux.fr/formation/2018/PRLIPH/physique",
    u"Informatique":u"https://www.u-bordeaux.fr/formation/2018/PRLIIN_110/informatique",
    u"Biologie":u"https://www.u-bordeaux.fr/formation/2018/PRLISV/sciences-de-la-vie"
}

app = Flask(__name__)

@app.route("/", methods=["POST"])
def webhook():
    req = request.get_json(silent=True, force=True)
    res = "Erreur"
    try:
        query_result = req.get("queryResult")
        action = query_result.get("action")
        param = query_result.get("parameters")
        language_code = query_result.get("languageCode")

        if action == u"demander_filiere" and language_code == u"fr":
            if param[u"filiere"] in course_urls:
                res = course_urls[param[u"filiere"]]
            else:
                res = u"Je ne connais pas cette filière !"

        print(req)
    except AttributeError:
        return 'json error'
    return make_response(jsonify({"fulfillmentText":res}))