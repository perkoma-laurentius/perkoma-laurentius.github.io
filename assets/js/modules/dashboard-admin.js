import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { loadAnnouncements } from './announcement.js';

export function init() {
    console.log("Dashboard Initialized");
    fetchMetrics();
    // loadAnnouncements();
    // loadTeachers();  // Memuat data guru
    // loadStudents();  // Memuat data siswa
    loadBintangTop15();  // Memuat data siswa

    // Cek token sebelum melanjutkan
    const welcomeText = document.getElementById("welcomeText");
    if (welcomeText) {
        welcomeText.textContent = "Selamat Datang di Dashboard!";
    }

    // Tambahkan logika lain untuk dashboard jika diperlukan
    console.log("Dashboard content loaded successfully.");
}

/**
 * Function untuk memuat data guru ke dalam tabel
 */
async function loadTeachers() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token not found');
            return;
        }

        // Memanggil API untuk mengambil data guru
        const response = await NetworkHelper.get(ENDPOINTS.TEACHERS.GET_TEACHERS, {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        });


        // Cek apakah response berhasil dan memiliki 'items' di dalamnya
        if (response.message === 'Teachers retrieved successfully' && response.items) {
            renderTeacherTable(response.items); // Render data guru ke dalam tabel
        } else {
            console.error('Failed to fetch teachers data');
        }
    } catch (error) {
        console.error('Error fetching teachers:', error);
    }
}

/**
 * Render daftar guru ke dalam tabel
 * @param {Array} teachers - Data guru dari API
 */
function renderTeacherTable(teachers) {
    const tableBody = document.querySelector(".dt-new-teachers tbody"); // Mendapatkan elemen tbody
    tableBody.innerHTML = ""; // Kosongkan tabel sebelum diisi ulang

    teachers.forEach((teacher, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${teacher.nama_lengkap}</td>
                <td>${teacher.nip}</td>
                <td>${teacher.user.email || '-'}</td> <!-- Email guru -->
                <td>${new Date(teacher.tanggal_masuk).toLocaleDateString()}</td>
                <td>
                    <span class="badge bg-label-${teacher.status === 'Aktif' ? 'success' : 'warning'}">${teacher.status}</span>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", row); // Menambahkan baris ke tabel
    });
}

async function loadBintangTop15() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token not found');
            return;
        }

        const response = await NetworkHelper.get(ENDPOINTS.BINTANG.BINTANG_TOP15, {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        });

        console.log(response); // Debugging untuk melihat response dari API

        if (response.statusCode === 200 && response.data) {
            renderBintangChart(response.data); // Panggil fungsi untuk menampilkan grafik
        } else {
            console.error('Failed to fetch bintang data');
        }
    } catch (error) {
        console.error('Error fetching bintang:', error);
    }
}

// Panggil fungsi saat halaman dimuat
document.addEventListener('DOMContentLoaded', loadBintangTop15);
function renderBintangChart(data) {
    if (!data || data.length === 0) {
        console.warn("Tidak ada data bintang untuk ditampilkan.");
        return;
    }

    // Ambil nama peserta dan total bintang
    const labels = data.map(item => item.nama);
    const bintangValues = data.map(item => parseInt(item.total_bintang));

    const canvas = document.getElementById('bintangChart');
    const ctx = canvas.getContext('2d');

    // Bersihkan chart lama jika ada
    if (window.bintangChartInstance) {
        window.bintangChartInstance.destroy();
    }

    // Deteksi jika layar kecil (HP)
    const isMobile = window.innerWidth < 768;
    const barThickness = isMobile ? 15 : 30; // ✅ Ukuran batang lebih kecil di HP

    window.bintangChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels, // ✅ Tetap pakai labels, tapi disembunyikan di X
            datasets: [{
                label: 'Total Bintang',
                data: bintangValues,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                hoverBackgroundColor: 'rgba(255, 159, 64, 0.8)',
                barPercentage: isMobile ? 0.6 : 0.8,
                categoryPercentage: isMobile ? 0.7 : 0.9,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }, // ✅ Sembunyikan legenda
                tooltip: {
                    enabled: true, // ✅ Tampilkan hanya saat hover
                    backgroundColor: '#333',
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 14 },
                    callbacks: {
                        title: function (tooltipItems) {
                            let index = tooltipItems[0].dataIndex;
                            return `👤 ${labels[index]}`; // ✅ Tampilkan nama di hover
                        },
                        label: function (tooltipItem) {
                            return `⭐ ${tooltipItem.raw} Bintang`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: Math.max(...bintangValues) + 3,
                    ticks: { stepSize: 1, font: { size: 14 }, color: '#555' },
                    grid: { color: "rgba(200, 200, 200, 0.3)", borderDash: [5, 5] }
                },
                x: {
                    ticks: {
                        display: false // ✅ Sembunyikan nama di sumbu X
                    },
                    grid: { display: false }
                }
            }
        }
    });
}
// Function to fetch and update the metrics data
async function fetchMetrics() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("Token tidak ditemukan. Harap login terlebih dahulu.");
            return;
        }

        // Panggil API untuk mendapatkan data metrics
        const response = await NetworkHelper.get(ENDPOINTS.METRICS.GET_ALL, {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        });

        // Periksa apakah response berhasil
        if (response.statusCode === 200 && response.message === 'Metrics count berhasil diambil') {
            // Tampilkan data ke elemen HTML
            document.getElementById('total-peserta').textContent = response.data.totalPeserta || '0';
            document.getElementById('total-kakak-pendamping').textContent = response.data.totalPendamping || '0';
            document.getElementById('total-wali-orang-tua').textContent = response.data.totalOrangTua || '0';
            document.getElementById('total-pengguna').textContent = response.data.totalPengguna || '0';

            console.log('Metrics berhasil dimuat:', response.data);
        } else {
            console.error('Gagal mengambil data metrics:', response.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error fetching metrics:', error);
    }
}


// Call the function to initialize the dashboard with metrics
document.addEventListener("DOMContentLoaded", () => {
    fetchMetrics();  // Fetch and display the metrics on page load
    // loadAnnouncements(); // Load announcements on page load
    // loadTeachers(); // Memuat daftar guru ke dalam tabel
    // loadStudents(); // Memuat data siswa ke dalam grafik

});
