// Only allow in-app paths as post-login redirect targets.
export const getRedirectTarget = (state, fallback = '/') => {
    const from = state?.from;
    if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) return fallback;
    if (from.startsWith('/login') || from.startsWith('/register')) return fallback;
    return from;
};
