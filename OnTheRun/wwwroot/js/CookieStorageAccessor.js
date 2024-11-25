function getAllCookies() {
    return document.cookie;
}

function getCookie(key) {
    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
        const [k, v] = cookie.split("=");
        acc[k] = v;
        return acc;
    }, {});
    return cookies[key] || null;
}

function setCookie(key, value) {
    document.cookie = `${key}=${value}; path=/`;
}