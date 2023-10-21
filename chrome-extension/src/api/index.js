// import axios from 'axios';

// const PAYLOAD_URL = 'https://proof-service.next.id/v1/proof/payload';
// const PROOF_URL = 'https://proof-service.next.id/v1/proof';

// async function createProofPayload(platform, identity, publicKey) {
//     try {
//         const response = await axios.post(PAYLOAD_URL, {
//             action: "create",
//             platform: platform,
//             identity: identity,
//             public_key: publicKey
//         });
//         return response.data;
//     } catch (error) {
//         console.error(`Error making request to ${PAYLOAD_URL}:`, error);
//         throw error;
//     }
// }

// async function createProof(platform, identity,proofLocation, publicKey, extra = {}, uuid, createdAt) {
//     try {
//         const response = await axios.post(PROOF_URL, {
//             action: "create",
//             platform: platform,
//             identity: identity,
//             proof_location: proofLocation,
//             public_key: publicKey,
//             extra: extra,
//             uuid: uuid,
//             created_at: createdAt
//         });
//         return response.data;
//     } catch (error) {
//         console.error(`Error making request to ${PROOF_URL}:`, error);
//         throw error;
//     }
// }

// export{
//     createProofPayload,
//     createProof
// };
