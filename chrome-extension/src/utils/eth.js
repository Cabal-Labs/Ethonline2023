const API_URL = '';


async function generateKeyPair() {
    try {
        const response = await fetch(`${API_URL}/generate-key-pair`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error generating key pair:', error);
    }
}


async function doubleSignMessage(aPrivKey, wPrivKey, message) {
    try {
        const response = await fetch(`${API_URL}/double-sign-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                aPrivKey: aPrivKey,
                wPrivKey: wPrivKey,
                message: message,
            }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error double signing message:', error);
    }
}

async function signMessage(aPrivKey, message) {
    try {
        const response = await fetch(`${API_URL}/sign-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                aPrivKey: aPrivKey,
                message: message,
            }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error signing message:', error);
    }
}

export {
    generateKeyPair,
    doubleSignMessage,
    signMessage
}

// // Example Usage
// (async function() {
//     const keyPair = await generateKeyPair();
//     console.log(keyPair);

//     const doubleSignature = await doubleSignMessage('YOUR_APRIVATEKEY', 'YOUR_WPRIVATEKEY', 'Your Message');
//     console.log(doubleSignature);

//     const signature = await signMessage('YOUR_APRIVATEKEY', 'Your Message');
//     console.log(signature);
// })();
