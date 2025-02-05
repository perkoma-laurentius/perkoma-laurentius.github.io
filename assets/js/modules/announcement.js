import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';

export async function loadAnnouncements() {
    try {
        // Ambil token dari localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token not found');
            return;
        }

        // Panggil API untuk mendapatkan data pengumuman
        const response = await NetworkHelper.get(ENDPOINTS.SCHOOL_ANNOUNCEMENTS.GET_ALL, {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        });

        if (response && response.message === 'Announcements retrieved successfully' && response.items) {
            const announcements = response.items;

            // Seleksi elemen tbody untuk pengumuman
            const announcementTableBody = document.querySelector('.table-border-bottom-0');
            announcementTableBody.innerHTML = ''; // Kosongkan tabel sebelum diisi ulang

            // Iterasi data pengumuman dan buat elemen HTML baru
            announcements.forEach((announcement) => {
                const { title, description, category, start_date, end_date } = announcement;
                const badgeClass = getCategoryBadgeClass(category);
                const iconClass = getCategoryIconClass(category); // Menyesuaikan ikon

                const rowHTML = `
                    <tr>
                        <td class="w-75 ps-0">
                            <div class="d-flex justify-content-start align-items-center">
                                <div class="me-3">
                                    <i class="${iconClass} ti-lg"></i> <!-- Ikon menyesuaikan -->
                                </div>
                                <div>
                                    <h6 class="mb-0 fw-medium">${title}</h6>
                                    <small class="text-muted">${description} (${formatDateRange(start_date, end_date)})</small>
                                </div>
                            </div>
                        </td>
                        <td class="text-end pe-0 text-nowrap">
                            <span class="badge ${badgeClass}">${category}</span> <!-- Badge menyesuaikan -->
                        </td>
                    </tr>
                `;
                // Tambahkan row baru ke tabel
                announcementTableBody.insertAdjacentHTML('beforeend', rowHTML);
            });
        } else {
            console.error('Failed to fetch announcements');
        }
    } catch (error) {
        console.error('Error fetching announcements:', error);
    }
}

// Fungsi untuk menentukan kelas CSS badge berdasarkan kategori
function getCategoryBadgeClass(category) {
    switch (category) {
        case 'Penting':
            return 'bg-label-warning';
        case 'Informasi':
            return 'bg-label-info';
        case 'Umum':
            return 'bg-label-primary';
        case 'Urgent':
            return 'bg-label-danger';
        default:
            return 'bg-label-secondary';
    }
}

// Fungsi untuk menentukan kelas ikon berdasarkan kategori
function getCategoryIconClass(category) {
    switch (category) {
        case 'Penting':
            return 'ti ti-bell text-warning'; // Ikon untuk 'Penting'
        case 'Informasi':
            return 'ti ti-calendar-event text-info'; // Ikon untuk 'Informasi'
        case 'Umum':
            return 'ti ti-id-badge text-primary'; // Ikon untuk 'Umum'
        case 'Urgent':
            return 'ti ti-alert-triangle text-danger'; // Ikon untuk 'Urgent'
        default:
            return 'ti ti-notification text-secondary'; // Ikon default
    }
}

// Fungsi untuk memformat rentang tanggal
function formatDateRange(startDate, endDate) {
    if (startDate && endDate) {
        return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
    }
    return '';
}

// Panggil fungsi loadAnnouncements saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    loadAnnouncements();
});
