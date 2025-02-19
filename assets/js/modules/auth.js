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
            if (roleId === 2 && response.data.kelompok_pendamping) {
                localStorage.setItem('kelompok_id', response.data.kelompok_pendamping.id);
                localStorage.setItem('kelompok_nama', response.data.kelompok_pendamping.nama);
                
                // **Tambahkan pendamping_id hanya jika role_id = 2 (Pendamping)**
                if (response.data.pendamping_id) {
                    localStorage.setItem('pendamping_id', response.data.pendamping_id);
                }
            } else {
                // **Hapus data kelompok jika bukan pendamping**
                localStorage.removeItem('kelompok_id');
                localStorage.removeItem('kelompok_nama');
                localStorage.removeItem('pendamping_id'); // Hapus pendamping_id jika bukan pendamping
            }
            // Navigasi berdasarkan role pengguna
            if (roleId === 1) {
                console.log("Navigating to Admin Dashboard");
                navigate('DASHBOARDADMIN');
            } else if (roleId === 2) {
                console.log("Navigating to KAKAKPENDAMPING Dashboard");
                navigate('DASHBOARDKAKAKPENDAMPING');
            } else if (roleId === 0) {
                console.log("Navigating to ERROR404LOGIN Dashboard");
                navigate('ERROR404LOGIN');
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
