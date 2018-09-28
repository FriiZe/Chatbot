# Example from github

from ner_v1.chatbot.entity_detection import get_text

message = "I want to order chinese from mainland china and pizza from domminos"
entity_name = "restaurant"
structured_value = None
fallback_value = None
bot_message = None

output = get_text(message=message, entity_name=entity_name, structured_value=structured_value, fallback_value=fallback_value, bot_message=bot_message)

print output