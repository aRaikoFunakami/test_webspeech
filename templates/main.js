const utterances = [];
const eventSources = [];

function handleSpeechEnd(event) {
	const utterance = event.target;
	const finish = utterance.finish;
	var answerElement = document.getElementById("answer");
	answerElement.innerHTML = answerElement.innerHTML + `<div>utterance.data:${finish}</div>`;
	if(finish == "stop"){
		setTimeout(()=>{ answerElement.innerHTML="";}, 1000);
	}
}

function speakUtterance(text, data) {
	const utterance = new SpeechSynthesisUtterance(text);
	utterance.finish = data; // データを関連付ける
	utterance.onend = handleSpeechEnd;
	utterances.push(utterance);
	speechSynthesis.speak(utterance);
}


function cancelAllSpeeches() {
	utterances.forEach(utterance => {
		console.log(`Cancel audio output: ${utterance.text}`);
		speechSynthesis.cancel();
	});
}

function cancelAllConnections() {
	eventSources.forEach(eventSource => {
		if (eventSource && eventSource.readyState !== EventSource.CLOSED) {
			console.log(`Cancel network connectionb: ${eventSource.url}`);
			eventSource.close();
		}
	});
}

document.addEventListener("DOMContentLoaded", function () {
	var myButton = document.getElementById("myButton");
	var cancelButton = document.getElementById("cancelButton");
	var answerElement = document.getElementById("answer");

	myButton.addEventListener("click", function () {
		const eventSource = new EventSource(`http://127.0.0.1:8001/input`);
		eventSources.push(eventSource);

		eventSource.onmessage = function (event) {
			const jsonData = JSON.parse(event.data);
			const text = jsonData.response;
			const type = jsonData.type;
			const finish = jsonData.finish_reason;
			answerElement.innerHTML = answerElement.innerHTML + `<div>text: ${text}, type: ${type}, finish: ${finish}</dev>`;
			speakUtterance(text, finish)
		}
	});

	cancelButton.addEventListener("click", function () {
		cancelAllSpeeches();
		cancelAllConnections();
	});
});