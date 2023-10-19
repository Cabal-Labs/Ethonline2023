const PAYLOAD_URL = "https://proof-service.next.id/v1/proof/payload";
const PROOF_URL = "https://proof-service.next.id/v1/proof";

async function nextIDCheck(identity) {
	const url = `https://proof-service.next.id/v1/proof?platform=ethereum&identity=${identity}`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}

		const data = await response.json();
		return data.ids;
	} catch (error) {
		console.error(
			"There was a problem with the fetch operation:",
			error.message
		);
		return [];
	}
}

async function createProofPayload(platform, identity, publicKey) {
	try {
		const response = await fetch(PAYLOAD_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				action: "create",
				platform: platform,
				identity: identity,
				public_key: publicKey,
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error(`Error making request to ${PAYLOAD_URL}:`, error);
		throw error;
	}
}

async function createProof(
	proofLocation,
	platform,
	identity,
	publicKey,
	extra = {},
	uuid,
	createdAt
) {
	try {
		const response = await fetch(PROOF_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				action: "create",
				platform: platform,
				identity: identity,
				proof_location: proofLocation,
				public_key: publicKey,
				extra: extra,
				uuid: uuid,
				created_at: createdAt,
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error(`Error making request to ${PROOF_URL}:`, error);
		throw error;
	}
}

export { createProofPayload, createProof, nextIDCheck };
