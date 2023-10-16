import { privateToPublic, publicToAddress, bufferToHex,ecsign, toRpcSig, keccakFromString,bufferToHex } from 'ethereumjs-util';

async function personalSign(message, privateKey) {
    const messageHash = keccakFromString(`\x19Ethereum Signed Message:\n${message.length}${message}`, 256);
    const signature = ecsign(messageHash, privateKey);
    return Buffer.from(toRpcSig(signature.v, signature.r, signature.s).slice(2), 'hex');
}


async function signMessageEth(aPrivKey, wPrivKey, message) {

    const _message = Buffer.from(message);


    const avatarPrivateKey = Buffer.from(aPrivKey, 'hex');
    const walletPrivateKey = Buffer.from(wPrivKey, 'hex');

    const avatarSignature = await personalSign(_message, avatarPrivateKey);
    const walletSignature = await personalSign(_message, walletPrivateKey);


    return [avatarSignature, walletSignature ]
}

function deriveEthereumAddress(privateKeyHex) {
   
    const privateKey = Buffer.from(privateKeyHex, 'hex');

    const publicKey = privateToPublic(privateKey);

    const addressBuffer = publicToAddress(publicKey);
    
    return bufferToHex(addressBuffer);
}

function generateEthereumKeyPair() {
    const privateKey = randomBytes(32);

    const publicKey = privateToPublic(privateKey);

    return {
        privateKey: bufferToHex(privateKey),
        publicKey: bufferToHex(publicKey)
    };
}

export{
    generateEthereumKeyPair,
    deriveEthereumAddress,
    signMessageEth
}