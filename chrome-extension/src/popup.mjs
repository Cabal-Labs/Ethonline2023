import { ethers } from "../node_modules/ethers/dist/ethers.js";
import {
	createProofPayload,
	createProof,
	generateTweetMessage,
} from "./utils/setUp.mjs";
import { doubleSignMessage, generateKeyPair } from "./utils/eth.mjs";
import { findOneIdentityWithSource } from "./utils/graphClient.js";
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
					generateConnectTwitterScreen(container);
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
			const post = await generateTweetMessage(result, priv_key);

			console.log(result);
			let data = {
				publicKey: next_public_key,
				twitter_handle: handle,
				twitter_uuid: result.uuid,
				twitter_createdAt: result.created_at,
				twitter_post_content: post,
				privateKey: priv_key,
			};
			console.log("data to save", data);
			chrome.runtime.sendMessage(
				{ command: "saveTwitterHandle", data },
				async (response) => {
					console.log("twitter save response ", response);
					if (response.ok) {
						const post = await generateTweetMessage(result, priv_key);
						clearContainer(container);
						generatePostConfirmationTweenScreen(container, post);
					}
				}
			);
		}
	} catch (err) {
		console.log("Error creating proof payload: ", err);
	}
}

async function saveEthAddress(privateEth, ethAddress) {
	// get from idb
	let account = await getNextAccount(next_public_key);
	console.log("2- ACCOUNT IN SAVEETHADDRESS()", account);
	let result = await createProofPayload(
		"ethereum",
		ethAddress,
		account.publicKey
	);
	console.log("3 - result in saveEthAddress()", result);
	let signResult = await doubleSignMessage(
		account.privateKey,
		privateEth,
		result.sign_payload
	);
	console.log("4 - signResult in saveEthAddress()", signResult);
	// save result
	let data = {
		nextPublicKey: next_public_key,
		eth_wallet_private_key: privateEth,
		eth_wallet_public_key: ethAddress,
		eth_wallet_uuid: result.uuid,
		eth_wallet_created_at: result.created_at,
		eth_wallet_avatar_sig: signResult.avatarSignature,
		eth_wallet_wallet_sig: signResult.walletSignature,
	};
	try {
		const response = await new Promise((resolve, reject) => {
			chrome.runtime.sendMessage(
				{ command: "saveEthAddress", data },
				(response) => {
					console.log("5- saved?", response);
					if (response.ok) {
						resolve(response.ok);
					} else {
						reject(new Error("Failed to save Eth Address"));
					}
				}
			);
		});
		return response;
	} catch (error) {
		console.error(error);
		return false;
	}
}

