from tulip import tlp
import json

def main(graph): 
  trainingSentences = graph.getStringVectorProperty("trainingSentences")
  response = graph.getStringProperty("response")
  quickResponses = graph.getStringVectorProperty("quickResponses")
  viewColor = graph.getColorProperty("viewColor")
  viewLabel = graph.getStringProperty("viewLabel")
  viewLabelColor = graph.getColorProperty("viewLabelColor")
  entryPoints = graph.getBooleanProperty("isEntryPoint")
  leaves = graph.getBooleanProperty("isLeaf")
  letters = "abcdefghijklmnopqrstuvxyz"

  # mark the entry points and leaves
  for n in graph.getNodes():
    if not graph.getInNodes(n).hasNext():
      viewColor[n] = tlp.Color.BabyBlue
      entryPoints[n] = True
    elif not graph.getOutNodes(n).hasNext():
      viewColor[n] = tlp.Color.Green
      leaves[n] = True
    else:
      viewColor[n] = tlp.Color(255, 95, 95)
      entryPoints[n] = False
      leaves[n] = False
        
  intents = []
  
  # convert the graph to a list of intents
  for n in graph.getNodes():
    counter = 0
    outEdges = [i for i in graph.getOutEdges(n)]
    for e in outEdges:
      inputContext = "" if entryPoints[n] else ("context_"+viewLabel[n])
      outputContext = "" if leaves[graph.target(e)] else ("context_"+viewLabel[graph.target(e)])
      suffix = "" if counter == 0 and len(outEdges) == 1 else "_"+letters[counter]
      intent = {
        "label":viewLabel[n]+suffix, 
        "response":response[n], 
        "training_sentences":trainingSentences[e],
        "quick_responses":quickResponses[n], 
        "entry_point":entryPoints[n], 
        "leaf":leaves[graph.target(e)], 
        "output":outputContext, 
        "input":inputContext
      }
      intents.append(intent)
      counter += 1
  
  # convert and write the intents list to json format
  with open(graph.getName()+".json", 'w') as outfile:  
    json.dump(intents, outfile)
  
