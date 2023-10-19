
const GRAPHQL_ENDPOINT = 'https://your-graphql-server.com/graphql';

function findOneIdentityWithSource(platform, identity) {
    return fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Add any other headers if necessary (e.g., authentication)
        },
        body: JSON.stringify({
            query: `
            query FindOneIdentityWithSource($platform: String!, $identity: String!) {
                identity(platform: $platform, identity: $identity) {
                    uuid
                    platform
                    identity
                    displayName
                    createdAt
                    addedAt
                    updatedAt
                    neighbor(depth: 5) {
                        sources
                        identity {
                            uuid
                            platform
                            identity
                            displayName
                        }
                    }
                }
            }
            `,
            variables: {
                platform,
                identity,
            },
        }),
    })
    .then(res => res.json())
    .then(data => data.data)
    .catch(error => {
        console.error("Error fetching data:", error);
        throw error;
    });
}

export {
    findOneIdentityWithSource
};

// Exmaple 
// import { findOneIdentityWithSource } from './queries.js';

// findOneIdentityWithSource('ethereum', '0xc6e2dd45365546bbc865fbf4d74a84f7a1b8ec3d')
//     .then(result => console.log(JSON.stringify(result, null, 2)))
//     .catch(error => console.error('Error:', error));

