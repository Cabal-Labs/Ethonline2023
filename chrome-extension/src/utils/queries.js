import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client';


const httpLink = new HttpLink({
    uri: '', 
});

const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});


const FIND_ONE_IDENTITY_WITH_SOURCE_QUERY = gql`
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
`;


function findOneIdentityWithSource(platform, identity) {
    return client.query({
        query: FIND_ONE_IDENTITY_WITH_SOURCE_QUERY,
        variables: {
            platform,
            identity,
        }
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