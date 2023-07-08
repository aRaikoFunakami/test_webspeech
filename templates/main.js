
class SpeechHandler {
	constructor() {
		this.utterances = [];
	}

	handleSpeechEnd(event) {
		const utterance = event.target;
		const finish = utterance.finish;
		console.log(`utterance.data: ${finish}`);
		if (finish === "stop") {
			setTimeout(() => {
				this.answerElement.innerHTML = "";
			}, 1000);
		}
	}

	speakUtterance(text, data) {
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.finish = data;
		utterance.onend = this.handleSpeechEnd.bind(this);
		this.utterances.push(utterance);
		speechSynthesis.speak(utterance);
	}

	cancelAllSpeeches() {
		this.utterances.forEach((utterance) => {
			console.log(`Cancel audio output: ${utterance.text}`);
			speechSynthesis.cancel();
		});
	}
}

class NetworkHandler {
	constructor() {
		this.eventSources = [];
		this.speechHandlers = [];
	}

	cancelAllConnections() {
		this.eventSources.forEach((eventSource) => {
			if (eventSource && eventSource.readyState !== EventSource.CLOSED) {
				console.log(`Cancel network connection: ${eventSource.url}`);
				eventSource.close();
			}
		});
		this.speechHandlers.forEach((handler) => {
			handler.cancelAllSpeeches();
		});
	}

	handleEventSourceMessage(event) {
		const jsonData = JSON.parse(event.data);
		const text = jsonData.response;
		const type = jsonData.type;
		const finish = jsonData.finish_reason;
		console.log(`text: ${text}, type: ${type}, finish: ${finish}`);
		const speechHandler = new SpeechHandler();
		this.speechHandlers.push(speechHandler);
		speechHandler.speakUtterance(text, finish);
	}

	setupEventSource() {
		const eventSource = new EventSource(`http://127.0.0.1:8001/input`);
		this.eventSources.push(eventSource);
		eventSource.onmessage = this.handleEventSourceMessage.bind(this);
	}
}

document.addEventListener("DOMContentLoaded", function () {
	const myButton = document.getElementById("myButton");
	const cancelButton = document.getElementById("cancelButton");
	const answerElement = document.getElementById("answer");

	const networkHandler = new NetworkHandler();

	myButton.addEventListener("click", function () {
		networkHandler.setupEventSource();
	});

	cancelButton.addEventListener("click", function () {
		networkHandler.cancelAllConnections();
	});
});