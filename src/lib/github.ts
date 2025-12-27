export const fetchUserProfile = async (token: string) => {
    const res = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json'
        }
    });
    if (!res.ok) throw new Error('Failed to fetch GitHub profile');
    return res.json();
};

export const fetchUserRepos = async (token: string) => {
    const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100&type=all', {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json'
        }
    });
    if (!res.ok) throw new Error('Failed to fetch repositories');
    return res.json();
};

export const fetchUserActivity = async (username: string, token: string) => {
    // Note: Events API might not need token for public events, but better to use it for rate limits
    const res = await fetch(`https://api.github.com/users/${username}/events?per_page=10`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json'
        }
    });
    if (!res.ok) throw new Error('Failed to fetch user activity');
    return res.json();
};
