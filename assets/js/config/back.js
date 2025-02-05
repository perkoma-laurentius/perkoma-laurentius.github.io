import { pageScripts } from '../config/routes.js';

/**
 * Fungsi untuk tombol Back
 * Navigasi kembali ke DASHBOARD_PPDB
 */
export function navigateToDashboard() {
    const backButton = document.querySelector('.btn-back'); // Selector untuk tombol back

    if (!backButton) {
        console.error('Tombol Back tidak ditemukan di halaman.');
        return;
    }

    backButton.addEventListener('click', () => {
        const dashboardConfig = pageScripts.DASHBOARD_PPDB; // Ambil konfigurasi DASHBOARD_PPDB

        if (dashboardConfig && dashboardConfig.fileName) {
            window.location.href = `/${dashboardConfig.fileName}`; // Navigasi ke fileName yang sesuai
        } else {
            console.error('Konfigurasi DASHBOARD_PPDB tidak ditemukan.');
            showToast('Navigasi gagal. Konfigurasi tidak ditemukan.', 'danger');
        }
    });
}
