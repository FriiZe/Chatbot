import six
from google.cloud import language
from google.cloud.language import enums
from google.cloud.language import types

client = language.LanguageServiceClient()

def sentiment_text(text):
    if isinstance(text, six.binary_type):
        text.decode("utf-8")
    document = types.Document(content=text, type=enums.Document.Type.PLAIN_TEXT)
    sentiment = client.analyze_sentiment(document=document).document_sentiment
    print('Text: {}'.format(text))
    print('Sentiment: {}, {}'.format(sentiment.score, sentiment.magnitude))

def syntax_text(text):
    if isinstance(text, six.binary_type):
        text = text.decode('utf-8')
    document = types.Document(content=text, type=enums.Document.Type.PLAIN_TEXT)
    tokens = client.analyze_syntax(document).tokens
    pos_tag = ('UNKNOWN', 'ADJ', 'ADP', 'ADV', 'CONJ', 'DET', 'NOUN', 'NUM', 'PRON', 'PRT', 'PUNCT', 'VERB', 'X', 'AFFIX')
    print("Text: {}".format(text))
    for token in tokens:
        print(u'{}: {}'.format(pos_tag[token.part_of_speech.tag], token.text.content))

def entities_text(text):
    if isinstance(text, six.binary_type):
        text = text.decode('utf-8')
    document = types.Document(content=text, type=enums.Document.Type.PLAIN_TEXT)
    entities = client.analyze_entities(document).entities
    entity_type = ('UNKNOWN', 'PERSON', 'LOCATION', 'ORGANIZATION', 'EVENT', 'WORK_OF_ART', 'CONSUMER_GOOD', 'OTHER')
    print("Text: {}".format(text))
    for entity in entities:
        print('=' * 20)
        print(u'{:<16}: {}'.format('name', entity.name))
        print(u'{:<16}: {}'.format('type', entity_type[entity.type]))
        print(u'{:<16}: {}'.format('metadata', entity.metadata))
        print(u'{:<16}: {}'.format('salience', entity.salience))
        print(u'{:<16}: {}'.format('wikipedia_url', entity.metadata.get('wikipedia_url', '-')))

def entity_sentiment_text(text):
    if isinstance(text, six.binary_type):
        text = text.decode('utf-8')
    document = types.Document(content=text.encode('utf-8'), type=enums.Document.Type.PLAIN_TEXT)
    encoding = enums.EncodingType.UTF32
    if sys.maxunicode == 65535:
        encoding = enums.EncodingType.UTF16
    result = client.analyze_entity_sentiment(document, encoding)
    for entity in result.entities:
        print('Mentions: ')
        print(u'Name: "{}"'.format(entity.name))
        for mention in entity.mentions:
            print(u'  Begin Offset : {}'.format(mention.text.begin_offset))
            print(u'  Content : {}'.format(mention.text.content))
            print(u'  Magnitude : {}'.format(mention.sentiment.magnitude))
            print(u'  Sentiment : {}'.format(mention.sentiment.score))
            print(u'  Type : {}'.format(mention.type))
        print(u'Salience: {}'.format(entity.salience))
        print(u'Sentiment: {}\n'.format(entity.sentiment))

# Sentiment demo
print("************* Entity detection demo")
sentiment_text("Salut! Est-ce que tout va bien ?")

# Syntax demo
print("************* Syntax demo")
syntax_text("Bonjour, ceci est un test.")

# Entity detection demo
print("************* Entity detection demo")
entities_text("Bonjour, je veux aller a Paris") # doesn't support accents (?)

# Entity sentiment detection demo
print("************* Entity sentiment detection demo")
entities_text("Bonjour, je voudrais aller a Paris s'il vous plait!")