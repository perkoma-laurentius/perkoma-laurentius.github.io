import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { loadAnnouncements } from './announcement.js';

export function init() {
    console.log("Dashboard Initialized");
    fetchMetrics();
    loadAnnouncements(); // Load announcements on page load

    // Cek token sebelum melanjutkan
    const welcomeText = document.getElementById("welcomeText");
    if (welcomeText) {
        welcomeText.textContent = "Selamat Datang di Dashboard!";
    }

    // Tambahkan logika lain untuk dashboard jika diperlukan
    console.log("Dashboard content loaded successfully.");
}

// Function to fetch and update the metrics data
async function fetchMetrics() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token not found');
            return;
        }

        // Call the API to fetch the metrics data
        const response = await NetworkHelper.get(ENDPOINTS.METRICS.GET_ALL, {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        });

        console.log(response); // Log the response to check its structure

        // Check if the response is successful
        if (response.message === 'Metrics data fetched successfully' && response.data) {
            // Log the individual values to verify
            console.log('Total Kelas:', response.data.kelas);
            console.log('Total Siswa:', response.data.students);
            console.log('Total Guru:', response.data.teachers);
            console.log('Total Admin:', response.data.users);

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
});
