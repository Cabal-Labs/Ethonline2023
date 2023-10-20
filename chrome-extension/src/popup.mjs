import { ethers } from "../node_modules/ethers/dist/ethers.js";
import { createProofPayload, createProof, replaceInString } from "./utils/setup.js";
import { doubleSignMessage, generateKeyPair } from "./utils/eth.js";
import { createButton } from "./utils/ui.js";

// import ethers from "ethers";
// navIndex The three states of the extension window are, when the window loads
// check all stored data and see which state should be rendered first
let navIndex = 1;
let loader = document.getElementById("extension-loader");
let container = document.getElementById("extension-content");

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
async function saveTwitterHandle(handle) {
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
	const post = replaceInString(result.post_content.default)

	if (result.ok) {
		// save result
		console.log(result);
		// todo: store the result in a structured way
		// for now, just store the twitter handle
		chrome.runtime.sendMessage(
			{ command: "saveTwitterHandle", data: handle },
			(response) => {
				console.log(response);
			}
		);
		generatePostConfirmationTweenScreen(container);
	}
}
async function saveEthAddress(e) {
	e.preventDefault();

	let ethAddress = "";

	// get from idb
	let nextPublicKey = "";
	let nextPrivateKey = "";
	let walletPrivate = "";
	chrome.runtime.sendMessage({ command: "getNextPublicKey" }, (response) => {
		console.log(response); // Should log "Account Saved"
		if (response.ok === true) {
			// success, render the next screen
			nextPublicKey = response.nextPublicKey;
		} else {
			alert("something went wrong");
		}
	});

	chrome.runtime.sendMessage({ command: "getNextPrivateKey" }, (response) => {
		console.log(response); // Should log "Account Saved"
		if (response.ok === true) {
			// success, render the next screen
			nextPrivateKey = response.nextPrivateKey;
		} else {
			alert("something went wrong");
		}
	});
	chrome.runtime.sendMessage({ command: "getPrivateKey" }, (response) => {
		console.log(response); // Should log "Account Saved"
		if (response.ok === true) {
			// success, render the next screen
			walletPrivate = response.PrivateKey;
		} else {
			alert("something went wrong");
		}
	});

	let result = await createProofPayload("ethreum", ethAddress, nextPublicKey);
	if (result.ok) {
		// save result
	}
	
}

async function connectTwitterAccount(e) {
	e.preventDefault();

	let twitterHandle = "blah";
	let nextPublicKey = "";
	let uuid = "";
	let createdAt = "";

	chrome.runtime.sendMessage({ command: "getNextPublicKey" }, (response) => {
		console.log(response); // Should log "Account Saved"
		if (response.ok === true) {
			// success, render the next screen
			nextPublicKey = response.nextPublicKey;
		} else {
			alert("something went wrong");
		}
	});

	let result = await createProof(
		proofLocation,
		"twitter",
		twitterHandle,
		nextPublicKey,
		(extra = {}),
		uuid,
		createdAt
	);
	if (result.ok) {
		// save result
		let nextPrivateKey = "";
		chrome.runtime.sendMessage({ command: "getNextPublicKey" }, (response) => {
			if (response.ok === true) {
				nextPrivateKey = response.nextPublicKey;
			} else {
				handleRender(container, 1);
				return;
			}
		});
		let twitterConfirmationProof = "blah"; //marco
		chrome.runtime.sendMessage(
			{
				command: "saveTwitterConfirmationProof",
				data: { twitterConfirmationProof, nextPrivateKey },
			},
			(response) => {
				if (response.ok) {
					console.log(response.result);
				}
			}
		);
	}
}

