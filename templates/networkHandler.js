// networkHandler.js

class NetworkHandler {
	constructor(answerElement) {
		this.eventSources = [];
		this.speechHandlers = [];
		this.answerElement = answerElement;
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
		const speechHandler = new SpeechHandler(this.answerElement);
		this.speechHandlers.push(speechHandler);
		speechHandler.speakUtterance(text, finish);
	}

	setupEventSource() {
		const eventSource = new EventSource(`http://127.0.0.1:8001/input`);
		this.eventSources.push(eventSource);
		eventSource.onmessage = this.handleEventSourceMessage.bind(this);
	}
}
