import { navigate } from "../modules/main.js"; // Import fungsi navigate dari main.js
import { showToast } from "../config/toast.js"; // Import fungsi untuk notifikasi

/**
 * Fungsi untuk memblokir akses berdasarkan role_id dan path
 */
/**
 * Fungsi untuk memblokir akses berdasarkan role_id dan path
 */
export function blockUnauthorizedAccess() {
    const role_id = localStorage.getItem("role_id"); // Ambil role_id dari localStorage
    const currentPath = window.location.pathname; // Ambil path absolut
    const restrictedPaths = {
        2: "/pages-section/admin", // Role ID 2 (Guru) tidak boleh akses path admin
        1: "/pages-section/guru" // Role ID 1 (Admin) tidak boleh akses path guru
    };

    // Cek apakah role_id ada dan path saat ini masuk dalam restrictedPaths
    if (role_id && restrictedPaths[role_id]) {
        const restrictedPath = restrictedPaths[role_id];
        if (currentPath.startsWith(restrictedPath)) {
            console.warn(`Access blocked for role_id ${role_id} on restricted path: ${restrictedPath}`);

            // Tampilkan notifikasi kepada pengguna
            showToast("Anda tidak memiliki izin untuk mengakses halaman ini.", "danger");

            // Redirect pengguna ke halaman yang sesuai dengan role mereka
            const redirectPage = role_id === "2" ? "DASHBOARDGURU" : "DASHBOARDADMIN";
            navigate(redirectPage);

            return false; // Hentikan eksekusi lebih lanjut
        }
    }

    return true; // Akses diperbolehkan
}