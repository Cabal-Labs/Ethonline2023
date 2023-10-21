console.log("service worker registered");
const DB_NAME = "Cabal_Sorel_IDB";
const DB_VERSION = 1;
let db;

initDB().then((database) => {
	db = database;
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		// console.log("message", message);
		// console.log("sender", sender);
		console.log("responding to message command " + message.command);
		if (message.command === "printIDB") {
			getIDB(db, "account").then((data) => {
				sendResponse({ result: data });
			});
			return true;
		}
		if (message.command === "clearIDB") {
			deleteDB().then((data) => {
				sendResponse({ result: "database cleared" });
			});
			return true;
		}
		if (message.command === "checkForExistingAccount") {
			getIDB(db, "account").then((data) => {
				console.log("Db data in checkForExistingAccount", data);
				// parse the json string back into an object
				let parsed = JSON.parse(data);
				if (parsed.length > 0) {
					sendResponse({ ok: true, result: parsed[0] });
				} else {
					sendResponse({ ok: false, result: "No account found" });
				}
			});
			return true;
		}
		if (message.command === "setUpAccount") {
			let data = message.data;
			storeValue(db, "account", data.privateKey, {
				walletAddress: data.walletAddress,
				walletPrivateKey: data.walletPrivateKey,
				//... more to come
			}).then((data) => {
				sendResponse({ result: "Account Saved" });
			});
			return true;
		}

		if (message.command === "setUpNextAccount") {
			console.log("HERE");
			let data = message.data;
			storeValue(db, "account", data.privateKey, {
				publicKey: data.publicKey,
			})
				.then((data) => {
					console.log(data);
					if (data) {
						sendResponse({ ok: true, data });
					} else {
						sendResponse({ ok: false });
					}
				})
				.catch((error) => {
					console.log("Error:", error);
					sendResponse({ ok: false });
				});
			return true;
		}
		if (message.command === "getNextAccount") {
			getIDB(db, "account")
				.then((data) => {
					console.log("getNextAccountData: ", data);
					let parsed = JSON.parse(data);
					let account = parsed[0];
					if (account) {
						let result = {
							privateKey: account.privateKey,
							publicKey: account.publicKey,
						};
						console.log("sending the response", result);
						sendResponse({
							ok: true,
							data: result,
						});
					} else {
						console.log("No account found");
						sendResponse({ ok: false });
					}
					return true;
				})
				.catch((error) => {
					console.log("Error:", error);
					sendResponse({ ok: false });
					return true;
				});
		}
		if (message.command === "saveTwitterHandle") {
			let data = message.data;
			storeValue(db, "account", data.privateKey, {
				twitterHandle: data.twitterHandle,
			}).then((data) => {
				sendResponse({ result: "Twitter Handle Saved" });
			});
			return true;
		}

		if (message.command === "getTwitterHandle") {
			getIDB(db, "account").then((data) => {
				console.log(data);
				if (data) {
					sendResponse({ ok: true, twitterHandle: data.twitterHandle });
				} else {
					sendResponse({ ok: false });
				}
			});
			return true;
		}
		if (message.command === "saveTwitterConfirmationProof") {
			let data = message.data;
			storeValue(db, "next_account", data.privateKey, {
				twitterConfirmationProof: data.twitterConfirmationProof,
			}).then((data) => {
				sendResponse({ result: "Twitter Confirmation Proof Saved" });
			});
			return true;
		}

		if (message.command === "getTwitterConfirmationProof") {
			getIDB(db, "next_account").then((data) => {
				console.log(data);
				if (data) {
					sendResponse({
						ok: true,
						twitterConfirmationProof: data.twitterConfirmationProof,
					});
				} else {
					sendResponse({ ok: false });
				}
			});
			return true;
		} else {
			sendResponse({
				result: "Command not recognized",
				command: message.command,
			});
			return true;
		}
	});
});

async function initDB() {
	return new Promise((resolve, reject) => {
		const request = self.indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = function (event) {
			console.error("Failed init of IndexedDB database", event.target.error);
			reject(event.target.error);
		};
		request.onsuccess = function (event) {
			console.log("Successful init of IndexedDB database");
			resolve(event.target.result);
		};
		request.onupgradeneeded = function (event) {
			const db = event.target.result;
			// create object stores here
			const objectStore = db.createObjectStore("account", {
				keyPath: "privateKey",
			});
			const objectStore2 = db.createObjectStore("next_account", {
				keyPath: "privateKey",
			});
		};
	});
}
async function getIDB(db, storeName) {
	//get the entire collection of data stored in "db" in the stored with "storeName"
	// return the result as a json string
	try {
		const transaction = db.transaction([storeName], "readonly");
		const objectStore = transaction.objectStore(storeName);
		const request = objectStore.getAll();
		return new Promise((resolve, reject) => {
			request.onsuccess = function (event) {
				console.log(
					"Successfully retrieved all data from IndexedDB database:",
					request.result
				);
				resolve(JSON.stringify(request.result));
			};
			request.onerror = function (event) {
				console.error(
					"Failed to retrieve all data from IndexedDB database",
					event.target.error
				);
				reject(event.target.error);
			};
		});
	} catch (err) {
		return "idb store name does not exist";
	}
}
function storeValue(db, storeName, privateKey, value) {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([storeName], "readwrite");
		const objectStore = transaction.objectStore(storeName);
		const request = objectStore.add({ privateKey, ...value });

		request.onsuccess = function (event) {
			console.log("Successfully stored data in IndexedDB database");
			resolve(request.result);
		};
		request.onerror = function (event) {
			console.error(
				"Failed to store data in IndexedDB database",
				event.target.error
			);
			reject(event.target.error);
		};
	});
}
function getValue(db, storeName, id) {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([storeName], "readonly");
		const objectStore = transaction.objectStore(storeName);
		const request = objectStore.get(id);

		request.onsuccess = function (event) {
			console.log(
				"Successfully retrieved data from IndexedDB database:",
				request.result.value
			);
			resolve(request.result.value);
		};
		request.onerror = function (event) {
			console.error(
				"Failed to retrieve data from IndexedDB database",
				event.target.error
			);
			reject(event.target.error);
		};
	});
}
function deleteValue(storeName, key) {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME);
		request.onsuccess = function (event) {
			const db = event.target.result;
			const transaction = db.transaction([storeName], "readwrite");
			const objectStore = transaction.objectStore(storeName);
			objectStore.delete(key);
			resolve();
		};
		request.onerror = function (event) {
			console.error(
				"Failed to delete data from IndexedDB database",
				event.target.error
			);
			reject(event.target.error);
		};
	});
}

function deleteDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME);
		request.onsuccess = function (event) {
			const db = event.target.result;
			const transaction = db.transaction(["account"], "readwrite");
			const objectStore = transaction.objectStore("account");
			objectStore.clear();
			resolve();
		};
		request.onerror = function (event) {
			console.error("Failed to clear IndexedDB database", event.target.error);
			reject(event.target.error);
		};
	});
}
