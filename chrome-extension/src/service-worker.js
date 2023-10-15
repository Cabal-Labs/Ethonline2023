console.log("service worker registered");
const DB_NAME = "Cabal_Sorel_IDB";
const DB_VERSION = 1;
let db;

initDB().then((database) => {
	db = database;
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		// console.log("message", message);
		// console.log("sender", sender);

		if (message.command === "printIDB") {
			getIDB(db, "account").then((data) => {
				sendResponse({ result: data });
			});
		}
		if (message.command === "clearIDB") {
			deleteDB().then((data) => {
				sendResponse({ result: "database cleared" });
			});
		}
		if (message.command === "checkForExistingAccount") {
			getIDB(db, "account").then((data) => {
				console.log("Db data in checkForExistingAccount", data);
				// parse the json string back into an object
				let parsed = JSON.parse(data);
				if (parsed.length > 0) {
					sendResponse({ result: parsed[0] });
				} else {
					sendResponse({ result: "No account found" });
				}
			});
			return true;
		}
		if (message.command === "setUpAccount") {
			let data = message.data;
			storeValue(db, "account", data.privateKey, {
				address: data.address,
				//... more to come
			}).then((data) => {
				sendResponse({ result: "Account Saved" });
			});
		} else {
			sendResponse({ result: "Command not recognized" });
		}
	});
});

function initDB() {
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
			console.log("IndexedDB database upgraded");
		};
	});
}
async function getIDB(db, storeName) {
	//get the entire collection of data stored in "db" in the stored with "storeName"
	// return the result as a json string
	console.log("db", db);
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
