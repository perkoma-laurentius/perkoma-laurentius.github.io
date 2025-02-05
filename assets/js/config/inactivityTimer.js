import { logout } from "./logout.js";

let inactivityTimeout;
// const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 menit dalam milidetik
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 menit dalam milidetik

// Fungsi untuk logout otomatis
function autoLogout() {
    logout();
    console.log("User has been logged out due to inactivity.");
    navigate("AUTH_LOGIN");  // Arahkan ke halaman login
}

// Fungsi untuk reset timer setiap kali ada aktivitas pengguna
function resetInactivityTimer() {
    console.log("User activity detected. Resetting timer...");
    
    // Hapus timer sebelumnya
    clearTimeout(inactivityTimeout);

    // Setel timer baru
    inactivityTimeout = setTimeout(() => {
        console.log("Inactivity timeout reached. Logging out...");
        autoLogout();  // Logout setelah batas waktu inaktivitas tercapai
    }, INACTIVITY_TIMEOUT);
}

// Menambahkan event listener untuk mendeteksi aktivitas pengguna
function addActivityListeners() {
    // Deteksi aktivitas pengguna
    document.addEventListener('mousemove', resetInactivityTimer);
    document.addEventListener('keydown', resetInactivityTimer);
    document.addEventListener('click', resetInactivityTimer);
    console.log("Activity listeners added.");
}

// Menonaktifkan pendeteksi aktivitas jika sudah tidak diperlukan
function removeActivityListeners() {
    document.removeEventListener('mousemove', resetInactivityTimer);
    document.removeEventListener('keydown', resetInactivityTimer);
    document.removeEventListener('click', resetInactivityTimer);
    console.log("Activity listeners removed.");
}

// Inisialisasi pendeteksi aktivitas saat DOMContentLoaded
export function initializeInactivityDetection() {
    console.log("Initializing inactivity detection...");
    
    // Menambahkan event listeners untuk mendeteksi aktivitas pengguna
    addActivityListeners();

    // Setel timer pertama kali saat halaman dimuat
    resetInactivityTimer();
}
