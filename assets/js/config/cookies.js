export function checkAuthToken(redirectTo = "AUTH_LOGIN") {
    const token = localStorage.getItem("token");
    if (!token) {
        console.warn("Token not found. Redirecting to login page...");
        navigate(redirectTo); 
    }
}