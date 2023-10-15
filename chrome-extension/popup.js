console.log("This is from a popup");
function testClick() {
	console.log("clicked");
}

function setUpAccount(e) {
	e.preventDefault();
	console.log("setUpAccount e", e);
	let privateKey = "";
	// todo: get the value of the private key
	// todo: do what is needed using ether.js
	// todo: store the result of the account setup in indexedDB
	const accountSetUpData = {
		privateKey: "0x123456",
		publicKey: "0x123456",
	};
	chrome.runtime.sendMessage(
		{ command: "setUpAccount", data: accountSetUpData },
		(response) => {
			// Your logic to handle the response
			console.log(response.result); // Should log "Received data: ..."
		}
	);
}
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
		// create form
		var form = document.createElement("form");
		form.addEventListener("submit", setUpAccount);
		// Create input for wallet's private address
		var walletInput = document.createElement("input");
		walletInput.type = "text";
		walletInput.name = "walletAddress";
		walletInput.placeholder = "Enter your wallet's private address here";
		form.appendChild(walletInput);

		// Create confirm button
		var confirmButton = document.createElement("button");
		confirmButton.textContent = "Confirm";
		confirmButton.type = "submit";
		form.appendChild(confirmButton);
		//
		container.appendChild(form);
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
		activateButton.addEventListener("click", testClick);
		container.appendChild(activateButton);
	} else if (loggedIn && activated) {
		// todo
	}
});
