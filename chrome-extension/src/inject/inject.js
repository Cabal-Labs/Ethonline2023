const samplePosts = [
	{
		profileImage: "https://imgurl.com/id1",
		displayName: "test name 1",
		username: "xx_test_name_1",
		text_content: "this is the body of the first post",
		comments: 5,
		reshares: 3,
		likes: 10,
		saves: 2,
	},
	{
		profileImage: "https://imgurl.com/id2",
		displayName: "test name 2",
		username: "xx_test_name_2",
		text_content: "this is the body of the second post",
		comments: 10,
		reshares: 5,
		likes: 20,
		saves: 5,
	},
	{
		profileImage: "https://imgurl.com/id3",
		displayName: "test name 3",
		username: "xx_test_name_3",
		text_content: "this is the body of the third post",
		comments: 15,
		reshares: 7,
		likes: 30,
		saves: 8,
	},
];
function createVideoElement(url, poster, src, imgSrc) {
	// Create the video element
	let video = document.createElement("video");

	// Set the video element's attributes
	video.setAttribute("src", src);
	video.setAttribute("poster", poster);
	video.setAttribute("width", "100%");
	video.setAttribute("height", "100%");
	video.setAttribute("controls", "");

	// Create the source element
	let source = document.createElement("source");

	// Set the source element's attributes
	source.setAttribute("src", url);
	source.setAttribute("type", "video/mp4");

	// Append the source element to the video element
	video.appendChild(source);

	// Return the video element
	return video;
}

function addVideo(container, url, poster, src, imgSrc) {
	// Create the video element
	let video = createVideoElement(url, poster, src, imgSrc);

	// Append the video element to the container
	container.appendChild(video);
}
function addShowMore(container) {
	let showMore = document.createElement("div");
	showMore.innerHTML = /*html*/ `
		<div class="lt-text-gray-500 mt-4 flex items-center space-x-1 text-sm font-bold">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				aria-hidden="true"
				class="h-4 w-4">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"></path>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
			</svg>
			<a href="/posts/0x01c807-0x30">Show more</a>
		</div>
	`;

	container.appendChild(showMore);
}

async function getRecommendedPosts() {
	let endpoint = "http://127.0.0.1:500/recomment";
	try {
		let response = await fetch(endpoint);
		let data = await response.json();
		return data;
	} catch (error) {
		console.error("Error:", error);
	}
}
function injectScript(code) {
	let script = document.createElement("script");
	script.textContent = code;
	(document.head || document.documentElement).appendChild(script);
	script.remove();
}

