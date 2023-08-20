from flask import Flask, request
from langchain.llms import LlamaCpp
from langchain import PromptTemplate, LLMChain
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import (
    StreamingStdOutCallbackHandler,
)  # for streaming resposne
from langchain.llms import OpenAI

# Make sure the model path is correct for your system!
model_path = "/Users/ibrahim/Downloads/nous-hermes-13b.ggmlv3.q4_0.bin" # <-------- enter your model path here 


template = """Question: {question}

Answer: """

prompt = PromptTemplate(template=template, input_variables=["question"])

# Callbacks support token-wise streaming
callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])


n_gpu_layers = 1  # Change this value based on your model and your GPU VRAM pool.
n_batch = 512  # Should be between 1 and n_ctx, consider the amount of VRAM in your GPU.

llm = LlamaCpp(
    model_path=model_path,
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
    callback_manager=callback_manager,
    verbose=True,
    # temperature=1
)

# Uncomment the code below if you want to run inference on CPU
# llm = LlamaCpp(
#     model_path="/Users/sauravsharma/privateGPT/models/GPT4All-13B-snoozy.ggmlv3.q4_0.bin", callback_manager=callback_manager, verbose=True
# )

llm_chain = LLMChain(prompt=prompt, llm=llm)

app = Flask(__name__) 

@app.route('/api/answer')
def answer():
  question = "What is are alternative countries to film in based on this {country}?"
  
  # Run llm_chain
  response = llm_chain.run(question)
  print(response)
  
  return response

if __name__ == '__main__':
  app.run(port=5000)