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
			storeValue(db, "account", data.nextPublicKey, {
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
			console.log("setup account in sw", data);
			storeValue(db, "account", data.publicKey, {
				privateKey: data.privateKey,
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
			let data = message.data;
			console.log("get next account data", data);
			getValue(db, "account", data.publicKey).then((data) => {
				console.log("data in sw", data);
				sendResponse({ ok: true, data });
			});
			return true;
		}
		if (message.command === "saveTwitterHandle") {
			let data = message.data;
			updateRecord(db, "account", data.publicKey, {
				twitter_handle: data.twitter_handle,
				twitter_uuid: data.twitter_uuid,
				twitter_createdAt: data.twitter_createdAt,
				twitter_post_content: data.twitter_post_content,
				privateKey: data.privateKey,
			}).then((data) => {
				sendResponse({ ok: true, result: "Twitter Handle Saved" });
			});
			return true;
		}

		if (message.command === "getTwitterAccount") {
			let data = message.data;
			getValue(db, "account", data.next_public_key).then((data) => {
				console.log("get twitter handle in sw", data);
				if (!!data) {
					sendResponse({ ok: true, data });
				} else {
					console.log("no twitter handle");
					sendResponse({ ok: false });
				}
			});
			// getIDB(db, "account").then((data) => {
			// 	console.log(data);
			// 	if (data) {
			// 		sendResponse({ ok: true, twitterHandle: data.twitterHandle });
			// 	} else {
			// 		sendResponse({ ok: false });
			// 	}
			// });
			return true;
		}
		if (message.command === "saveTwitterConfirmationProof") {
			let data = message.data;
			updateRecord(db, "account", data.nextPublicKey, {
				twitter_confirmation_proof: data.twitterConfirmationProof,
				twitter_verified: data.twitter_verified,
			}).then((data) => {
				sendResponse({ result: "Twitter Confirmation Proof Saved" });
			});
			return true;
		}

		if (message.command === "getTwitterConfirmationProof") {
			let data = message.data;
			getValue(db, "account", data.next_public_key).then((data) => {
				console.log("getTwitterConfirmationProof in sw", data);
				if (data.twitterConfirmationProof) {
					sendResponse({
						ok: true,
						twitter_verified: data.twitterVerified,
						twitter_confirmation_proof: data.twitterConfirmationProof,
					});
				} else {
					sendResponse({
						ok: false,
						message: data.twitter_post_content,
					});
				}
			});
			// getIDB(db, "account").then((data) => {
			// 	console.log(data);
			// 	if (data) {
			// 		sendResponse({
			// 			ok: true,
			// 			twitterConfirmationProof: data.twitterConfirmationProof,
			// 		});
			// 	} else {
			// 		sendResponse({ ok: false });
			// 	}
			// });
			return true;
		} else if (message.command === "saveEthAddress") {
			let data = message.data;
			console.log("4.5 - in sw", data);
			updateRecord(db, "account", data.nextPublicKey, {
				...data,
			}).then((data) => {
				console.log("4.6 - in sw", data);
				if (!!data) {
					sendResponse({ ok: true, result: "Eth Address Saved" });
				} else {
					sendResponse({ ok: false, result: "Eth Address Not Saved" });
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
				keyPath: "publicKey",
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
function storeValue(db, storeName, publicKey, value) {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([storeName], "readwrite");
		const objectStore = transaction.objectStore(storeName);
		const request = objectStore.add({ publicKey, ...value });

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
			if (request.result) {
				console.log(
					"Successfully retrieved data from IndexedDB database:",
					request.result
				);
				resolve(request.result);
			} else {
				console.log(
					"No data found in IndexedDB database for the provided key:",
					id
				);
				resolve(undefined);
			}
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
function updateRecord(db, storeName, key, value) {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([storeName], "readwrite");
		const objectStore = transaction.objectStore(storeName);
		objectStore.get(key).onsuccess = function (event) {
			let data = event.target.result;
			let updatedData = { ...data, ...value };
			const request = objectStore.put(updatedData);

			request.onsuccess = function (event) {
				console.log("Successfully updated data in IndexedDB database");
				resolve(request.result);
			};
			request.onerror = function (event) {
				console.error(
					"Failed to update data in IndexedDB database",
					event.target.error
				);
				reject(event.target.error);
			};
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