async function injectRecommendedPosts(container) {
	console.log(postTemplate);
	let pfpXPath = "/div[1]/span/div/a/span/span/div/img";
	let displayNameXPath = "/div[1]/span/div/a/span/span/div/div/div[1]/div/div";
	let usernameXPath = "/div[1]/span/div/a/span/span/div/div/div[2]/span[1]";
	let dateXPath = "/div[1]/span/div/a/span/span/div/div/div[2]/span[2]/span[2]";
	let textXPath = "/div[2]/div[1]/div[1]/p";
	// let videoXPath = "/div[2]/div[1]/div[2]/div/div/div/div/video";
	// let imgXPath = "/div[2]/div[1]/div[3]/div/img";
	let commentsXPath = "/div[2]/div[2]/span/div[1]/span";
	let resharesXPath = "/div[2]/div[2]/span/div[2]/span";
	let likeXPath = "/div[2]/div[2]/span/div[3]/span";
	let savesXPath = "/div[2]/div[2]/span/div[4]/span";

	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
	let posts = samplePosts;
	console.log(posts);
	posts.forEach((post) => {
		let newPost = postTemplate.cloneNode(true);
		console.log("new post", newPost);
		let pfpElement = document.evaluate(
			pfpXPath,
			newPost,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		).singleNodeValue;
		console.log("img", pfpElement);
		let displayNameElement = document.evaluate(
			displayNameXPath,
			newPost,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		).singleNodeValue;
		let usernameElement = document.evaluate(
			usernameXPath,
			newPost,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		).singleNodeValue;
		let dateElement = document.evaluate(
			dateXPath,
			newPost,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		).singleNodeValue;
		let textContentElement = document.evaluate(
			textXPath,
			newPost,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		).singleNodeValue;
		// Handle comments, shares, likes, and saves
		let commentsElement = document.evaluate(
			commentsXPath,
			newPost,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		).singleNodeValue;
		let resharesElement = document.evaluate(
			resharesXPath,
			newPost,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		).singleNodeValue;
		let likeElement = document.evaluate(
			likeXPath,
			newPost,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		).singleNodeValue;
		let savedElement = document.evaluate(
			savesXPath,
			newPost,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		).singleNodeValue;
		// Remove existing video or image elements
		// let videoElement = document.evaluate(
		// 	videoXPath,
		// 	newPost,
		// 	null,
		// 	XPathResult.FIRST_ORDERED_NODE_TYPE,
		// 	null
		// ).singleNodeValue;
		// let imageElement = document.evaluate(
		// 	imgXPath,
		// 	newPost,
		// 	null,
		// 	XPathResult.FIRST_ORDERED_NODE_TYPE,
		// 	null
		// ).singleNodeValue;

		// if (videoElement) videoElement.parentNode.removeChild(videoElement);
		// if (imageElement) imageElement.parentNode.removeChild(imageElement);

		// broken code - working on embedding videos
		// if (true) {
		// 	let src = "blob:https://hey.xyz/8a3f5b81-b4e9-4ee3-b65a-98432179c323";
		// 	let imgSrc =
		// 		"https://ik.imagekit.io/lens/media-snapshot/4a6a401ec6bc8340ad20281bb92a1e36350523171b4e6f7b34cb238f6abe8e52.png";
		// 	let poster =
		// 		"https://ik.imagekit.io/lens/media-snapshot/4a6a401ec6bc8340ad20281bb92a1e36350523171b4e6f7b34cb238f6abe8e52.png";
		// 	let url =
		// 		"https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/02a36bfsjo3fim2r/index.m3u8";
		// 	addVideo(newPost, url, poster, src, imgSrc);
		// }
		// Assign values to the elements

		if (pfpElement) pfpElement.src = post.profileImage;
		if (displayNameElement) displayNameElement.textContent = post.displayName;
		if (usernameElement) usernameElement.textContent = post.username;
		if (dateElement) dateElement.textContent = new Date().toLocaleString();
		if (textContentElement) textContentElement.textContent = post.text_content;
		if (commentsElement) {
			commentsElement.textContent = post.comments;
			commentsElement.addEventListener("click", () =>
				alert("need to handle comment button")
			);
		}
		if (resharesElement) {
			resharesElement.textContent = post.reshares;
			resharesElement.addEventListener("click", () =>
				alert("need to handle reshare button")
			);
		}
		if (likeElement) {
			likeElement.textContent = post.likes;
			likeElement.addEventListener("click", () =>
				alert("need to handle like button")
			);
		}
		if (savedElement) {
			savedElement.textContent = post.saves;
			savedElement.addEventListener("click", () =>
				alert("need to handle save button")
			);
		}
		if (container) container.appendChild(newPost);
	});
}
async function getTargetElement() {
	let targetElement = null;
	while (!targetElement) {
		targetElement = document.querySelector('[aria-label="Highlights"]');
		if (!targetElement) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}
	return targetElement.parentElement;
}

async function addRecommendationTabButton() {
	const buttonContainer = await getTargetElement();
	console.log("button container", buttonContainer);

	// Create the custom recommendation button
	const customRecommendationButton = createDomElement(`
        <button id="cabal-sorel-button">  
            <span>Recommendations ++</span> 
        </button>
    `);

	// If the button container exists, append the custom button to it
	if (!!buttonContainer) {
		buttonContainer.append(customRecommendationButton);
	} else {
		// If the button container doesn't exist, append the custom button to the body as a fallback
		document.body.append(customRecommendationButton);
	}
	let button = document.getElementById("cabal-sorel-button");
	button.addEventListener("click", async () => {
		const feedContainer = document.querySelector("div > article").parentElement;
		// the feed container is the only div on the page where it's immediate children are article tags.

		console.log("feed container", feedContainer);
		await injectRecommendedPosts(feedContainer);
	});
}

// This function takes a string of HTML, parses it into a DOM object, and returns the first child of the body.
function createDomElement(html) {
	const dom = new DOMParser().parseFromString(html, "text/html");
	return dom.body.firstElementChild;
}
function customLikeEventListener() {
	// This function will be called when a 'like' button is clicked
	alert("Like button clicked!");
}
function addEventListenersToLikeButtons() {
	console.log("adding like event listeners - not done");
	// This function will loop through the document and add a custom event listener to all elements with an aria-label of "like";
	// const likeButtons = document.querySelectorAll('[aria-label="Like"]');
	// console.log("LIKE BUTTONS", likeButtons);
	// if (likeButtons.length > 0) {
	// 	likeButtons.forEach((button) => {
	// 		button.addEventListener("click", customLikeEventListener);
	// 	});
	// 	alert("finished");
	// } else {
	// 	console.log("No like buttons found");
	// }
}
console.log("Inject script running ", document.readyState);
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", async () => {
		addRecommendationTabButton();
		addEventListenersToLikeButtons();
		await getRecommendedPosts();
	});
} else {
	addRecommendationTabButton();
	addEventListenersToLikeButtons();
	await getRecommendedPosts();
}
