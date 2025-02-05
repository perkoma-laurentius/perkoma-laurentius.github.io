// Import helper modules
import { NetworkHelper } from '../../config/networkHelper.js';
import { ENDPOINTS } from '../../config/endpoint.js';
import { showToast } from '../../config/toast.js';
import { navigateToDashboard } from '../../config/back.js';

let isNewRecord = false; // Flag untuk menentukan apakah data baru atau update

export function init() {
    console.log("Data Orang Tua Initialized");
    navigateToDashboard();
    const studentRegistrationId = localStorage.getItem('student_registration_id');

    if (!studentRegistrationId) {
        showToast('Student Registration ID tidak ditemukan.', 'warning');
        return;
    }

    getStudentParentData(studentRegistrationId);

    // Event listener untuk tombol Simpan
    const saveButton = document.querySelector('.btn-primary');
    saveButton.addEventListener('click', () => saveStudentParentData(studentRegistrationId));
}

/**
 * Fetch Student Parent by Student Registration ID dan isi form
 * @param {number} id - Student Registration ID
 */
async function getStudentParentData(id) {
    try {
        const response = await NetworkHelper.get(ENDPOINTS.STUDENT_PARENTS.GET_BY_STUDENT_ID(id));
        if (response.status === 'success' && response.data) {
            populateForm(response.data);
            isNewRecord = false; // Data ditemukan, mode update
            updateSaveButton(false); // Ubah tombol menjadi update
        } else {
            throw new Error('Data orang tua tidak ditemukan.');
        }
    } catch (error) {
        if (error.response?.data?.status === 'error' && error.response?.data?.message.includes('Not Found')) {
            showToast('Data orang tua tidak ditemukan. Akan membuat data baru.', 'info');
            isNewRecord = true; // Mode baru
            updateSaveButton(true); // Ubah tombol menjadi create
        } else {
            console.error('Error fetching parent data:', error);
            // showToast('Gagal mengambil data orang tua.', 'danger');
        }
    }
}

/**
 * Ubah teks dan atribut tombol Simpan berdasarkan mode
 * @param {boolean} isNew - Jika true, mode POST; jika false, mode PUT
 */
function updateSaveButton(isNew) {
    const saveButton = document.querySelector('.btn-primary');
    saveButton.textContent = isNew ? 'Simpan (Tambah Data Baru)' : 'Simpan (Perbarui Data)';
}

/**
 * Populate form fields dengan data orang tua
 * @param {object} data - Data orang tua dari API
 */
function populateForm(data) {
    setFieldValue('ayah', data.nama_ayah);
    setFieldValue('nik-ayah', data.nik_ayah);
    setFieldValue('status-ayah', data.status_ayah);
    setFieldValue('tempat-lahir-ayah', data.tempat_lahir_ayah);
    setFieldValue('tanggal-lahir-ayah', formatDateForInput(data.tanggal_lahir_ayah));
    setFieldValue('pendidikan-ayah', data.pendidikan_ayah);
    setFieldValue('pekerjaan-ayah', data.pekerjaan_ayah);
    setFieldValue('penghasilan-ayah', data.penghasilan_ayah);

    setFieldValue('nama-ibu', data.nama_ibu);
    setFieldValue('nik-ibu', data.nik_ibu);
    setFieldValue('status-ibu', data.status_ibu);
    setFieldValue('tempat-lahir-ibu', data.tempat_lahir_ibu);
    setFieldValue('tanggal-lahir-ibu', formatDateForInput(data.tanggal_lahir_ibu));
    setFieldValue('pendidikan-ibu', data.pendidikan_ibu);
    setFieldValue('pekerjaan-ibu', data.pekerjaan_ibu);
    setFieldValue('penghasilan-ibu', data.penghasilan_ibu);

    setFieldValue('nama-wali', data.nama_wali);
    setFieldValue('nik-wali', data.nik_wali);
    setFieldValue('status-wali', data.status_wali);
    setFieldValue('tempat-lahir-wali', data.tempat_lahir_wali);
    setFieldValue('tanggal-lahir-wali', formatDateForInput(data.tanggal_lahir_wali));
    setFieldValue('pendidikan-wali', data.pendidikan_wali);
    setFieldValue('pekerjaan-wali', data.pekerjaan_wali);
    setFieldValue('penghasilan-wali', data.penghasilan_wali);

    setFieldValue('no-telepon', data.no_telepon);
    setFieldValue('alamat', data.alamat);
}

