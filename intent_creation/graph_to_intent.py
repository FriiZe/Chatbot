from tulip import tlp
import json
import subprocess

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
  intents = []
  labels = []

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
  
  # convert the graph to a list of intents
  for n in graph.getNodes():
    if entryPoints[n]: continue
    counter = 0
    inDegree = graph.indeg(n)
    for e in graph.getInEdges(n):
      label = graph.getName()+"_"+viewLabel[n]
      if label in labels: label+=("_"+letters[counter]) 
      labels.append(label)
      inputContext = "" if entryPoints[graph.source(e)] else ("context_"+graph.getName()+"_"+viewLabel[graph.source(e)])
      outputContext = "" if leaves[n] else ("context_"+graph.getName()+"_"+viewLabel[n])
      intent = {
        "label":label[:100] if len(label) >= 100 else label, 
        "response":response[n], 
        "training_sentences":trainingSentences[e],
        "quick_responses":quickResponses[n], 
        "entry_point":entryPoints[graph.source(e)], 
        "leaf":leaves[n], 
        "output":outputContext, 
        "input":inputContext
      }
      intents.append(intent)
      counter += 1
  
  # convert and write the intents list to json format
  with open(graph.getName()+".json", 'w') as outfile:  
    json.dump(intents, outfile)

  # send the intents to the bot
  print("Sending intent to DialogFlow...")
  subprocess.run("node create_intents.js "+graph.getName()+".json", shell=True)
  print("Done!")
