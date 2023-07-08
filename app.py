# original site of video
# https://commons.wikimedia.org/wiki/File:Big_Buck_Bunny_4K.webm
# https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.720p.webm
from flask import Flask, render_template, request
import flask
import queue
import logging
import threading
import time
import json

app = Flask(__name__, static_folder='./templates', static_url_path='')

texts = [
    "This is the first text.",
    "Here comes the second one.",
    "The third text is ready.",
    "Let's move on to the fourth.",
    "Fifth text is on its way.",
    "Sixth text is here.",
    "Seventh text reporting in.",
    "Eighth text says hello.",
    "The ninth text has arrived.",
    "Tenth and final text.",
]

def dummy_chatGPT(callback):
    for i in texts:
        message = { 'response': i, 'type': None, 'finish_reason': None}
        callback(json.dumps(message))
        time.sleep(1)
    message = { 'response': i, 'type': None, 'finish_reason': 'stop'}
    callback(json.dumps(message))
    return

@app.route('/input', methods=["GET"])
def input():
    logging.info(request)
    qa_stream = queue.Queue()
    def dummy_callback(response=None):
        qa_stream.put(response)

    producer_thread = threading.Thread(target=dummy_chatGPT, args=(dummy_callback,))
    producer_thread.start()

    def stream():
        while True:
            msg = qa_stream.get()
            if msg is None:
                break
            yield f'data: {msg}\n\n'

    stream_res = flask.Response(stream(), mimetype='text/event-stream')
    return stream_res

@app.route('/')
def index():
    return render_template('index.html')

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s:%(filename)s:%(funcName)s - %(message)s")
app.run(port=8001, debug=True)
