import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { loadAnnouncements } from './announcement.js';

export function init() {
    console.log("Dashboard Initialized");
    fetchMetrics();
    loadAnnouncements();
    loadTeachers();  // Memuat data guru
    loadStudents();  // Memuat data siswa

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

/**
 * Function untuk memuat data siswa ke dalam grafik
 */
async function loadStudents() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token not found');
            return;
        }

        // Memanggil API untuk mengambil data siswa
        const response = await NetworkHelper.get(ENDPOINTS.STUDENTS.GET_STUDENTS, {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        });

        console.log(response); // Log response untuk memeriksa struktur data

        // Cek apakah response berhasil dan memiliki 'items' di dalamnya
        if (response.message === 'Students retrieved successfully' && response.items) {
            renderStudentGrowthChart(response.items); // Render grafik berdasarkan data siswa
        } else {
            console.error('Failed to fetch students data');
        }
    } catch (error) {
        console.error('Error fetching students:', error);
    }
}


/**
 * Function untuk render grafik statistik kenaikan siswa
 * @param {Array} students - Data siswa dari API
 */
function renderStudentGrowthChart(students) {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const studentsPerMonth = new Array(12).fill(0); // Untuk menghitung siswa per bulan

    // Menghitung jumlah siswa per bulan
    students.forEach(student => {
        const month = new Date(student.tanggal_masuk).getMonth(); // Mendapatkan bulan dari tanggal masuk
        studentsPerMonth[month] += 1; // Tambahkan 1 untuk setiap siswa yang masuk pada bulan tersebut
    });

    // Data untuk chart
    const data = {
        labels: months, // Bulan-bulan
        datasets: [{
            label: 'Jumlah Siswa',
            data: studentsPerMonth, // Data jumlah siswa per bulan
            borderColor: 'rgba(75, 192, 192, 1)',  // Warna garis grafik
            backgroundColor: 'rgba(75, 192, 192, 0.2)', // Warna area bawah garis
            fill: true, // Mengisi area di bawah garis
            tension: 0.4 // Kelengkungan garis
        }]
    };

    // Opsi grafik
    const options = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    callback: function(value) {
                        return value.toFixed(0); // Pastikan angka bulat
                    }
                }
            }
        }
    };

    const canvas = document.getElementById('studentGrowthChart');
    if (canvas) {
        const ctx = canvas.getContext('2d'); // Mendapatkan context 2D
        const studentGrowthChart = new Chart(ctx, {
            type: 'line', // Tipe grafik: garis
            data: data,
            options: options
        });

        // Event listener untuk dropdown
        const dropdownItems = document.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', (event) => {
                const selectedMonth = parseInt(event.target.getAttribute('data-month'));  // Ambil bulan yang dipilih
                const monthData = new Array(12).fill(0); // Reset data bulan

                // Set data untuk bulan yang dipilih
                monthData[selectedMonth] = studentsPerMonth[selectedMonth]; // Set jumlah siswa untuk bulan yang dipilih
                studentGrowthChart.data.datasets[0].data = monthData; // Update data grafik dengan data bulan yang dipilih
                studentGrowthChart.update();  // Render ulang grafik

                // Ubah teks pada tombol dropdown
                const monthButton = document.getElementById('monthButton');
                monthButton.textContent = months[selectedMonth]; // Tampilkan bulan yang dipilih
            });
        });
    } else {
        console.error("Canvas element not found!");
    }
}

/**
 * Function untuk update period based on students' data
 * @param {Array} students - Data siswa dari API
 */
function updatePeriod(students) {
    let startDate = null;
    let endDate = null;

    // Tentukan start date dan end date berdasarkan tanggal_masuk
    students.forEach(student => {
        const studentDate = new Date(student.tanggal_masuk); // Convert to Date object
        if (!startDate || studentDate < startDate) {
            startDate = studentDate;
        }
        if (!endDate || studentDate > endDate) {
            endDate = studentDate;
        }
    });

    let period = 'No data for period';
    if (startDate && endDate) {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        period = `${months[startDate.getMonth()]} - ${months[endDate.getMonth()]} ${endDate.getFullYear()}`;
    }

    // Update the period in the card subtitle
    const periodElement = document.querySelector('.card-subtitle');
    if (periodElement) {
        periodElement.textContent = `Periode: ${period}`; // Set the period in the subtitle
    }
}
// Function to fetch and update the metrics data
async function fetchMetrics() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return;
        }

        // Call the API to fetch the metrics data
        const response = await NetworkHelper.get(ENDPOINTS.METRICS.GET_ALL, {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        });


        // Check if the response is successful
        if (response.message === 'Metrics data fetched successfully' && response.data) {
            // Log the individual values to verify
     

            // Populate the metrics data into the respective elements
            document.getElementById('total-kelas').textContent = response.data.kelas || '0';
            document.getElementById('total-siswa').textContent = response.data.students || '0';
            document.getElementById('total-guru').textContent = response.data.teachers || '0';
            document.getElementById('total-admin').textContent = response.data.users || '0';
        } else {
            console.error('Failed to fetch metrics data');
        }
    } catch (error) {
        console.error('Error fetching metrics:', error);
    }
}

// Call the function to initialize the dashboard with metrics
document.addEventListener("DOMContentLoaded", () => {
    fetchMetrics();  // Fetch and display the metrics on page load
    loadAnnouncements(); // Load announcements on page load
    loadTeachers(); // Memuat daftar guru ke dalam tabel
    loadStudents(); // Memuat data siswa ke dalam grafik

});
