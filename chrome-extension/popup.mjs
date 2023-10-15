import { ethers } from "ethers";
// import ethers from "ethers";
const infura_url =
	"https://polygon-mumbai.infura.io/v3/d911d6ca657e4fe4ae77ed8b2426dadd";

const EthersProvider = new ethers.JsonRpcProvider(infura_url);
function testClick() {
	console.log("clicked");
}

function setUpAccount(e) {
	e.preventDefault();
	console.log("setUpAccount e", e);
	// let inputValue = e.target.elements.walletAddress.value; // get the value of the private key
	// try {
	// 	wallet = new ethers.Wallet(privateKey);
	// } catch (e) {
	// 	alert("Invalid Private Key");
	// 	return;
	// }
	const wallet = ethers.Wallet.createRandom();

	// Get the wallet's private key and address
	const privateKey = wallet.privateKey;
	const address = wallet.address;

	// store the result of the account setup in indexedDB
	const accountSetUpData = {
		privateKey,
		address,
	};
	chrome.runtime.sendMessage(
		{ command: "setUpAccount", data: accountSetUpData },
		(response) => {
			console.log(response); // Should log "Account Saved"
		}
	);
}

document.addEventListener("DOMContentLoaded", function () {
	let loader = document.getElementById("extension-loader");
	let container = document.getElementById("extension-content");
	// dev shit ------------------------------------
	let printBtn = document.createElement("button");
	printBtn.textContent = "print idb to console";
	printBtn.addEventListener("click", () => {
		chrome.runtime.sendMessage({ command: "printIDB" }, (response) => {
			console.log("printIDB: in popup", response.result);
		});
	});
	container.appendChild(printBtn);

	let clearBtn = document.createElement("button");
	clearBtn.textContent = "Clear IDB";
	clearBtn.addEventListener("click", () => {
		chrome.runtime.sendMessage({ command: "clearIDB" }, (response) => {
			console.log("clearIDB: in popup", response);
		});
	});
	container.appendChild(clearBtn);
	// testing ethers
	let blockNumber = 0;
	EthersProvider.getBlockNumber().then((result) => {
		blockNumber = result;
	});
	let footer = document.getElementById("extension-footer");
	let footerText = document.createElement("p");
	footerText.textContent = "Current Block Number " + blockNumber.toString();
	footer.appendChild(footerText);
	// --------------------------------------------------------------------
	// the three states of the extension window are:
	// not logged in
	// logged in, but not activated
	// active
	let loggedIn = false;
	let activated = false;
	let account = "";
	if (!loggedIn) {
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

		// testing ethers & infura integration
	} else if (loggedIn && activated) {
		// todo
	}
});
