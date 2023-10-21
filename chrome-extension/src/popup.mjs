import { ethers } from "../node_modules/ethers/dist/ethers.js";
import {
	createProofPayload,
	createProof,
	generateTweetMessage,
} from "./utils/setUp.mjs";
import { doubleSignMessage, generateKeyPair } from "./utils/eth.mjs";
import { createButton } from "./utils/ui.js";

// import ethers from "ethers";
// navIndex The three states of the extension window are, when the window loads
// check all stored data and see which state should be rendered first
let navIndex = 1;
let loader = document.getElementById("extension-loader");
let container = document.getElementById("extension-content");
let next_public_key = "";
let next_private_key = "";
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
	next_public_key = result.publicKey;
	console.log("next key pair", result);
	if (result) {
		chrome.runtime.sendMessage(
			{ command: "setUpNextAccount", data: result },
			(response) => {
				console.log("in set up next id", response);
				if (!!response) {
					handleRender(container, 2);
				} else {
					console.log("blah");
				}
			}
		);
	} else {
		alert("Next ID Set Up Failed");
	}
}
async function getNextAccount(publicKey) {
	console.log("start of getNetPrivateKey", publicKey);
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(
			{
				command: "getNextAccount",
				data: { publicKey },
			},
			(response) => {
				console.log("get next account all data response", response);
				resolve(response.data);
			}
		);
	});
}
async function getNextPrivateKey(publicKey) {
	console.log("start of getNetPrivateKey", publicKey);
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(
			{
				command: "getNextAccount",
				data: { publicKey },
			},
			(response) => {
				console.log("get next account response", response);
				resolve(response.data.privateKey);
			}
		);
	});
}

async function saveTwitterHandle(handle) {
	console.log("SAVE HANDLE TWITTER");
	try {
		let priv_key = await getNextPrivateKey(next_public_key);
		console.log(priv_key);
		const result = await createProofPayload("twitter", handle, next_public_key);
		console.log("proof result", result);
		console.log("Private key", priv_key);
		if (!!result) {
			// save result
			console.log(result);
			let data = {
				publicKey: next_public_key,
				twitter_handle: handle,
				twitter_uuid: result.uuid,
				twitter_createdAt: result.created_at,
			};
			console.log("data to save", data);
			chrome.runtime.sendMessage(
				{ command: "saveTwitterHandle", data },
				(response) => {
					console.log("twitter save response ", response);
					if (response.ok) {
						clearContainer(container);
						generatePostConfirmationTweenScreen(container, post);
					}
				}
			);
		}
		const post = await generateTweetMessage(result, priv_key);
		console.log("message to post", post);
		clearContainer(container);
		generatePostConfirmationTweenScreen(container, post);
	} catch (err) {
		console.log("Error creating proof payload: ", err);
	}
}

