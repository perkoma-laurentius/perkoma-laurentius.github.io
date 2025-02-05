// Import helper modules
import { NetworkHelper } from '../../config/networkHelper.js';
import { ENDPOINTS } from '../../config/endpoint.js';

/**
 * Inisialisasi halaman Formulir Pendaftaran
 */
export function init() {
    const studentRegistrationId = localStorage.getItem('student_registration_id');

    if (!studentRegistrationId) {
        console.error('Student Registration ID tidak ditemukan di localStorage.');
        return;
    }

    // Render data form status ke halaman
    fetchAndRenderFormStatus(studentRegistrationId);
}

/**
 * Fungsi untuk mengambil data form status berdasarkan Student Registration ID
 * dan merendernya ke dalam halaman
 * @param {string} studentRegistrationId - ID pendaftaran siswa
 */
async function fetchAndRenderFormStatus(studentRegistrationId) {
    try {
        const response = await NetworkHelper.get(ENDPOINTS.FORM_STATUS.GET_BY_STUDENT_DETAILS_ID(studentRegistrationId));
        const formData = response.data;

        if (formData) {
            renderContent(formData);
        } else {
            document.getElementById('content').innerHTML = `<p>Data form status tidak tersedia.</p>`;
        }
    } catch (error) {
        console.error('Error fetching form status:', error);
        document.getElementById('content').innerHTML = `<p>Terjadi kesalahan saat mengambil data form status.</p>`;
    }
}

/**
 * Fungsi untuk merender data form status ke halaman HTML
 * @param {object} formData - Data form status yang diterima dari API
 */
function renderContent(formData) {
    const contentContainer = document.getElementById('content');
    contentContainer.innerHTML = '';

    const nomorPendaftaran = formData.nomor_pendaftaran || '-';
    document.getElementById('registration-number').innerText = nomorPendaftaran;

    // Render Data Siswa (tanpa ID, USER ID, dan JALUR PERIODE ID)
    const student = formData.student || {};
    const ignoredKeys = ['id', 'user_id', 'jalur_periode_id'];
    let studentContent = `
        <div>
            <h3 class="section-title">Data Siswa</h3>
            <table>
                <tr><th>Field</th><th>Value</th></tr>
    `;
    Object.entries(student).forEach(([key, value]) => {
        if (!ignoredKeys.includes(key)) {
            studentContent += `<tr><td>${key.replace(/_/g, ' ').toUpperCase()}</td><td>${value || '-'}</td></tr>`;
        }
    });
    studentContent += '</table></div>';
    contentContainer.insertAdjacentHTML('beforeend', studentContent);

    // Render Data Orang Tua: Tabel Ayah dan Ibu
    const parents = formData.parents[0] || {};
    let parentContent = `
        <div>
            <h3 class="section-title">Data Orang Tua</h3>
            <div>
                <h4>Ayah</h4>
                <table>
                    <tr><th>Field</th><th>Value</th></tr>
                    <tr><td>Nama Ayah</td><td>${parents.nama_ayah || '-'}</td></tr>
                    <tr><td>NIK Ayah</td><td>${parents.nik_ayah || '-'}</td></tr>
                    <tr><td>Status Ayah</td><td>${parents.status_ayah || '-'}</td></tr>
                    <tr><td>Tempat/Tanggal Lahir Ayah</td><td>${parents.tempat_lahir_ayah || '-'}, ${parents.tanggal_lahir_ayah || '-'}</td></tr>
                    <tr><td>Pendidikan Ayah</td><td>${parents.pendidikan_ayah || '-'}</td></tr>
                    <tr><td>Pekerjaan Ayah</td><td>${parents.pekerjaan_ayah || '-'}</td></tr>
                    <tr><td>Penghasilan Ayah</td><td>${parents.penghasilan_ayah || '-'}</td></tr>
                </table>
            </div>
            <div>
                <h4>Ibu</h4>
                <table>
                    <tr><th>Field</th><th>Value</th></tr>
                    <tr><td>Nama Ibu</td><td>${parents.nama_ibu || '-'}</td></tr>
                    <tr><td>NIK Ibu</td><td>${parents.nik_ibu || '-'}</td></tr>
                    <tr><td>Status Ibu</td><td>${parents.status_ibu || '-'}</td></tr>
                    <tr><td>Tempat/Tanggal Lahir Ibu</td><td>${parents.tempat_lahir_ibu || '-'}, ${parents.tanggal_lahir_ibu || '-'}</td></tr>
                    <tr><td>Pendidikan Ibu</td><td>${parents.pendidikan_ibu || '-'}</td></tr>
                    <tr><td>Pekerjaan Ibu</td><td>${parents.pekerjaan_ibu || '-'}</td></tr>
                    <tr><td>Penghasilan Ibu</td><td>${parents.penghasilan_ibu || '-'}</td></tr>
                </table>
            </div>
    `;

    // Render Data Wali (jika ada)
    if (parents.nama_wali) {
        parentContent += `
            <div>
                <h4>Wali</h4>
                <table>
                    <tr><th>Field</th><th>Value</th></tr>
                    <tr><td>Nama Wali</td><td>${parents.nama_wali || '-'}</td></tr>
                    <tr><td>NIK Wali</td><td>${parents.nik_wali || '-'}</td></tr>
                    <tr><td>Alamat Wali</td><td>${parents.alamat || '-'}</td></tr>
                    <tr><td>Pekerjaan Wali</td><td>${parents.pekerjaan_wali || '-'}</td></tr>
                </table>
            </div>
        `;
    }
    parentContent += '</div>';
    contentContainer.insertAdjacentHTML('beforeend', parentContent);

    // Render Data Nilai
    const grades = formData.grades || [];
    if (grades.length > 0) {
        let gradeContent = `
            <div>
                <h3 class="section-title">Data Nilai</h3>
                <table>
                    <tr><th>Mata Pelajaran</th><th>Nilai</th></tr>
        `;
        grades.forEach((grade) => {
            gradeContent += `<tr><td>${grade.subject_name}</td><td>${grade.score}</td></tr>`;
        });
        gradeContent += '</table></div>';
        contentContainer.insertAdjacentHTML('beforeend', gradeContent);
    } else {
        contentContainer.insertAdjacentHTML('beforeend', '<p></p>');
    }
}
