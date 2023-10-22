async function addPostTemplate() {
	console.log("adding post template");
	let postTemplateUrl = "https://hey.xyz/posts/0x018cf4-0x01";
	let postXPath = `//*[@id="__next"]/div[2]/div[2]/div/div[1]/div[1]/article`;
	// Now you can access window.postTemplate in your content script
	try {
		let response = await fetch(postTemplateUrl);
		// console.log("response", response);
		let html = await response.text();
		let parser = new DOMParser();
		let doc = parser.parseFromString(html, "text/html");
		let body = doc.querySelector("body");
		console.log("doc", doc);
		console.log("body", body);
		let postElement = doc.evaluate(
			postXPath,
			body,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		).singleNodeValue;
		let postTemplate = postElement ? postElement.innerHTML : "not found";

		console.log("postTemplate", postTemplate);
		return postTemplate;
	} catch (error) {
		console.error("Error:", error);
	}
}

console.log("post template Inject script running ", document.readyState);
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		addPostTemplate();
	});
} else {
	addPostTemplate();
}