/**
 * Save student parent data to the server
 * @param {number} studentRegistrationId - Student Registration ID
 */
async function saveStudentParentData(studentRegistrationId) {
    try {
        const parentData = getFormData();

        if (isNewRecord) {
            // POST request untuk membuat data baru
            await NetworkHelper.post(
                ENDPOINTS.STUDENT_PARENTS.UPDATE_BY_STUDENT_ID(studentRegistrationId),
                parentData
            );
            showToast('Data orang tua berhasil disimpan.', 'success');
            isNewRecord = false; // Ubah ke mode update
            updateSaveButton(false); // Ubah tombol menjadi mode update
        } else {
            // PUT request untuk memperbarui data yang ada
            await NetworkHelper.post(
                ENDPOINTS.STUDENT_PARENTS.UPDATE_BY_STUDENT_ID(studentRegistrationId),
                parentData
            );
            showToast('Data orang tua berhasil diperbarui.', 'success');
        }
    } catch (error) {
        console.error('Error saving parent data:', error);
        showToast('Gagal menyimpan atau memperbarui data orang tua.', 'danger');
    }
}



/**
 * Get form data as an object
 * @returns {object} Form data
 */
function getFormData() {
    return {
        nama_ayah: document.getElementById('ayah').value,
        nik_ayah: document.getElementById('nik-ayah').value,
        status_ayah: document.getElementById('status-ayah').value,
        tempat_lahir_ayah: document.getElementById('tempat-lahir-ayah').value,
        tanggal_lahir_ayah: document.getElementById('tanggal-lahir-ayah').value,
        pendidikan_ayah: document.getElementById('pendidikan-ayah').value,
        pekerjaan_ayah: document.getElementById('pekerjaan-ayah').value,
        penghasilan_ayah: document.getElementById('penghasilan-ayah').value,

        nama_ibu: document.getElementById('nama-ibu').value,
        nik_ibu: document.getElementById('nik-ibu').value,
        status_ibu: document.getElementById('status-ibu').value,
        tempat_lahir_ibu: document.getElementById('tempat-lahir-ibu').value,
        tanggal_lahir_ibu: document.getElementById('tanggal-lahir-ibu').value,
        pendidikan_ibu: document.getElementById('pendidikan-ibu').value,
        pekerjaan_ibu: document.getElementById('pekerjaan-ibu').value,
        penghasilan_ibu: document.getElementById('penghasilan-ibu').value,

        nama_wali: document.getElementById('nama-wali').value,
        nik_wali: document.getElementById('nik-wali').value,
        status_wali: document.getElementById('status-wali').value,
        tempat_lahir_wali: document.getElementById('tempat-lahir-wali').value,
        tanggal_lahir_wali: document.getElementById('tanggal-lahir-wali').value,
        pendidikan_wali: document.getElementById('pendidikan-wali').value,
        pekerjaan_wali: document.getElementById('pekerjaan-wali').value,
        penghasilan_wali: document.getElementById('penghasilan-wali').value,

        no_telepon: document.getElementById('no-telepon').value,
        alamat: document.getElementById('alamat').value,
    };
}

/**
 * Format tanggal ke format YYYY-MM-DD untuk input type="date"
 * @param {string} date - Tanggal dalam format ISO
 * @returns {string} Tanggal dalam format YYYY-MM-DD
 */
function formatDateForInput(date) {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

/**
 * Set value pada input field
 * @param {string} fieldId - ID elemen input
 * @param {string|number} value - Nilai yang akan diisi
 */
function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.value = value || ''; // Mengisi nilai, atau kosongkan jika undefined/null
    }
}
