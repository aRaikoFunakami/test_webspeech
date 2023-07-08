class VoiceVoxPlayer {
	constructor() {
		this.audioPlayQueue = Promise.resolve();
		this.audioGenerationQueue = [];
		this.abortController = null;
	}

	playAudio(
		textData,
		callback = null,
		audioQueryUrl = "http://127.0.0.1:50021/audio_query?speaker=1",
		synthesisUrl = "http://127.0.0.1:50021/synthesis?speaker=1"
	) {
		this.abortController = new AbortController();

		var audioQueryData = "&text=" + encodeURIComponent(textData);
		audioQueryUrl = audioQueryUrl + audioQueryData;

		let audioGeneration = fetch(audioQueryUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: "",
			signal: this.abortController.signal
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
					signal: this.abortController.signal
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

		this.audioGenerationQueue.push(audioGeneration);

		this.audioPlayQueue = this.audioPlayQueue.then(() => {
			let nextAudio = this.audioGenerationQueue.shift();
			return nextAudio.then(audio =>
				new Promise((resolve, reject) => {
					const handleAbort = () => {
						audio.pause();
						audio.src = "";
						audio.onended = null;
						URL.revokeObjectURL(audio.src);
						reject(new DOMException("Audio playback aborted", "AbortError"));
					};

					this.abortController.signal.addEventListener("abort", handleAbort);

					audio.onended = () => {
						this.abortController.signal.removeEventListener("abort", handleAbort);
						if (this.audioGenerationQueue.length === 0 && callback) {
							callback();
						}
						resolve();
					};
					audio.play().catch(reject);
				})
			);
		}).catch(error => {
			console.error("再生エラー:", error);
		});
	}

	abort() {
		if (this.abortController) {
			this.abortController.abort();
			this.abortController = null;
		}
	}
}
