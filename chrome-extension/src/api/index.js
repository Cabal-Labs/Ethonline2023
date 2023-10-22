async function postTwitterArchive(userId, archive) {
    const data = {
        user_id: userId,
        _archive: archive
    };

    try {
        const response = await fetch('http://localhost:8000/twitter-archive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const message = await response.text();
        console.log(message);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

export {
    postTwitterArchive,
}