console.log("service worker registered");
const DB_NAME = "Cabal_Sorel_IDB";
const DB_VERSION = 1;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	const db = initDB();
	console.log(message, sender);
	// Your logic to handle incoming messages
	// Access IndexedDB here
	if (message.command === "setUpAccount") {
		let data = message.data;
		console.log("from sw", data);
		storeValue(db, "account", data.privateKey, {
			publicAddress: data.publicAddress,
			//... more to come
		});
	}
	sendResponse({ result: "Data from IndexedDB" }); // Example response
});

function initDB() {
	const request = self.indexedDB.open(DB_NAME, DB_VERSION);

	request.onerror = function (event) {
		console.error("Failed to open IndexedDB database", event.target.error);
	};
	request.onsuccess = function (event) {
		console.log("Successfully opened IndexedDB database");
		return event.target.result;
	};
	request.onupgradeneeded = function (event) {
		const db = event.target.result;
		// create object stores here
		const objectStore = db.createObjectStore("account", {
			keyPath: "privateKey",
		});
		console.log("IndexedDB database upgraded");
		return db;
	};
}
function storeValue(db, storeName, id, value) {
	const transaction = db.transaction([storeName], "readwrite");
	const objectStore = transaction.objectStore(storeName);
	const request = objectStore.add({ id, value });

	request.onsuccess = function (event) {
		console.log("Successfully stored data in IndexedDB database");
	};
	request.onerror = function (event) {
		console.error(
			"Failed to store data in IndexedDB database",
			event.target.error
		);
	};
}
function getValue(db, storeName, id) {
	const transaction = db.transaction([storeName], "readonly");
	const objectStore = transaction.objectStore(storeName);
	const request = objectStore.get(id);

	request.onsuccess = function (event) {
		console.log(
			"Successfully retrieved data from IndexedDB database:",
			request.result.value
		);
	};
	request.onerror = function (event) {
		console.error(
			"Failed to retrieve data from IndexedDB database",
			event.target.error
		);
	};
}
function deleteValue(storeName, key) {
	const request = indexedDB.open(DB_NAME);
	request.onsuccess = function (event) {
		const db = event.target.result;
		const transaction = db.transaction([storeName], "readwrite");
		const objectStore = transaction.objectStore(storeName);
		objectStore.delete(key);
	};
}

function deleteDB() {
	const request = indexedDB.open(DB_NAME);
	request.onsuccess = function (event) {
		const db = event.target.result;
		const transaction = db.transaction(["account"], "readwrite");
		const objectStore = transaction.objectStore("account");
		objectStore.clear();
	};
}
