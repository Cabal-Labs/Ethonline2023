import { findOneIdentityWithSource } from './queries.js';
import { generateEthereumKeyPair } from './eth.js'

async function nextIDCheck(identity) {
    const url = `https://proof-service.next.id/v1/proof?platform=ethereum&identity=${identity}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.ids;
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error.message);
        return [];
    }
}

async function setUpNextID(){
    const avatar = generateKeyPair();

}

// Example usage
// (async () => {
//     const someIdentity = ""; // Replace with actual identity value
//     const ids = await hasNextID(someIdentity);
//     console.log(ids);
// })();
