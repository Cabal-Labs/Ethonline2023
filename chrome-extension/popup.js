console.log("This is from a popup");
function testClick() {
	console.log("clicked");
}
document.addEventListener("DOMContentLoaded", function () {
	var button = document.getElementById("enable-extension");
	button.addEventListener("click", function () {
		testClick();
	});
});
document.addEventListener("DOMContentLoaded", function () {
	let loader = document.getElementById("extension-loader");
	let container = document.getElementById("extension-content");
	// the three states of the extension window are:
	// not logged in
	// logged in, but not activated
	// active
	let loggedIn = false;
	let activated = false;
	let account = "";
	if (!loggedIn) {
		// fetch some stuff async
		// hide the loader when it's done

		// Create welcome message
		var welcomeMessage = document.createElement("p");
		welcomeMessage.textContent =
			"Welcome! This extension allows you to manage your Cabal Sorel account. Please enter your wallet's private address below.";
		container.appendChild(welcomeMessage);

		// Create input for wallet's private address
		var walletInput = document.createElement("input");
		walletInput.type = "text";
		walletInput.name = "walletAddress";
		walletInput.placeholder = "Enter your wallet's private address here";
		container.appendChild(walletInput);

		// Create confirm button
		var confirmButton = document.createElement("button");
		confirmButton.textContent = "Confirm";
		container.appendChild(confirmButton);
		//
	} else if (loggedIn && !activated) {
		// Create public key message
		var publicKeyMessage = document.createElement("p");
		publicKeyMessage.textContent = "Logged in as Address: " + account.publicKey;
		container.appendChild(publicKeyMessage);
		// todo: show checklist of tasks a user must complete to finish activating their account
		// todo- brainstorm this
		// Create activate button
		var activateButton = document.createElement("button");
		activateButton.textContent = "Activate";
		container.appendChild(activateButton);
	} else if (loggedIn && activated) {
		// todo
	}
});
