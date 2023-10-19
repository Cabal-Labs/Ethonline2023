import { ethers } from "../node_modules/ethers/dist/ethers.js";
import { createProofPayload } from "./utils/setup.js";
import { generateKeyPair } from "./utils/eth.js";
import { createButton } from "./utils/ui.js";

// import ethers from "ethers";
let navIndex = 1;

const infura_url =
	"https://polygon-mumbai.infura.io/v3/d911d6ca657e4fe4ae77ed8b2426dadd";

const EthersProvider = new ethers.JsonRpcProvider(infura_url);
function testClick() {
	console.log("clicked");
}
// api integrations
async function createNextId() {
	// clear container
	// set loading indicator true
	let result = await generateKeyPair();
	console.log("next key pair", result);
	chrome.runtime.sendMessage(
		{ command: "setUpNextAccount", data: result },
		(response) => {
			console.log(response); // Should log "Account Saved"
			if (response.result === "Account Saved") {
				// success, render the next screen
			}
		}
	);
}
async function saveTwitterHandle(e) {
	e.preventDefault();

	let twitterHandle = "blah";

	// get from idb
	let nextPublicKey = "";
	chrome.runtime.sendMessage({ command: "getNextPublicKey" }, (response) => {
		console.log(response); // Should log "Account Saved"
		if (response.ok === true) {
			// success, render the next screen
			nextPublicKey = response.nextPublicKey;
		} else {
			alert("something went wrong");
		}
	});

	let result = await createProofPayload(
		"twitter",
		twitterHandle,
		nextPublicKey
	);
	if (result.ok) {
		// save result
	}
}
function setUpAccount(e) {
	e.preventDefault();
	console.log("setUpAccount e", e);
	let inputValue = e.target.elements.walletAddress.value; // get the value of the private key
	let publicAddress;
	try {
		publicAddress = deriveEthereumAddress(privateKey);
	} catch (e) {
		alert("Invalid Private Key");
		return;
	}

	const privateKey = inputValue;
	const address = publicAddress;

	// store the result of the account setup in indexedDB
	const accountSetUpData = {
		privateKey,
		address,
	};
	console.log(accountSetUpData);
	chrome.runtime.sendMessage(
		{ command: "setUpAccount", data: accountSetUpData },
		(response) => {
			console.log(response); // Should log "Account Saved"
		}
	);
}
function logout(e) {
	chrome.runtime.sendMessage({ command: "clearIDB" }, (response) => {
		console.log("clearIDB: in popup", response);
		if (response.result === "database cleared") {
			alert("Logged Out");
			generateWelcomeScreen();
		}
	});
}
function checkForExistingAccount() {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(
			{ command: "checkForExistingAccount" },
			(response) => {
				// if the response is a json object that contains a field called privateKey
				if (response.result && response.result.privateKey) {
					console.log("account for checkForAccount:", response);
					navIndex = 2;
					resolve(response.result);
				} else {
					console.log("no account found");
					resolve(null);
				}
			}
		);
	});
}
function clearContainer(container) {
	// this function accepts a div and removes all children dom elements from it
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
}
function generateHeader(header) {
	let titleContainer = document.createElement("div");
	let title = document.createElement("h1");
	title.textContent = "Cabal Sorel";
	title.id = "title";
	let subTitle = document.createElement("h2");
	subTitle.textContent = "Better Recommendations for Web3";
	subTitle.id = "subtitle";
	let line = document.createElement("div");
	line.id = "accent-line";
	titleContainer.appendChild(title);
	titleContainer.appendChild(subTitle);
	titleContainer.appendChild(line);
	header.appendChild(titleContainer);
	let nav = document.createElement("nav");
	let submissionLink = document.createElement("a");
	submissionLink.href = "todo";
	submissionLink.textContent = "Submission";
	nav.appendChild(submissionLink);
	let aboutCabalLink = document.createElement("a");
	aboutCabalLink.textContent = "About Cabal Labs";
	aboutCabalLink.href = "https://caballabs.com";
	nav.appendChild(aboutCabalLink);
	header.appendChild(nav);
}

