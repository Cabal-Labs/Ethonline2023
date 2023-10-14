async function AddRecommendationTab() {
	alert("adding button to", document.title);
	// 1 - create a slot next to the following/highlights for our widget button to go
	// 1.1 - Selects the span element with inner HTML equal to "highlights" from the DOM
	// const spans = document.getElementsByTagName("span");
	// console.log(spans);

	// let hightLightButtonText = undefined;
	// spans.array.forEach((el) => {
	// 	if (el.innerHTML === "Highlights") {
	// 		console.log("found it");
	// 		hightLightButtonText = el;
	// 	}
	// });

	// // 1.2 - get the parent of the parent of the span, which is the div we want to target
	// console.log(document, window);
	// let buttonContainer;
	// let elements = document.getElementsByClassName("container");
	// console.log(elements);
	// if (elements.length >= 2) {
	// 	buttonContainer = elements[1];
	// }
	// console.log("container", buttonContainer);

	const customRecommendationButton = createDomElement(`
      <button id="cabal-sorel-button" >  
        <span>Cabal Sorel</span> 
      </button>
    `);
	console.log(customRecommendationButton);

	// Appends the button to the body of the document
	document.body.append(customRecommendationButton);
}

// This function takes a string of HTML, parses it into a DOM object, and returns the first child of the body.
function createDomElement(html) {
	const dom = new DOMParser().parseFromString(html, "text/html");
	return dom.body.firstElementChild;
}
document.addEventListener("DOMContentLoaded", AddRecommendationTab());
document.addEventListener("DOMContentLoaded", function () {
	var button = document.getElementById("cabal-sorel-button");
	console.log("button", button);
	button.addEventListener("click", function () {
		console.log("clicked");
	});
});
