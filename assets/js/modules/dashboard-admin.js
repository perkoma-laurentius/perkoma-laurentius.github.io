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

    // Ambil nama peserta dan total bintangnya
    const labels = data.map(item => item.nama);
    const bintangValues = data.map(item => parseInt(item.total_bintang)); // Konversi data ke angka

    // Buat warna gradien untuk setiap batang grafik
    const canvas = document.getElementById('bintangChart');
    const ctx = canvas.getContext('2d');
    const gradientColors = labels.map((_, index) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, `hsl(${index * 40}, 80%, 60%)`);
        gradient.addColorStop(1, `hsl(${index * 40}, 70%, 40%)`);
        return gradient;
    });

    // Data untuk Chart.js
    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Total Bintang',
            data: bintangValues,
            backgroundColor: gradientColors, // Warna batang gradien
            borderColor: 'rgba(0, 0, 0, 0.2)',
            borderWidth: 2,
            hoverBackgroundColor: 'rgba(255, 206, 86, 0.8)',
            barThickness: 40,
            borderRadius: 8
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 30 // 🟢 Tambahkan padding agar angka tidak keluar dari chart
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: '#222',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 14 },
                callbacks: {
                    label: function (tooltipItem) {
                        let peserta = labels[tooltipItem.dataIndex];
                        let total = bintangValues[tooltipItem.dataIndex];
                        return ` 👤 ${peserta} ⭐ ${total} Bintang`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                suggestedMax: Math.max(...bintangValues) + 5, // 🟢 Tambahkan ruang di atas
                ticks: {
                    stepSize: 1,
                    font: { size: 14, weight: 'bold' },
                    color: '#555'
                },
                grid: {
                    color: "rgba(200, 200, 200, 0.3)",
                    borderDash: [5, 5]
                }
            },
            x: {
                ticks: {
                    font: { size: 14, weight: 'bold' },
                    color: '#333'
                },
                grid: {
                    display: false
                }
            }
        },
        animation: {
            duration: 1500,
            easing: "easeInOutQuart"
        }
    };

    // Jika ada chart sebelumnya, hapus
    if (window.bintangChartInstance) {
        window.bintangChartInstance.destroy();
    }

    // Buat grafik baru
    window.bintangChartInstance = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: options,
        plugins: [{
            id: 'datalabels',
            afterDatasetsDraw(chart) {
                const { ctx } = chart;
                chart.data.datasets.forEach((dataset, i) => {
                    const meta = chart.getDatasetMeta(i);
                    meta.data.forEach((bar, index) => {
                        const value = dataset.data[index];

                        ctx.fillStyle = 'black'; // 🟢 Warna font lebih kontras
                        ctx.font = 'bold 16px Arial';
                        ctx.textAlign = 'center';

                        // 🟢 Pastikan angka berada sedikit di atas batang
                        ctx.fillText(value, bar.x, bar.y - 15);
                    });
                });
            }
        }]
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
