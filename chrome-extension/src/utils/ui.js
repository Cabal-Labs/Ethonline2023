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
