// Import helper modules
import { NetworkHelper } from '../../config/networkHelper.js';
import { ENDPOINTS } from '../../config/endpoint.js';
import { showToast } from '../../config/toast.js';
import { navigateToDashboard } from '../../config/back.js';

let isNewRecord = false; // Flag to check if it's a new record
export function init() {
    console.log("Data Siswa Initialized");

    // Cek apakah studentRegistrationId ada di localStorage
    const studentRegistrationId = localStorage.getItem('student_registration_id');

    // Jika tidak ada studentRegistrationId, set isNewRecord menjadi true
    if (!studentRegistrationId) {
        console.warn('Student Registration ID tidak ditemukan. Pendaftar baru.');
        isNewRecord = true; // Data baru, gunakan POST
    } else {
        console.log('Student Registration ID ditemukan:', studentRegistrationId);
        getStudentData(studentRegistrationId); // Ambil data jika ID ditemukan
    }

    // Pasang event listener pada tombol Simpan
    const saveButton = document.getElementById('tombolsave');
    saveButton.addEventListener('click', () => saveStudentData(studentRegistrationId));

    navigateToDashboard();
}

/**
 * Fetch Student Registration by ID dan isi form
 * @param {number} id - Student Registration ID
 */
async function getStudentData(id) {
    try {
        const response = await NetworkHelper.get(ENDPOINTS.STUDENT_REGISTRATIONS.GET_BY_ID(id));
        const studentData = response.data;

        if (studentData) {
            populateForm(studentData);
            isNewRecord = false; // Data exists, so it's an update
        } else {
            throw new Error('Data siswa tidak ditemukan.');
        }
    } catch (error) {
        if (error.message.includes('not found') || error.response?.data?.code === 'NOT_FOUND') {
            showToast('Data siswa tidak ditemukan. Akan membuat data baru.', 'info');
            isNewRecord = true; // Data not found, so it's a new record
        } else {
            console.error('Error fetching student data:', error);
            showToast('Gagal mengambil data siswa.', 'danger');
        }
    }
}
/**
 * Populate form fields dengan data siswa
 * @param {object} data - Data siswa dari API
 */
function populateForm(data) {
    setFieldValue('nis', data.nis);
    setFieldValue('nik', data.nik);
    setFieldValue('nama', data.nama_lengkap);
    setFieldValue('gender', data.jenis_kelamin === 'L' ? 'male' : 'female');
    setFieldValue('birthplace', data.tempat_lahir);
    setFieldValue('birthdate', data.tanggal_lahir);
    setFieldValue('religion', data.agama);
    setFieldValue('bloodtype', data.golongan_darah);
    setFieldValue('height', data.tinggi_badan);
    setFieldValue('weight', data.berat_badan);
    setFieldValue('family-status', data.status_keluarga);
    setFieldValue('child-order', data.anak_ke);
    setFieldValue('siblings', data.jumlah_saudara);
    setFieldValue('disease-history', data.riwayat_penyakit);
    setFieldValue('hobby', data.hobi);
    setFieldValue('achievement', data.prestasi);
    setFieldValue('full-address', data.alamat_lengkap);
    setFieldValue('dusun', data.dusun);
    setFieldValue('rt', data.rt);
    setFieldValue('rw', data.rw);
    setFieldValue('village', data.desa);
    setFieldValue('district', data.kecamatan);
    setFieldValue('regency', data.kabupaten);
    setFieldValue('province', data.provinsi);
    setFieldValue('transportation', data.mode_transportasi);
}


async function saveStudentData(studentRegistrationId) {
    console.log('Menyimpan data siswa:', studentRegistrationId);

    try {
        const studentData = getFormData();

        // Tambahkan jalur_periode_id dari localStorage
        const jalurPeriodeId = localStorage.getItem('selectedJalurId');
        if (!jalurPeriodeId) {
            showToast('Jalur belum dipilih. Silakan pilih jalur terlebih dahulu.', 'warning');
            return;
        }
        studentData.jalur_periode_id = jalurPeriodeId;

        let response;
        if (isNewRecord) {
            response = await NetworkHelper.post(ENDPOINTS.STUDENT_REGISTRATIONS.CREATE, studentData);
            showToast('Data siswa berhasil disimpan.', 'success');

            // Simpan student_registration_id ke localStorage setelah berhasil POST
            localStorage.setItem('student_registration_id', response.data.id);
            isNewRecord = false;
        } else {
            response = await NetworkHelper.put(ENDPOINTS.STUDENT_REGISTRATIONS.UPDATE(studentRegistrationId), studentData);
            showToast('Data siswa berhasil diperbarui.', 'success');
        }
    } catch (error) {
        console.error('Error saving student data:', error);
        showToast('Gagal menyimpan data siswa.', 'danger');
    }
}

function getFormData() {
    return {
        user_id: 51, // Sesuaikan dengan ID user yang login
        nis: document.getElementById('nis').value,
        nik: document.getElementById('nik').value,
        nama_lengkap: document.getElementById('nama').value,
        jenis_kelamin: document.getElementById('gender').value === 'male' ? 'L' : 'P',
        tempat_lahir: document.getElementById('birthplace').value,
        tanggal_lahir: document.getElementById('birthdate').value,
        agama: document.getElementById('religion').value,
        golongan_darah: document.getElementById('bloodtype').value,
        tinggi_badan: parseFloat(document.getElementById('height').value),
        berat_badan: parseFloat(document.getElementById('weight').value),
        status_keluarga: document.getElementById('family-status').value,
        anak_ke: parseInt(document.getElementById('child-order').value, 10),
        jumlah_saudara: parseInt(document.getElementById('siblings').value, 10),
        riwayat_penyakit: document.getElementById('disease-history').value,
        hobi: document.getElementById('hobby').value,
        prestasi: document.getElementById('achievement').value,
        alamat_lengkap: document.getElementById('full-address').value,
        dusun: document.getElementById('dusun').value,
        rt: document.getElementById('rt').value,
        rw: document.getElementById('rw').value,
        desa: document.getElementById('village').value,
        kecamatan: document.getElementById('district').value,
        kabupaten: document.getElementById('regency').value,
        provinsi: document.getElementById('province').value,
        mode_transportasi: document.getElementById('transportation').value,
        status_pendaftaran: 'Pending', // Default status pendaftaran
    };
}


/**
 * Set value pada input field
 * @param {string} fieldId - ID elemen input
 * @param {string|number} value - Nilai yang akan diisi
 */
function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field && value) {
        field.value = value;
    }
}
