# Just the equivalent of the CURL command in Python 2

import requests # http://docs.python-requests.org/en/master/

message = "I want to order chinese from mainland china and pizza from domminos"
entity_name = "restaurant"
structured_value = None
fallback_value = None
bot_message = None

url = "localhost"
port = "80"
complete_url = "http://{}:{}/v1/text/".format(url, port)

output = requests.post(complete_url, data={"message":message, "entity_name":entity_name, "structured_value":structured_value, "fallback_value":fallback_value, "bot_message":bot_message})

print output