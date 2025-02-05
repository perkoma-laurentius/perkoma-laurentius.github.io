import { pageScripts } from "../config/routes.js";
import { loadMenus } from '../config/sidebar.js'; // Mengimpor sidebar.js
import { logout } from '../config/logout.js'; // Mengimpor fungsi logout dari auth.js
import { blockUnauthorizedAccess } from '../config/blockurl.js'; // Mengimpor fungsi blockUnauthorizedAccess dari blockurl.js
import { initializeInactivityDetection } from "../config/inactivityTimer.js";
// Helper: Ambil nama file terakhir tanpa path folder
function getFileNameFromPath(path) {
    return path.split("/").pop();
}
const publicPages = [
    "auth-login.html",
    "auth-register.html",
    "auth-forgot-password.html",
    "auth-two-steps.html",
    "auth-two-steps.html",
    "auth-register-ppdb.html",
     "404.html"
];

function checkAuthToken() {
    const token = localStorage.getItem("token");
    const currentPage = getFileNameFromPath(window.location.pathname);

    if (publicPages.includes(currentPage)) {
        return true;
    }

    if (!token) {
        console.warn("No token found. Redirecting to login...");
        navigate("AUTH_LOGIN");
        return false;
    }
    return true;
}

document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname; // Ambil path absolut
    const currentPage = getFileNameFromPath(currentPath); // Nama file terakhir
    // const isValidPage = Object.values(pageScripts).some((route) => 
    //     currentPath.endsWith(route.fileName) || currentPage === route.fileName
    // );
    // if (!isValidPage) {
    //     console.warn(`Page not found: ${currentPage}. Redirecting to 404.html...`);
    //     window.location.href = "/404.html";
    //     return;
    // }
    // Cek token sebelum melanjutkan
    // initializeInactivityDetection();

    if (!checkAuthToken()) {
        return; // Hentikan eksekusi jika tidak ada token
    }

    if (!blockUnauthorizedAccess()) {
        return; // Hentikan eksekusi jika akses diblokir
    }
    const role_id = localStorage.getItem("role_id");
    loadMenus(role_id);
    const logo = document.querySelector(".app-brand-text");
    const brandLogo = document.querySelector(".app-brand-logo.demo");
    function handleNavigation(event) {
        event.preventDefault(); // Mencegah perilaku default (jika ada)

        if (role_id === "2") {
            navigate("DASHBOARDGURU"); // Guru
        } else if (role_id === "998") {
            navigate("DASHBOARDADMIN"); // Admin
        } else if (role_id === "777") {
            navigate("DASHBOARD_PPDB"); // PPDB
        }
        
        else {
            navigate("DASHBOARD"); // Default dashboard
        }
    }

    // Tambahkan event listener ke brandLogo
    if (brandLogo) {
        brandLogo.addEventListener("click", handleNavigation);
    }

    // Tambahkan event listener ke logo
    if (logo) {
        logo.addEventListener("click", handleNavigation);
    }

    const userNameElement = document.querySelector(".flex-grow-1 h6");
    const userRoleElement = document.querySelector(".flex-grow-1 small");
    const userName = localStorage.getItem("email") || "Unknown User";
    const userRole = localStorage.getItem("login_as") || "Unknown Role";

    if (userNameElement) userNameElement.textContent = userName;
    if (userRoleElement) userRoleElement.textContent = userRole;
    // Cari route berdasarkan fileName
    const currentRoute = Object.values(pageScripts).find((route) =>
        currentPath.endsWith(route.fileName) || currentPage === route.fileName
    );
    
    if (currentRoute) {
        // Handle path base untuk memastikan script relative dapat dimuat dengan benar
        const scriptPath = new URL(currentRoute.script, window.location.origin).href;

        import(scriptPath)
            .then((module) => {
                console.log(`Loaded ${scriptPath} successfully.`);
                if (module.init) {
                    module.init(); // Panggil fungsi init jika ada
                }
            })
            .catch((err) => {
                console.error(`Error loading ${scriptPath}:`, err);
            });
    } else {
        // Jika halaman tidak ditemukan, arahkan ke 404.html
        console.warn("Page not found. Redirecting to 404.html...");
        // window.location.href = "pages-section/404.html";
    }
    const logoutButton = document.getElementById("logout-btn");
    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    } else {
        console.warn("Logout button not found on this page.");
    }
    
});


/**
 * Fungsi untuk berpindah halaman
 * @param {string} routeKey - Key dari pageScripts (misalnya AUTH_LOGIN, DASHBOARD, dll.)
 * @param {object} [queryParams] - Query string (opsional)
 */
export function navigate(routeKey, queryParams = {}) {
    const route = pageScripts[routeKey];
    if (!route) {
        window.location.href = "pages-section/404.html";
        console.error(`Route not found: ${routeKey}`);
        return;
    }

    // Generate query string jika ada
    const queryString = Object.keys(queryParams)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
        .join('&');

    // Navigasi ke halaman dengan query string jika ada
    const url = queryString ? `${route.fileName}?${queryString}` : route.fileName;

    // Handle navigasi menggunakan base path jika perlu
    const fullUrl = new URL(url, window.location.origin).href;
    window.location.href = fullUrl;
}