async function connectEthAccount(e) {
	e.preventDefault();

	let ethAddress = "";
	let nextPublicKey = "";
	let uuid = "";
	let createdAt = "";
	let extra = "";
	let payload ="";

	chrome.runtime.sendMessage({ command: "getNextPublicKey" }, (response) => {
		console.log(response); // Should log "Account Saved"
		if (response.ok === true) {
			// success, render the next screen
			nextPublicKey = response.nextPublicKey;
		} else {
			alert("something went wrong");
		}
	});

	chrome.runtime.sendMessage({ command: "getEthPayload" }, (response) => {
		console.log(response); // Should log "Account Saved"
		if (response.ok === true) {
			// success, render the next screen
			payload = response.ethPayload;
		} else {
			alert("something went wrong");
		}
	});



	const signatures = await doubleSignMessage(nextPrivateKey, walletPrivate, payload.sign_payload)

	let result = await createProof(
		proofLocation,
		"ethereum",
		ethAddress,
		nextPublicKey,
		extra={
			wallet_signature: signatures.walletSignature,
			signature: signatures.avatarSignature
		},
		uuid,
		createdAt
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
// --------- UI Generation -----------
function generateWelcomeScreen(container) {
	container.innerHTML = /*html*/ `
		<p style="font-size: 20px; font-family: Radjifani, Helvetica, sans-serif;">Welcome! This extension allows you to manage your Cabal Sorel account. Please enter your wallet's private address below.</p>
		<form onsubmit="setUpAccount()">
			<input type="text" id="private-key-input" name="walletAddress" class="clear-input" style="background-color: transparent; color: #EEE; border: border-radius: 14px;
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

function generateConnectTwitterScreen(container) {
	container.innerHTML = /* html */ `
	<div class="main-container">
		<h2 class="title">Enter Your X (twitter) Handle</h2>
		<form id="twitter-form" action="POST" class="form-container">
		<p style="font-size:26; color: #FFF; margin:0">@</p>	
		<input type="text"  placeholder="twitter handle" id="twitter-handle" class="clear-input" />
		<button id="twitter-clipboard-btn" type="submit" class="cabal-btn primary" aria-label="Paste From Clipboard">
			<span id="twitter-clipboard-btn-text">Submit</span>
		</button>
		</form>
	</div>
	`;
	let input = document.getElementById("twitter-handle");
	let button = document.getElementById("twitter-clipboard-btn");
	let form = document.getElementById("twitter-form");
	input.addEventListener("change", (e) => {
		console.log(e);
		if (e.target.value !== "") {
			button.disabled = false;
		} else {
			button.disabled = true;
		}
	});
	form.addEventListener("submit", (e) => {
		e.preventDefault();
		console.log(e);
		let handle = e.target[0].value;
		if (handle.length === 0) {
			// handle paste
			return;
		} else {
			// handle submit
			saveTwitterHandle(handle);
		}
	});
}
function generatePostConfirmationTweenScreen(container) {
	let message = "this is a test message";
	clearContainer(container);
	container.innerHTML =
		/*html*/
		`
	<div class="main-container twitter-page">
  		<h2 class="page-title">Ready to get Verified?</h2>
  		<p class="page-subtitle">Post the following on X (twitter)</p>
		<div class="tweet-message"> 
			<p>
			${message}
			</p>
		</div>
		<button id="twitter-confirm-clipboard-btn" type="button" class="cabal-btn primary" aria-label="Copy Confirmation Message To Clipboard">
		   <span id="twitter-confirm-clipboard-btn-text">Copy to Clipboard</span>
		</button>
		<a class="link">Refresh</a>
	</div>

	`;
	let button = document.getElementById("twitter-confirm-clipboard-btn");
	button.addEventListener("click", () => {
		// copy the value of the message to the clipboard
		let saved = navigator.clipboard.writeText(message);
		console.log(saved);
		alert("Tweet copied, godspeed 🫡");
	});
}
function connectWalletScreen(container, account) {
	container.innerHTML = /* html */ `
		<div>Logged in as Address: ${account.address}</div>	
			<button>Link Twitter</button>
		<button onclick="logout()" >Logout</button>
	`;
}
function generateImportWallet(container) {
	container.innerHTML = /* html */ `
	<div class="main-container import-wallet">
  		<h2 class="page-title">Congrats! Your X is Verified</h2>
  		<p class="page-subtitle">Now the last step, import your wallet</p>
		<form class="form-container" id="private-key-form">
			<input type="text" id="private-key-input" name="walletAddress" class="clear-input" placeholder="Enter your wallet's private address here">
			<button id="import-key-btn" class="cabal-btn primary" type="submit">
			<span>
			Paste Private Key
			</span>
			</button>
		</form>
		<a href="#" class="link">What Happens with My Private Key?</a>
	</div>
	`;
	let input = document.getElementById("private-key-input");
	let button = document.getElementById("import-key-btn");
	let form = document.getElementById("private-key-form");
	input.addEventListener("change", (e) => {
		console.log(e);
		if (e.target.value !== "") {
			button.disabled = false;
		} else {
			button.disabled = true;
		}
	});
	form.addEventListener("submit", (e) => {
		e.preventDefault();
		console.log(e);
		let key = e.target[0].value;
		if (key.length === 0) {
			return;
		} else {
			// handle submit
			saveEthAddress(key);
			saved = true;
			if (saved) {
				clearContainer(container);
				generateSuccessfulWalletImport(container);
			}
		}
	});
}
function generateSuccessfulWalletImport(container) {
	let walletAddress = "0x1234...567"; //todo: fetch public address;
	container.innerHTML =
		/* html */
		`
	<h1 class="page-title">Congrats! </h1>
	<h2 class="page-subtitle">Your Wallet Was Imported Successfully</h2>
	<div id="pfp" ></div>
	<h3>${walletAddress}</h3>
	<a id="profile-link">Go to Profile</a>
	`;
	let profile = document.getElementById("profile-link");
	profile.addEventListener("click", () => {
		clearContainer(container);
		generateProfileScreen(container);
	});
}
function generateProfileScreen(container) {
	let walletAddress = "0x1234...567"; //todo: fetch public address;
	container.innerHTML =
		/* html */
		`
		<div class="profile-sub-header">
		<div id="pfp" ></div>
		<h3>${walletAddress}</h3>
		<a  href="#" id="home-link">Home</a>
		</div>
		<div class="profile-grid-item" id="next-id-grid-item">Next Id Connected</div>
		<div class="profile-grid-item" id="twitter-grid-item">Twitter Connected</div>
		<div class="profile-grid-item" id="lens-grid-item">Lens Connected</div>
		<div class="profile-grid-item" id="more-integrations-grid-item">More Integrations</div>
	`;
	let home = document.getElementById("home-link");
	home.addEventListener("click", () => {
		clearContainer(container);
		generateHomeScreen(container);
	});
}
function generateHomeScreen(container) {
	let currentSite = "hey.xyz";
	let extensionEnabled = false;
	let walletAddress = "0x1234...5678";
	container.innerHTML = /*html*/ `
	<div class="home-sub-header">
		<div id="pfp" ></div>
		<h3>${walletAddress}</h3>
		<a href="#" id="profile-link">Profile</a>
	</div>
	<div>Current Site: ${currentSite}</div>
	<button class="cabal-btn" id="activate-btn">${
		extensionEnabled ? "Deactivate Extension" : "Activate Extension"
	}</button>
	`;
	let button = document.getElementById("activate-btn");
	button.addEventListener("click", () => {
		if (extensionEnabled) {
			alert("extension disabled");
			button.innerHTML = "Activate Extension";
		} else {
			alert("extension enabled");
			button.innerHTML = "Deactivate Extension";
		}
	});
	let profile = document.getElementById("profile-link");
	profile.addEventListener("click", () => {
		clearContainer(container);
		generateProfileScreen(container);
	});
}
function handleRender(container, navIndex) {
	if (navIndex === 0) {
		generateWelcomeScreen(container);
	} else if (navIndex === 1) {
		generateNextIDIntegrationScreen(container);
	} else if (navIndex === 2) {
		generateConnectTwitterScreen(container);
	} else if (navIndex === 3) {
		generatePostConfirmationTweenScreen(container);
	} else if (navIndex === 4) {
		generateImportWallet(container);
	} else if (navIndex === 5) {
		generateSuccessfulWalletImport(container);
	} else if (navIndex === 6) {
		generateProfileScreen(container);
	} else if (navIndex === 7) {
		generateHomeScreen(container);
	} else {
		container.innerHTML = /* html */ `<div>Error</div>`;
	}
}
document.addEventListener("DOMContentLoaded", async function () {
	let account = await checkForExistingAccount();
	// derive the nav index from the state of the account
	// if no private key exists in next_account -> show welcome screen
	// if a private key exists but there is no twitter stored in idb -> show them get twitter handle screen
	// if a ... a twitter handle is stored but not verified -> show them verify twitter screen
	// if a ... twitter is verified, but no wallet exists -> show them link wallet screen
	// if a ... wallet exists in account idb -> show them completed account screen / homescreen
	let next_privateKey;
	// chrome.runtime.sendMessage({ command: "getNextPublicKey" }, (response) => {
	// 	if (response.ok === true) {
	// 		next_privateKey = response.nextPublicKey;
	// 	} else {
	// 		handleRender(container, 1);
	// 		return;
	// 	}
	// });
	// let twitterHandle;
	// if (!!next_privateKey) {
	// 	chrome.runtime.sendMessage({ command: "getTwitterHandle" }, (response) => {
	// 		if (response.ok) {
	// 			twitterHandle = response.twitterHandle;
	// 		} else {
	// 			handleRender(container, 2);
	// 			return;
	// 		}
	// 	});
	// }
	// let twitterConfirmationProof;
	// if (!!twitterHandle) {
	// 	// todo pass private key to this function
	// 	chrome.runtime.sendMessage(
	// 		{ command: "getTwitterConfirmationProof", data: { privateKey } },
	// 		(response) => {
	// 			if (response.ok) {
	// 				twitterConfirmationProof = response.twitterConfirmationProof;
	// 			} else {
	// 				handleRender(container, 3);
	// 			}
	// 		}
	// 	);
	// }

	// let walletAddress = "";
	// if (!!twitterConfirmationProof) {
	// 	// render connect wallet screen
	// 	// check for a wallet address from the IDB
	// 	walletAddress = "0x12345";
	// 	handleRender(container, 4);
	// }
	// if (!!walletAddress) {
	// 	// they have an account, just show them the home screen
	// 	handleRender(container, 7);
	// }
	console.log(navIndex, account);
	// handleRender(container, navIndex);
	// generateNextIDIntegrationScreen(container);
	//generateConnectTwitterScreen(container);
	// generatePostConfirmationTweenScreen(container);
	generateImportWallet(container);
	// generateProfileScreen(container);
	//generateHomeScreen(container);
});
// dev shit ------------------------------------
// let printBtn = document.createElement("button");
// printBtn.textContent = "print idb to console";
// printBtn.addEventListener("click", () => {
// 	chrome.runtime.sendMessage({ command: "printIDB" }, (response) => {
// 		console.log("printIDB: in popup", response.result);
// 	});
// });
// container.appendChild(printBtn);

// let clearBtn = document.createElement("button");
// clearBtn.textContent = "Clear IDB";
// clearBtn.addEventListener("click", () => {
// 	chrome.runtime.sendMessage({ command: "clearIDB" }, (response) => {
// 		console.log("clearIDB: in popup", response);
// 	});
// });
// container.appendChild(clearBtn);
// ---------------------------------
// testing ethers --------------------------------------------------------
// EthersProvider.getBlockNumber().then((result) => {
// 	let footerText = document.createElement("p");
// 	footerText.textContent = "Current Block Number " + result.toString();
// 	footer.appendChild(footerText);
// });
// --------------------------------------------------------------------
