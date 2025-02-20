import { NetworkHelper } from '../config/networkHelper.js';
import { navigate } from './main.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { showToast } from '../config/toast.js';

export function init() {
    console.log("Auth Login Initialized");

    const loginButton = document.getElementById('loginButton');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const loginInput = document.getElementById('login');
    const passwordInput = document.getElementById('password');

    // ✅ Cek apakah ada data login yang disimpan di localStorage (email/nomor HP)
    const savedLogin = localStorage.getItem('remember_login');
    if (savedLogin) {
        loginInput.value = decryptData(savedLogin);
        rememberMeCheckbox.checked = true;
    }

    loginButton.addEventListener('click', async () => {
        const login = loginInput.value.trim();
        const password = passwordInput.value.trim();

        if (!login || !password) {
            showToast('Harap isi login (email atau nomor telepon) dan password.', 'danger');
            return;
        }

        try {
            const response = await NetworkHelper.post(ENDPOINTS.AUTH.LOGIN, {
                login: login,
                password: password // ✅ Kirim password asli, bcrypt di backend
            });
            showToast("Login berhasil!", "success");

            console.log('Login Response:', response);

            // ✅ Simpan informasi pengguna ke localStorage
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
                if (response.data.pendamping_id) {
                    localStorage.setItem('pendamping_id', response.data.pendamping_id);
                }
            } else {
                localStorage.removeItem('kelompok_id');
                localStorage.removeItem('kelompok_nama');
                localStorage.removeItem('pendamping_id');
            }

            // ✅ Simpan login jika "Ingat Saya" dicentang
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('remember_login', encryptData(login)); // Bisa email atau nomor HP
            } else {
                localStorage.removeItem('remember_login');
            }

            if (roleId === 1) {
                navigate('DASHBOARDADMIN');
            } else if (roleId === 2) {
                navigate('DASHBOARDKAKAKPENDAMPING');
            } else {
                navigate('ERROR404LOGIN');
            }
        } catch (error) {
            console.error('Login Failed:', error);
            const errorMessage = error.response?.data?.message || 'Login gagal. Silakan periksa login dan password Anda.';
            showToast(errorMessage, 'danger');
        }
    });
}

/**
 * ✅ Fungsi untuk mengenkripsi data (misal: login untuk Remember Me)
 * @param {string} data - Data yang akan dienkripsi
 * @returns {string} - Data dalam format Base64
 */
function encryptData(data) {
    return btoa(unescape(encodeURIComponent(data))); // Menangani karakter khusus
}

/**
 * ✅ Fungsi untuk mendekripsi data yang disimpan
 * @param {string} data - Data terenkripsi
 * @returns {string} - Data asli
 */
function decryptData(data) {
    return decodeURIComponent(escape(atob(data))); // Menangani karakter khusus
}
