// assets/js/auth.js
import { NetworkHelper } from '../config/networkHelper.js';
import { navigate } from './main.js';
import { ENDPOINTS } from '../config/endpoint.js';

export function init() {
    console.log("Auth Login Initialized");

    const loginButton = document.getElementById('loginButton');
    if (!loginButton) {
        console.error("Login button not found!");
        return;
    }

    loginButton.addEventListener('click', async () => {
        // Ambil nilai login dan password dari input
        const login = document.getElementById('login').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!login || !password) {
            alert('Harap isi login (email atau nomor telepon) dan password.');
            return;
        }

        try {
            // Lakukan request login ke server
            const response = await NetworkHelper.post(ENDPOINTS.AUTH.LOGIN, {
                login: login,
                password: password
            });

            console.log('Login Response:', response);

            // Simpan token dan informasi pengguna ke localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('id', response.data.id);
            localStorage.setItem('email', response.data.email);
            localStorage.setItem('phone', response.data.phone);
            localStorage.setItem('role_id', response.data.role_id);
            localStorage.setItem('login_as', response.data.login_as);

            const roleId = response.data.role_id;

            // Navigasi berdasarkan role pengguna
            if (roleId === 1) {
                console.log("Navigating to Admin Dashboard");
                navigate('DASHBOARDADMIN');
            } else if (roleId === 2) {
                console.log("Navigating to Guru Dashboard");
                navigate('DASHBOARDGURU');
            } else if (roleId === 777) {
                console.log("Navigating to PPDB Dashboard");
                navigate('DASHBOARD_PPDB');
            } else {
                console.log("Navigating to Default Dashboard");
                navigate('ERROR404LOGIN');
            }
        } catch (error) {
            console.error('Login Failed:', error);

            // Tangani jika ada error dari server
            const errorMessage = error.response?.data?.message || 'Login gagal. Silakan periksa login dan password Anda.';
            alert(errorMessage);
        }
    });
}
