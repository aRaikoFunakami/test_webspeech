// main.js

document.addEventListener("DOMContentLoaded", function () {
	const myButton = document.getElementById("myButton");
	const cancelButton = document.getElementById("cancelButton");
	const answerElement = document.getElementById("answer");

	const networkHandler = new NetworkHandler(answerElement);

	myButton.addEventListener("click", function () {
		networkHandler.setupEventSource();
	});

	cancelButton.addEventListener("click", function () {
		networkHandler.cancelAllConnections();
	});
});
