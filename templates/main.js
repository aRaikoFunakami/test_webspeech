// main.js

document.addEventListener("DOMContentLoaded", function () {
	const myButton = document.getElementById("myButton");
	const cancelButton = document.getElementById("cancelButton");

	const networkHandler = new NetworkHandler();

	myButton.addEventListener("click", function () {
		networkHandler.setupEventSource();
	});

	cancelButton.addEventListener("click", function () {
		networkHandler.cancelAllConnections();
	});
});
