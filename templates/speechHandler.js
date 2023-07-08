// speechHandler.js

class SpeechHandler {
	constructor(answerElement) {
		this.answerElement = answerElement;
		this.utterances = [];
	}

	handleSpeechEnd(event) {
		const utterance = event.target;
		const finish = utterance.finish;
		console.log(`<div>utterance.data: ${finish}</div>`);
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
