import { navigate } from '../modules/main.js';

export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role_id");

    console.log("User logged out. Redirecting to login page...");
    navigate("AUTH_LOGIN");
}