async function connectTwitterAccount(proofLocation) {
	let account = await getNextAccount(next_public_key);
	console.log("ACCOUNT IN CONNECTTWITTERACCOUNT()", account);

	let result = await createProof(
		proofLocation,
		"twitter",
		account.handle,
		next_public_key,
		{},
		account.twitter_uuid,
		account.twitter_createdAt
	);
	// marco todo - test the actual integration for the stuff inside this branch
	if (result) {
		// save result
		let twitter_confirmation_proof = "blah"; //marco
		chrome.runtime.sendMessage(
			{
				command: "saveTwitterConfirmationProof",
				data: {
					twitterConfirmationProof: twitter_confirmation_proof,
					nextPublicKey: next_public_key,
					twitter_verified: true,
				},
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

// function setUpAccount(e) {
// 	e.preventDefault();
// 	console.log("setUpAccount e", e);
// 	let inputValue = e.target.elements.walletAddress.value; // get the value of the private key
// 	let publicAddress;
// 	try {
// 		publicAddress = deriveEthereumAddress(privateKey);
// 	} catch (e) {
// 		alert("Invalid Private Key");
// 		return;
// 	}
// 	const privateKey = inputValue;
// 	const address = publicAddress;

// 	// store the result of the account setup in indexedDB
// 	const accountSetUpData = {
// 		nextPublicKey: next_public_key,
// 		walletPrivateKey: privateKey,
// 		walletAddress: address,
// 	};
// 	chrome.runtime.sendMessage(
// 		{ command: "setUpAccount", data: accountSetUpData },
// 		(response) => {
// 			console.log(response); // Should log "Account Saved"
// 		}
// 	);
// }
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
		generateNextIDIntegrationScreen(container);
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
				clearContainer(container);
				generateImportWallet(container);
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
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		console.log(e);
		let key = e.target[0].value;
		if (key.length === 0) {
			alert("No private key provided");
			return;
		} else {
			let private_key = key;
			// convert the private key to a public key
			let wallet = new ethers.Wallet(private_key, EthersProvider);
			let public_key = wallet.address;
			// handle submit
			console.log("1 - key into saveEth", key);
			let saved = await saveEthAddress(private_key, public_key);
			console.log(saved);
			if (saved) {
				clearContainer(container);
				generateSuccessfulWalletImport(container);
			} else {
				alert("something went wrong");
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
	<div id="pfp"></div>
	<h3 class="fancy-wallet-text" style="text-align:center; padding-block: 10px">${walletAddress}</h3>
	<button id="profile-btn"class="cabal-btn primary"><span>Go To Profile</span></button>
	`;
	let profile = document.getElementById("profile-btn");
	profile.addEventListener("click", () => {
		clearContainer(container);
		(async () => {
			await generateProfileScreen(container);
		})();
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
		<button class="cabal-btn ${
			extensionEnabled ? "" : "primary"
		}" id="activate-btn">${
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
		(async () => {
			await generateProfileScreen(container);
		})();
	});
}
async function generateProfileScreen(container) {
	let account = await checkForExistingAccount();
	console.log("account in generateProfileScreen", account);
	let currentSite = "hey.xyz";
	let walletAddress = "0x1234...5678";
	container.innerHTML = /*html*/ `
	<a href="#" id="home-link">Home</a>
	<a href="#" id="log-out-link">Log Out</a>
	<div class="home-sub-header" style="display: flex;align-items:center; flex-direction: row; justify-content: flex-start">
		<div id="pfp"></div>
		<div>
		<h3>${walletAddress}</h3>
		<div>Current Site: ${currentSite}</div>
		</div>
	</div>
	<div class="callout">
	<a id="improve-twitter" style="cursor:pointer">Improve Recommendations with Twitter History</a>
	</div>

	<div class="integration-container">
	    
		<div class="integration-square" id="nextid">
		<img src="../img/nextid.png" />
		<span class="title">Next.ID</span>
		</div>
		<div class="integration-square" id="twitter">
		<img src="../img/twitter.png" />
		<span class="title">
		Twitter
		</span>
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

	let nextid = document.getElementById("nextid");
	nextid.addEventListener("click", () => {
		window.open("TODO", "_blank");
	});

	let twitter = document.getElementById("twitter");
	twitter.addEventListener("click", () => {
		window.open(`https://twitter.com/${account.twitter_handle}`, "_blank");
	});

	let lens = document.getElementById("lens");
	lens.addEventListener("click", () => {
		window.open("TODO", "_blank");
	});

	let eth = document.getElementById("eth");
	eth.addEventListener("click", () => {
		window.open(
			`https://etherscan.io/address/${account.eth_wallet_public_key}`,
			"_blank"
		);
	});
	let improveTwitter = document.getElementById("improve-twitter");
	improveTwitter.addEventListener("click", () => {
		clearContainer(container);
		generateTwitterHistoryScreen(container);
	});
	let logoutButton = document.getElementById("log-out-link");
	logoutButton.addEventListener("click", logout);

	let social = await findOneIdentityWithSource(account.eth_wallet_public_key)
	
}

async function uploadTwitterHistoryToTableland(data) {
	try {
		// api
	} catch (e) {
		console.error(e);
	}
}
function generateTwitterHistoryScreen(container) {
	container.innerHTML = /*html*/ `
	<div class="main-container" >
		<h1 class="title" style="text-align:left">Improve Recommendations with Twitter History</h1>
		<h2 class="page-subtitle" style="text-align:left">This requires downloading your twitter archive</h2>
		<a style="text-align:left" class="link" href="https://help.twitter.com/en/managing-your-account/accessing-your-x-data#:~:text=Click%20or%20tap%20More%20in,an%20archive%20of%20your%20data." target="_blank">How do I download my twitter archive?</a>
		<div class="info">
			<h3>
				Only upload [root folder]/data/likes.js
			</h3>
		</div>
		<form id="upload-twitter-history-form" style=>
		
			<input type="file" id="upload-twitter-history-btn" class="file-upload">
			<button type="submit" class="cabal-btn primary">
				<span>
					Upload Twitter History
				</span>
			</button>
		</form>
	</div>
	`;
	let form = document.getElementById("upload-twitter-history-form");
	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		// handle the file upload
		let fileInput = document.getElementById("upload-twitter-history-btn");
		let file = fileInput.files[0];
		console.log(file);
		// process the file
		// save the contents of the file as an array, the file will only contain:
		// window.YTD.like.part0 = [{a list of objects}]
		// i want the objects
		let dataToSave = "";
		let reader = new FileReader();
		reader.onload = function (event) {
			// log the contents of the file
			let result = event.target.result;
			let prefixToStrip = "window.YTD.like.part0 = ";
			let strippedResult = result.slice(prefixToStrip.length);
			let parsedResult = JSON.parse(strippedResult);
			// get the first 500 likes from the parsed result list
			let first500 = parsedResult.slice(0, 500);
			console.log(first500);
			let string500 = JSON.stringify(first500);
			// send the first 500 likes to the background script
			dataToSave = string500;
		};

		reader.readAsText(file);
		// send the data to the background script
		await uploadTwitterHistoryToTableland(dataToSave);
	});
}

async function getTwitterAccount(publicKey) {
	try {
		let response = await new Promise((resolve, reject) => {
			chrome.runtime.sendMessage(
				{ command: "getTwitterAccount", data: { next_public_key: publicKey } },
				(response) => {
					resolve(response);
				}
			);
		});
		console.log("GET TWITTER ACCOUNT", response);
		if (response.ok) {
			return response.data;
		} else {
			return false;
		}
	} catch (error) {
		console.error("Error in getTwitterAccount: ", error);
		return false;
	}
}
async function getTwitterConfirmationProofAsync(publicKey) {
	try {
		let response = await new Promise((resolve, reject) => {
			chrome.runtime.sendMessage(
				{
					command: "getTwitterConfirmationProof",
					data: { next_public_key: publicKey },
				},
				(response) => {
					resolve(response);
				}
			);
		});
		console.log("BUG2", response);
		if (response.ok) {
			return {
				twitterConfirmationProof: response.twitterConfirmationProof,
				twitterVerified: response.twitterVerified,
			};
		} else {
			let message = response.message;
			generatePostConfirmationTweenScreen(container, message);
		}
	} catch (error) {
		console.error("Error in getTwitterConfirmationProofAsync: ", error);
		return false;
	}
}
document.addEventListener("DOMContentLoaded", async function () {
	let twitterConfirmationProof;
	let twitterVerified;
	let account = await checkForExistingAccount();
	if (!account) {
		console.log("no account found");
		generateWelcomeScreen(container);
		return;
	}
	console.log(account);
	if (!!account.publicKey && !!account.privateKey) {
		next_public_key = account.publicKey;
		next_private_key = account.privateKey;
		console.log("next_public_key", next_public_key);
		let twitterAccount = await getTwitterAccount(next_public_key);
		console.log("twitter", twitterAccount);
		if (!twitterAccount.twitter_handle) {
			console.log("here");
			generateConnectTwitterScreen(container);
			return;
		} else if (!twitterAccount.twitter_verified) {
			// if there's a twitter handle but no confirmation
			console.log("twitter found");
			generatePostConfirmationTweenScreen(
				container,
				twitterAccount.twitter_post_content
			);
			return;
		} else {
			if (!!account.eth_wallet_public_key) {
				await generateProfileScreen(container);
				return;
			} else {
				generateImportWallet(container);
				return;
			}
		}
	} else {
		generateWelcomeScreen(container);
	}
});

// let printButton = document.getElementById("print-btn");
// printButton.addEventListener("click", printIDB);
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
