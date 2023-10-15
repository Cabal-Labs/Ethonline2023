async function loadScript() {
	const response = await fetch(chrome.runtime.getURL("inject.js"));
	const text = await response.text();
	console.log("inject text", text);
	return text;
}
function inject() {
	// alert(document.title);
	loadScript().then((scriptContent) => {
		let script = document.createElement("script");
		script.textContent = scriptContent;
		document.head.appendChild(script);
	});
}
inject();
