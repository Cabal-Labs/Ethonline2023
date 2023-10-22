async function loadScript(scriptName) {
	const response = await fetch(chrome.runtime.getURL(scriptName));
	const text = await response.text();
	console.log(`${scriptName} text`, text);
	return text;
}

function injectScript(scriptContent) {
	let script = document.createElement("script");
	script.textContent = scriptContent;
	document.head.appendChild(script);
}

async function inject() {
	// Load and inject the second script
	const postTemplate = await loadScript("postTemplate.js");
	injectScript(postTemplate);
	// Load and inject the first script
	const firstScriptContent = await loadScript("inject.js");
	injectScript(firstScriptContent);
}

inject();
