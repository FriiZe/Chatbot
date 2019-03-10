## Creating the decision tree with Tulip
Required properties :
* response [String] (node property)
* quickResponses [StringVector] (node property)
* trainingSentences [StringVector] (edge property)

## Running the scripts
1. Run ```graph_to_intent.py``` via Tulip 
2. Run ```create_intent.js [files.json ...]``` with the JSON outputted by the python script as argument. 