async function saveEthAddress(e) {
	e.preventDefault();

	let ethAddress = "";

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

async function connectTwitterAccount(proofLocation) {
	let twitterHandle = "blah";
	let nextPublicKey = "";
	let uuid = "";
	let createdAt = "";
	console.log("next_public_key on 163", next_public_key);
	let account = await getNextAccount(next_public_key);
	console.log("ACCOUNT", account);
	// chrome.runtime.sendMessage({ command: "getNextPublicKey" }, (response) => {
	// 	console.log(response); // Should log "Account Saved"
	// 	if (response.ok === true) {
	// 		// success, render the next screen
	// 		nextPublicKey = response.nextPublicKey;
	// 	} else {
	// 		alert("something went wrong");
	// 	}
	// });

	// let result = await createProof(
	// 	proofLocation,
	// 	"twitter",
	// 	account.handle,
	// 	next_public_key,
	// 	(extra = {}),
	// 	account.twitter_uuid,
	// 	account.twitter_createdAt
	// );
	// marco todo - test the actual integration for the stuff inside this branch
	if (false) {
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
	let payload = "";

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

	const signatures = await doubleSignMessage(
		nextPrivateKey,
		walletPrivate,
		payload.sign_payload
	);

	let result = await createProof(
		proofLocation,
		"ethereum",
		ethAddress,
		nextPublicKey,
		(extra = {
			wallet_signature: signatures.walletSignature,
			signature: signatures.avatarSignature,
		}),
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
		nextPublicKey: next_public_key,
		walletPrivateKey: privateKey,
		walletAddress: address,
	};
	chrome.runtime.sendMessage(
		{ command: "setUpAccount", data: accountSetUpData },
		(response) => {
			console.log(response); // Should log "Account Saved"
		}
	);
}
export function logout(e) {
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
				if (response.result && response.result.publicKey) {
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
function printIDB() {
	chrome.runtime.sendMessage({ command: "printIDB" }, (response) => {
		console.log("printIDB: in popup", response.result);
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
		<h1 class="page-title">Welcome!</h1>
		<h2 class="page-subtitle" style="padding-bottom: 20px;">This extension give you better recommendations for web3 socials sites.</h2>
		<button id="get-started-btn" class="cabal-btn primary">
			<span>
				Get Started
			</span>
		</button>
	`;
	let button = document.getElementById("get-started-btn");
	button.addEventListener("click", () => {
		clearContainer(container);
		handleRender(container, 1);
	});
}

function generateNextIDIntegrationScreen(container) {
	container.innerHTML = /*html*/ `
		<h1 class="page-title">First, Create a Next.ID</h1> 
		<h2 class="page-subtitle" style="padding-bottom: 20px;" >It only takes 1 click!</h2>
		<button class="cabal-btn" id="next-id-btn"><span>Create Next.ID</span></button>
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
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		console.log(e);
		let handle = e.target[0].value;
		if (handle.length === 0) {
			alert("please provide a twitter handle");
		} else {
			await saveTwitterHandle(handle);
		}
	});
}
function generatePostConfirmationTweenScreen(container, message) {
	clearContainer(container);
	if (message)
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
		<div style="display:flex; justify-content:space-between">

		<button  id="twitter-confirm-clipboard-btn" type="button" class="cabal-btn primary" aria-label="Copy Confirmation Message To Clipboard">
		   <span id="twitter-confirm-clipboard-btn-text">Copy to Clipboard</span>											
		</button>
		<a class="link" id="just-posted"><span>Ok, I just posted</span></a>
	</div>
	</div>

	`;
	let button = document.getElementById("twitter-confirm-clipboard-btn");
	button.addEventListener("click", async () => {
		try {
			await navigator.clipboard.writeText(message);
			alert("Tweet copied, godspeed 🫡");
		} catch (err) {
			console.error("Failed to copy tweet: ", err);
		}
	});
	let link = document.getElementById("just-posted");
	link.addEventListener("click", () => {
		// navigate to "acceptTwitterUrlScreen"
		clearContainer(container);
		generateAcceptTwitterLinkScreen(container);
	});
}
function generateAcceptTwitterLinkScreen(container) {
	container.innerHTML = /* html */ `
	<div class="main-container tweet-url-screen">
  		<h2 class="page-title">Ok, Great!</h2>
  		<p class="page-subtitle">Paste in the url of your tweet</p>
		<form class="form-container" id="tweet-url-form">
			<input type="text" id="tweet-url-input" name="tweetUrl" class="clear-input" placeholder="https://twitter.com...">
			<button id="paste-tweet-url-btn" class="cabal-btn primary" type="submit" style="margin-left:auto">
			<span>
			Confirm
			</span>
			</button>
		</form>
	</div>
	`;
	let input = document.getElementById("tweet-url-input");
	let button = document.getElementById("paste-tweet-url-btn");
	let form = document.getElementById("tweet-url-form");
	input.addEventListener("change", (e) => {
		console.log(e);
		if (e.target.value !== "") {
			button.disabled = false;
		} else {
			button.disabled = true;
		}
	});
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		console.log(e);
		let url = e.target[0].value;
		if (url.length === 0) {
			alert("no url provided");
			return;
		} else {
			// validate the tweet url
			let sampleUrlPattern = /^https:\/\/twitter.com\/\w+\/status\/(\d+)$/;
			let match = url.match(sampleUrlPattern);
			if (match) {
				let locationId = match[1];
				console.log("locationId", locationId);
				let result = await connectTwitterAccount(locationId);
				console.log("connectTwitterAccount", result);
			} else {
				alert("Invalid URL provided");
				return;
			}
		}
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
			Import
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
function generateHomeScreen(container) {
	let walletAddress = "0x1234...567"; //todo: fetch public address;
	let extensionEnabled = false;
	container.innerHTML =
		/* html */
		`
		<a  href="#" id="profile-link">My Profile</a>
		<div class="profile-sub-header">
		<div id="pfp" ></div>
		<h3>${walletAddress}</h3>
		</div>
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
function generateProfileScreen(container) {
	let currentSite = "hey.xyz";
	let walletAddress = "0x1234...5678";
	container.innerHTML = /*html*/ `
	<a href="#" id="home-link">Home</a>
	<div class="home-sub-header" style="display: flex;align-items:center; flex-direction: row; justify-content: flex-start">
		<div id="pfp"></div>
		<div>
		<h3>${walletAddress}</h3>
		<div>Current Site: ${currentSite}</div>
		</div>
	</div>
	<div class="integration-container">
		<div class="integration-square" id="nextid">
		<img src="../img/nextid.png" />
		<span class="title">Next.ID</span>
		</div>
		<div class="integration-square" id="twitter">
		<img src="../img/twitter.png" />
		<span class="title">Twitter</span>
		</div>
		<div class="integration-square" id="lens">
		<img src="../img/lens.png" />
		<span class="title">Lens</span></div>
		<div class="integration-square" id="eth">
		<img src="../img/Ethereum.png" />
		<span class="title">Wallet</span></div>
	</div>
 	<div id="more-integrations">
		<span>More Integrations</span>
	</div>
	`;

	let home = document.getElementById("home-link");
	home.addEventListener("click", () => {
		clearContainer(container);
		generateHomeScreen(container);
	});
}
function handleRender(container, navIndex) {
	console.log("rendering", navIndex);
	clearContainer(container);
	if (navIndex === 0) {
		generateWelcomeScreen(container);
	} else if (navIndex === 1) {
		generateNextIDIntegrationScreen(container);
	} else if (navIndex === 2) {
		generateConnectTwitterScreen(container);
	} else if (navIndex === 3) {
		generatePostConfirmationTweenScreen(
			container,
			"you don't need to post any tweets rn"
		);
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
	// marco todo: - this function needs to determine which screen to show first based on what is stored in IDB
	// handleRender(container, navIndex);
	// generateNextIDIntegrationScreen(container);
	// generateConnectTwitterScreen(container);
	// generatePostConfirmationTweenScreen(container, "message");
	// generateImportWallet(container);
	generateProfileScreen(container);
	// generateHomeScreen(container);
	return;
	let account_exists = await checkForExistingAccount();
	console.log("account exists", account_exists);

	// derive the nav index from the state of the account
	// if no private key exists in next_account -> show welcome screen
	// if a private key exists but there is no twitter stored in idb -> show them get twitter handle screen
	// if a ... a twitter handle is stored but not verified -> show them verify twitter screen
	// if a ... twitter is verified, but no wallet exists -> show them link wallet screen
	// if a ... wallet exists in account idb -> show them completed account screen / home screen
	if (!account_exists) {
		handleRender(container, 0);
		return;
	} else {
		// get the whole db and find the 1 public key that exists
	}
	chrome.runtime.sendMessage({ command: "getNextAccount" }, (response) => {
		console.log(response);
		if (response.ok === true) {
			console.log("next private key response", response);
			next_private_key = response.nextPrivateKey;
			next_public_key = response.nextPrivateKey;
		} else {
			handleRender(container, 1);
			return;
		}
	});
	console.log(next_private_key);
	console.log(next_public_key);
	let twitterHandle;
	if (!!next_public_key) {
		chrome.runtime.sendMessage(
			{ command: "getTwitterHandle", data: { next_public_key } },
			(response) => {
				if (response.ok) {
					twitterHandle = response.twitterHandle;
				} else {
					handleRender(container, 2);
					return;
				}
			}
		);
	}
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
});
let logoutButton = document.getElementById("log-out-btn");
logoutButton.addEventListener("click", logout);
let printButton = document.getElementById("print-btn");
printButton.addEventListener("click", printIDB);
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
