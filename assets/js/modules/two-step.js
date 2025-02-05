import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { showToast } from '../config/toast.js'; // Toast Helper untuk notifikasi
import { navigate } from './main.js'; // Fungsi navigasi untuk berpindah halaman

export function init() {
    console.log("Two Steps Verification Initialized");

    const verifyButton = document.getElementById('verifyButton'); // Tombol Verifikasi
    const inputs = document.querySelectorAll('.auth-input'); // Input Kode Verifikasi
    const email = localStorage.getItem('email'); // Ambil email dari localStorage
    const roleId = localStorage.getItem('role-ppdb'); // Ambil role_id dari localStorage

    if (!email) {
        showToast('Email tidak ditemukan. Silakan ulangi proses pendaftaran.', 'danger');
        console.error('Email is missing. Redirecting to registration...');
        return;
    }
    

    // Tangani klik pada tombol verifikasi
    verifyButton.addEventListener('click', async (e) => {
        e.preventDefault(); // Mencegah reload halaman

        // Gabungkan input kode verifikasi menjadi satu string
        const verificationCode = Array.from(inputs)
            .map(input => input.value.trim())
            .join('');

        if (verificationCode.length !== inputs.length) {
            showToast('Kode verifikasi tidak lengkap. Silakan masukkan semua digit.', 'warning');
            return;
        }

        try {
            // Kirim data ke endpoint verifikasi
            const response = await NetworkHelper.post(ENDPOINTS.AUTH.VERIFY_EMAIL_CODE, {
                email: email,
                verificationCode: verificationCode
            });

            console.log('Verification Response:', response);

            if (response.message === "User verified successfully") {
                showToast('Verifikasi berhasil! Anda akan diarahkan ke halaman Login.', 'success');

                // Arahkan ke halaman dashboard setelah delay
                if (roleId && parseInt(roleId, 10) === 777) {
                    showToast('Anda memiliki akses ke PPDB. Mengarahkan ke halaman Data Siswa...', 'success');

                    setTimeout(() => {
                        navigate('AUTH_LOGIN'); // Navigasi ke halaman DATA_SISWA
                        // localStorage.removeItem('role_id');
                        // localStorage.removeItem('role-ppdb'); // Hapus role_id dari localStorage
                        // localStorage.removeItem('email'); // Hapus email dari localStorage
                    }, 1500); // Delay untuk memastikan notifikasi terlihat
                } else {
                    setTimeout(() => {
                        navigate('AUTH_LOGIN'); // Arahkan ke halaman login jika bukan role PPDB
                    }, 1500);
                }
            } else {
                showToast('Verifikasi gagal. Silakan periksa kode Anda.', 'danger');
            }
        } catch (error) {
            console.error('Verification Failed:', error);
            showToast('Verifikasi gagal. Silakan coba lagi nanti.', 'danger');
        }
    });

    // Fokus otomatis pada input berikutnya saat angka dimasukkan
    inputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            if (input.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
    });
}
