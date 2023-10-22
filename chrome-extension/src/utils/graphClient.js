
import { Client, createRequest } from 'urql/core';
import { FIND_ONE_IDENTITY_WITH_SOURCE_QUERY, FIND_ONE_POST } from './queries';

const clientNext = new Client({
    url: 'https://relation-service.next.id' 
});

const clientLens = new Client({
    url: 'https://api.lens.dev' 
});



function findOneIdentityWithSource(platform, identity) {
    const request = createRequest(FIND_ONE_IDENTITY_WITH_SOURCE_QUERY, {
        platform,
        identity,
    });

    return clientNext.query(request).toPromise();
}

function findOnePost(publicationId) {
    const request = createRequest(FIND_ONE_POST, {
        publicationId
    });

    return clientNext.query(request).toPromise();
}

export {

    findOneIdentityWithSource,
    findOnePost
}

