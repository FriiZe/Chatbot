# Just the equivalent of the CURL command from the doc in Python 2
# Haven't tested it yet I can't run the server on Windows...

import requests # http://docs.python-requests.org/en/master/
import json

message = "I want to order chinese from mainland china and pizza from domminos"
entity_name = "restaurant"
structured_value = None
fallback_value = None
bot_message = None

url = "localhost"
port = "80"
complete_url = "http://{}:{}/v1/text/".format(url, port)

output_json = requests.post(complete_url, data={"message":message, "entity_name":entity_name, "structured_value":structured_value, "fallback_value":fallback_value, "bot_message":bot_message})
output = json.loads(output_json)

print output