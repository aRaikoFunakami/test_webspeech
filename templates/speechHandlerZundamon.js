let audioPlayQueue = Promise.resolve();
let audioGenerationQueue = [];

function playAudioByVoiceVox(
	textData, 
	abortSignal=null,
	callback=null,
	audioQueryUrl = "http://127.0.0.1:50021/audio_query?speaker=1", 
	synthesisUrl = "http://127.0.0.1:50021/synthesis?speaker=1"
) {
	var audioQueryData = "&text=" + encodeURIComponent(textData);
	audioQueryUrl = audioQueryUrl + audioQueryData;

	let audioGeneration = fetch(audioQueryUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: "",
		signal: abortSignal
	})
	.then(response => response.json())
	.then(data => {
		var jsonData = JSON.stringify(data);

		return fetch(synthesisUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: jsonData,
			signal: abortSignal
		});
	})
	.then(response => response.blob())
	.then(blob => {
		var audio = new Audio();
		audio.src = URL.createObjectURL(blob);
		return audio;
	})
	.catch(error => {
		console.error("音声生成エラー:", error);
	});

	audioGenerationQueue.push(audioGeneration);

	audioPlayQueue = audioPlayQueue.then(() => {
		let nextAudio = audioGenerationQueue.shift();
		return nextAudio.then(audio => new Promise((resolve, reject) => {
			const handleAbort = () => {
				audio.pause();
				audio.src = '';
				audio.onended = null;
				URL.revokeObjectURL(audio.src);
				reject(new DOMException('Audio playback aborted', 'AbortError'));
			};
			
			if (abortSignal) {
				abortSignal.addEventListener('abort', handleAbort);
			}

			audio.onended = () => {
				if (abortSignal) {
					abortSignal.removeEventListener('abort', handleAbort);
				}
				if (audioGenerationQueue.length === 0 && callback) {
					callback();
				}
				resolve();
			};
			audio.play().catch(reject);
		}));
	})
	.catch(error => {
		console.error("再生エラー:", error);
	});
}

class SpeechHandlerZundamon {
	constructor() {
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
				playAudioByVoiceVox(firstPart, this.abortController.signal, null)
			} else {
				//this.speakUtterance(firstPart, isStop);
				playAudioByVoiceVox(firstPart, this.abortController.signal, null)
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
		this.abortController.abort();
		this.abortController = new AbortController();
	}
}
