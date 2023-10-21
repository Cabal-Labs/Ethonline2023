export function createButton(text, onClick, variant, type, container) {
	var button = document.createElement("button");
	//text
	var span = document.createElement("span");
	span.textContent = "Button Text";
	button.appendChild(span);
	// btn props
	button.onclick = onClick;
	button.type = type;
	button.className = "cabal-btn " + variant; // Assign the variant as a class to the button
	container.appendChild(button);
}
export function generateHeader(header) {
	let titleContainer = document.createElement("div");
	let title = document.createElement("h1");
	title.textContent = "Cabal Sorel";
	title.id = "title";
	let subTitle = document.createElement("h2");
	subTitle.textContent = "Better Recommendations for Web3";
	subTitle.id = "subtitle";
	let line = document.createElement("div");
	line.id = "accent-line";
	titleContainer.appendChild(title);
	titleContainer.appendChild(subTitle);
	titleContainer.appendChild(line);
	header.appendChild(titleContainer);
	let nav = document.createElement("nav");
	let submissionLink = document.createElement("a");
	submissionLink.href = "todo";
	submissionLink.textContent = "Submission";
	nav.appendChild(submissionLink);
	let aboutCabalLink = document.createElement("a");
	aboutCabalLink.textContent = "About Cabal Labs";
	aboutCabalLink.href = "https://caballabs.com";
	nav.appendChild(aboutCabalLink);
	header.appendChild(nav);
}
function generateLoggedInScreenOld(container, account) {
	console.log("NAV 2");
	alert("account found", account.address);
	// clear the container
	container.innerHTML = "";
	// Create public key message
	var publicKeyMessage = document.createElement("p");
	publicKeyMessage.textContent = "Logged in as Address: " + account.address;
	container.appendChild(publicKeyMessage);
	// todo: show checklist of tasks a user must complete to finish activating their account
	// todo- brainstorm this
	// Create activate button
	var activateButton = document.createElement("button");
	activateButton.textContent = "Activate";
	activateButton.addEventListener("click", testClick);
	container.appendChild(activateButton);

	//create delete button
	let deleteAccount = document.createElement("button");
	deleteAccount.textContent = "Logout";
	deleteAccount.addEventListener("click", () => {});
	container.appendChild(deleteAccount);
	// testing ethers & infura integration
}
