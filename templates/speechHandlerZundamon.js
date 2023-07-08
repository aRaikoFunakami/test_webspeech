

class SpeechHandlerZundamon {
	constructor() {
		this.player = new VoiceVoxPlayer();
		this.abortController = new AbortController();
		//this.utterances = [];
		this.text = "";
		this.delimiters = [',', '.', '!', ':', ';', '?', '{', '}', '[', ']', '！', '？', '：', '；', '　', '。', '、',];
	}

	handleSpeechEnd(event) {
		const utterance = event.target;
		const isStop = utterance.isStop;
		console.log(`utterance.finish: ${isStop}`);
	}

	speak(text, isStop) {
		this.text += text + ' ';
		while (true) {
			const [firstPart, restPart] = splitTextByDelimiters(this.text, this.delimiters);
			console.log(`firstPart:${firstPart}, restPart:${restPart}(${restPart == ""}})`);

			// Buffer is empty, but speak is called again
			if (restPart == "" && isStop != true) {
				break;
			}

			// If there is still data to read, call isStop with false
			if (restPart != "") {
				//this.speakUtterance(firstPart, false);
				this.player.playAudio(firstPart);
			} else {
				//this.speakUtterance(firstPart, isStop);
				this.player.playAudio(firstPart);
				//
				// isStopのサポートを行う
				//
			}

			// If there is data left to read, repeat again.
			this.text = restPart;
			if (this.text != "") {
				continue;
			}
			break;
		}
	}

	cancelAllSpeeches() {
		this.player.abort();
	}
}