function generateWelcomeScreenOld(container) {
	clearContainer(container);
	console.log("NAV 1");
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
	walletInput.className = "private-key-input";
	walletInput.placeholder = "Enter your wallet's private address here";
	form.appendChild(walletInput);

	// Create confirm button
	createButton("Paste Private Key", () => {}, "primary", "submit", container);
	container.appendChild(form);
}

function generateWelcomeScreen(container) {
	container.innerHTML = /*html*/ `
		<p style="font-size: 20px; font-family: Radjifani, Helvetica, sans-serif;">Welcome! This extension allows you to manage your Cabal Sorel account. Please enter your wallet's private address below.</p>
		<form onsubmit="setUpAccount()">
			<input type="text" id="private-key-input" name="walletAddress" class="private-key-input" style="background-color: transparent; color: #EEE; border: border-radius: 14px;
			border: 1px solid rgba(124, 124, 124, 0.4); padding: 4px 8px;" placeholder="Enter your wallet's private address here">
			<button class="cabal-btn primary" type="submit">Paste Private Key</button>
		</form>
	`;
}

function generateNextIDIntegrationScreen(container) {
	container.innerHTML = /*html*/ `
		<h3 class="page-title" style="flex:0" >First, Create a Next.ID</h3> 
		<h6 class="page-subtitle" style="flex:0">It only takes 1 click!</h6>
		<button class="btn" id="next-id-btn" style="width: 250px">Create Next.ID</button>
	`;
	let button = document.getElementById("next-id-btn");
	button.addEventListener("click", () => createNextId());
}

function generateConnectTwitterScreen(container) {}
function generatePostConfirmationTweenScreen(container) {}
function connectWalletScreen(container, account) {
	container.innerHTML = /* html */ `
		<div>Logged in as Address: ${account.address}</div>	
			<button>Link Twitter</button>
		<button onclick="logout()" >Logout</button>
	`;
}
function generateLoggedInScreenOld(container, account) {
	console.log("NAV 2");
	alert("account found", account.address);
	// clear the container
	container.innerHTML = "";
	// Create public key message
	var publicKeyMessage = document.createElement("p");
	publicKeyMessage.textContent = "Logged in as Address: " + account.address;
	container.appendChild(publicKeyMessage);
	// todo: show checklist of tasks a user must complete to finish activating their account
	// todo- brainstorm this
	// Create activate button
	var activateButton = document.createElement("button");
	activateButton.textContent = "Activate";
	activateButton.addEventListener("click", testClick);
	container.appendChild(activateButton);

	//create delete button
	let deleteAccount = document.createElement("button");
	deleteAccount.textContent = "Logout";
	deleteAccount.addEventListener("click", () => {});
	container.appendChild(deleteAccount);
	// testing ethers & infura integration
}
function handleRender(container, navIndex) {
	generateHeader(container);
	if (navIndex === 1) {
		generateNextIDIntegrationScreen(container);
	} else if (navIndex === 2) {
		connectWalletScreen(container, account);
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
		// ---------------------------------
	} else if (navIndex === 3) {
		// testing ethers --------------------------------------------------------
		EthersProvider.getBlockNumber().then((result) => {
			let footerText = document.createElement("p");
			footerText.textContent = "Current Block Number " + result.toString();
			footer.appendChild(footerText);
		});
		// --------------------------------------------------------------------
	}
}
document.addEventListener("DOMContentLoaded", async function () {
	let loader = document.getElementById("extension-loader");
	let container = document.getElementById("extension-content");
	let footer = document.getElementById("extension-footer");

	// navIndex The three states of the extension window are:
	// 	1		 not logged in
	// 	2		 logged in, but not activated
	// 	3		 active
	let account = await checkForExistingAccount();
	console.log(navIndex, account);
	//handleRender(container, navIndex);
	container.innerHTML = /* html */ `
		<button id="test-btn1" >
			test generateNextID
		</button>
	`;
	let testButton1 = document.getElementById("test-btn1");
	testButton1.addEventListener("click", () => alert("your mom"));
});
