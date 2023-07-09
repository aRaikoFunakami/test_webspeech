class SpeechRecognitionHandler {
	constructor() {
		this.recognition = null;
		this.isSpeechRecognizing = false;
		this.isCanceledSpeechRecognition = false;
		this.zundamon_speaking = false;
		this.zundamon_controller = null;
		this.eventSource = null;
		this.updateStatusHandler = null;
		this.cancelHandler = null;
	}

	initializeRecognition() {
		window.SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		this.recognition = new SpeechRecognition();
		this.recognition.lang = "ja-JP";
		this.recognition.interimResults = true;
		this.recognition.addEventListener("start", () => {
			console.log("recognition start");
			video.muted = true;
		});
		this.recognition.addEventListener("end", () => {
			console.log("recognition end");
			this.isSpeechRecognizing = false;
			video.muted = false;
		});
		this.recognition.addEventListener("nomatch", (event) => {
			console.log("recognition nomatch");
			this.isSpeechRecognizing = false;
			video.muted = false;
		});
		this.recognition.addEventListener("error", (event) => {
			console.log("recognition error");
			this.isSpeechRecognizing = false;
			video.muted = false;
		});

		this.recognition.addEventListener("result", (event) => {
			let is_final = false;

			video.muted = false;
			if (this.isCanceledSpeechRecognition) return;
			console.log(
				"resultIndex[]:" + event.resultIndex + " " + event.results.length
			);
			let text = "";
			for (let i = event.resultIndex; i < event.results.length; i++) {
				text = text + event.results[i][0].transcript;
				console.log("recognition text:[" + i + "] " + event.results[i][0].transcript);
				if (event.results[i].isFinal) {
					is_final = true;
				}
			}
			this.updateStatusHandler(text, 2);
		});
	}

	startProcessing(lang) {
		if (this.isPushedMicButton) {
			this.stopProcessing();
		}
		this.isPushedMicButton = true;

		if (this.isSpeechRecognizing) 
			return;

		this.isSpeechRecognizing = true;
		this.isCanceledSpeechRecognition = false;
		//microphone.style.filter = "brightness(0%) sepia(1000%) hue-rotate(0deg)";
		video.muted = true;

		this.recognition.lang = lang;
		if (this.recognition.lang === "en-US") {
			this.updateStatusHandler("Voice recognition in progress...", 3);
		} else if (this.recognition.lang === "ja-JP") {
			this.updateStatusHandler("音声認識中です...", 3);
		} else if (this.recognition.lang === "zh-CN") {
			this.updateStatusHandler("语音识别正在进行中...", 3);
		}

		this.recognition.start();
	}

	stopProcessing() {
		this.isPushedMicButton = false;
		//microphone.style.filter = "invert(100%) sepia(100%) saturate(0%) hue-rotate(0deg)";

		if (this.isSpeechRecognizing) {
			console.log("Cancel Speech Recognition");
			this.recognition.stop();
			this.isCanceledSpeechRecognition = true;
			this.updateStatusHandler("Cancel Speech Recognition.", 1);
			this.cancelHandler();
			return;
		}
	}
}
