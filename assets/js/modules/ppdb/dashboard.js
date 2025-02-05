import { NetworkHelper } from '../../config/networkHelper.js';
import { ENDPOINTS } from '../../config/endpoint.js';
import { showToast } from '../../config/toast.js';
import { navigate } from '../main.js';
import { loadAnnouncements } from '../announcement.js';
import { generatePDF } from '../../config/generatePDF.js';

/**
 * Inisialisasi halaman Student Registration
 */
export function init() {
    const userNameElement = document.getElementById('user-name'); // Elemen untuk menampilkan nama lengkap
    const studentRegistrationId = localStorage.getItem('student_registration_id');
    loadAnnouncements();
    if (studentRegistrationId) {
        fetchAndUpdateAccountStatus(studentRegistrationId);
        getStudentRegistrationById(studentRegistrationId);
        getFormStatus(studentRegistrationId); // Panggil status form setelah data siswa
    } else {
        console.warn('Student registration ID tidak ditemukan di localStorage.');
        // showToast('Student registration ID tidak ditemukan.', 'warning');
        setupNewUserFlow();

    }

    /**
     * Fetch Student Registration by ID
     * @param {number} id - Student Registration ID
     */
    async function getStudentRegistrationById(id) {
        try {
            const response = await NetworkHelper.get(ENDPOINTS.STUDENT_REGISTRATIONS.GET_BY_ID(id));
            const studentData = response.data;

            if (studentData) {
                document.getElementById('user-name').textContent = studentData.nama_lengkap;

                const createdDate = new Date(studentData.created_at);
                const formattedDate = new Intl.DateTimeFormat('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }).format(createdDate);

                document.getElementById('user-created-date').textContent = formattedDate;
            } else {
                console.error('Student registration data not found');
            }
        } catch (error) {
            console.error('Error fetching student registration:', error);
        }
    }

    /**
     * Setup flow for new user without student_registration_id
     */
    function setupNewUserFlow() {
        // Update semua status menjadi Belum Lengkap
        updateStatusElement('status-siswa', 0, 'siswa', 'Data Siswa', 'DATA_SISWA');
        updateStatusElement('status-orangtua', 0, 'orangtua', 'Data Orang Tua', 'DATA_ORANGTUA');
        updateStatusElement('status-nilai', 0, 'nilai', 'Data Nilai', 'DATA_NILAI');

        // Sembunyikan progress bar
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';
            progressBar.className = 'progress-bar bg-danger';
        }
    }

    /**
     * Fetch Form Completion Status by Student Registration ID
     * @param {number} studentRegistrationId - ID of the student registration
     */
    let toastShown = false; // Variable untuk memastikan toast hanya muncul sekali

    async function getFormStatus(studentRegistrationId) {
        try {
            const response = await NetworkHelper.get(ENDPOINTS.FORM_STATUS.GET_BY_STUDENT_ID(studentRegistrationId));
            const formStatus = response.data;

            if (formStatus) {
                updateStatusElement('status-siswa', formStatus.is_student_form_complete, 'siswa', 'Data Siswa', 'DATA_SISWA');
                updateStatusElement('status-orangtua', formStatus.is_parent_form_complete, 'orangtua', 'Data Orang Tua', 'DATA_ORANGTUA');
                updateStatusElement('status-nilai', formStatus.is_grades_complete, 'nilai', 'Data Nilai', 'DATA_NILAI');
            } else {
                console.error('Form status not found');
            }
        } catch (error) {
            if (error.response && error.response.status === 404 && !toastShown) {
                showToast('Silakan lengkapi data Anda.', 'warning');
                toastShown = true; // Set agar toast hanya muncul sekali
            }
            console.error('Error fetching form status:', error);
        }
    }

    /**
     * Update status badge and button based on completion status
     * @param {string} elementId - ID of the status badge element
     * @param {number} status - 1 for complete, 0 for incomplete
     * @param {string} dataType - Type of data (e.g., siswa, orangtua, nilai)
     * @param {string} title - Title of the card
     * @param {string} route - Route name for navigation
     */
    function updateStatusElement(elementId, status, dataType, title, route) {
        const statusElement = document.getElementById(elementId);
        const button = document.querySelector(`button[onclick="lengkapiData('${dataType}')"]`);
        const card = button.closest('.card');

        if (status === 1) {
            statusElement.textContent = 'Sudah Lengkap';
            statusElement.className = 'badge bg-label-success';
            card.className = `card card-border-shadow-success h-100`;
            button.textContent = `Edit ${title}`;
            button.className = 'btn btn-success btn-sm mt-2';
        } else {
            statusElement.textContent = 'Belum Lengkap';
            statusElement.className = 'badge bg-label-danger';
            card.className = `card card-border-shadow-danger h-100`;
            button.textContent = `Lengkapi Data`;
            button.className = `btn btn-danger btn-sm mt-2`;
        }

        // Tambahkan event listener untuk navigasi
        button.addEventListener('click', () => navigate(route));
    }

    /**
     * Replace Status Akun Berdasarkan Status Pendaftaran
     * @param {string} status - Status pendaftaran dari API
     */
    function updateAccountStatus(status) {
        const statusContainer = document.getElementById('status-akun');
        let title = '';
        let description = '';
        let statusClass = '';

        switch (status) {
            case 'Pending':
                title = 'Akun Belum Diverifikasi';
                description = 'Anda belum menyelesaikan proses verifikasi akun. Harap segera periksa email untuk menyelesaikan verifikasi.';
                statusClass = 'text-warning';
                break;
            case 'Terdaftar':
                title = 'Akun Terdaftar';
                description = 'Selamat! Akun Anda sudah terdaftar. Anda dapat melanjutkan ke tahap berikutnya.';
                statusClass = 'text-primary';
                break;
            case 'Validasi':
                title = 'Sedang Proses Validasi';
                description = 'Data Anda sedang dalam proses validasi. Harap tunggu informasi lebih lanjut.';
                statusClass = 'text-info';
                break;
            case 'Wawancara':
                title = 'Jadwal Wawancara';
                description = 'Silakan hadir sesuai jadwal wawancara yang telah diberikan.';
                statusClass = 'text-secondary';
                break;
            case 'Daftar Ulang':
                title = 'Siap untuk Daftar Ulang';
                description = 'Harap segera menyelesaikan proses daftar ulang untuk melanjutkan.';
                statusClass = 'text-success';
                break;
            case 'Diterima':
                title = 'Selamat, Anda Diterima!';
                description = 'Selamat! Anda telah diterima. Harap periksa informasi terkait langkah berikutnya.';
                statusClass = 'text-success';
                break;
            default:
                title = 'Status Tidak Diketahui';
                description = 'Status akun Anda belum tersedia. Harap hubungi pihak administrasi.';
                statusClass = 'text-danger';
                break;
        }

        statusContainer.innerHTML = `
            <h5 class="mb-2" style="font-size: 24px; font-weight: bold; color: #343a40;">Status Akun</h5>
            <p class="text-muted mb-4" style="font-size: 18px;">Informasi terkini mengenai status akun Anda</p>
            <h2 class="fw-bold ${statusClass} mb-3" style="font-size: 32px;">${title}</h2>
            <p class="text-muted" style="font-size: 20px;">${description}</p>
        `;
    }

    /**
     * Fetch Student Registration by ID dan Update Status Akun
     * @param {number} id - Student Registration ID
     */
    async function fetchAndUpdateAccountStatus(id) {
        try {
            const response = await NetworkHelper.get(ENDPOINTS.STUDENT_REGISTRATIONS.GET_BY_ID(id));
            const studentData = response.data;

            if (studentData) {
                updateAccountStatus(studentData.status_pendaftaran); // Update status akun
            } else {
                console.error('Student registration data not found');
            }
        } catch (error) {
            console.error('Error fetching student registration:', error);
        }
    }

    /**
 * Fetch Form Completion Status by Student Registration ID
 * @param {number} studentRegistrationId - ID of the student registration
 */
async function getFormStatus(studentRegistrationId) {
    try {
        const response = await NetworkHelper.get(ENDPOINTS.FORM_STATUS.GET_BY_STUDENT_ID(studentRegistrationId));
        const formStatus = response.data;

        if (formStatus) {
            updateStatusElement('status-siswa', formStatus.is_student_form_complete, 'siswa', 'Data Siswa', 'DATA_SISWA');
            updateStatusElement('status-orangtua', formStatus.is_parent_form_complete, 'orangtua', 'Data Orang Tua', 'DATA_ORANGTUA');
            updateStatusElement('status-nilai', formStatus.is_grades_complete, 'nilai', 'Data Nilai', 'DATA_NILAI');

            // Update progress bar
            updateProgressBar(formStatus);
        } else {
            console.error('Form status not found');
        }
    } catch (error) {
        if (error.response && error.response.status === 404 && !toastShown) {
            showToast('Silakan lengkapi data Anda.', 'warning');
            toastShown = true; // Set agar toast hanya muncul sekali
        }
        console.error('Error fetching form status:', error);
    }
}
/**
 * Show the button to print the form if all sections are completed.
 */
function showPrintButton() {
    const printButtonContainer = document.getElementById('print-button-container');
    if (!printButtonContainer) return;

    // Clear existing content
    printButtonContainer.innerHTML = '';

    // Create button element
    const printButton = document.createElement('button');
    printButton.textContent = 'Cetak Formulir';
    printButton.className = 'btn btn-primary';

    // Add event listener
    printButton.addEventListener('click', printForm);

    // Append button to the container
    printButtonContainer.appendChild(printButton);
}
async function printForm() {
 

    // Navigasi ke halaman PRINT_OUT
    navigate('PRINT_OUT');
}



/**
 * Update progress bar berdasarkan status form
 * @param {object} formStatus - Status form dari API
 */
function updateProgressBar(formStatus) {
    const progressBar = document.getElementById('progress-bar');
    let completedSteps = 0;

    if (formStatus.is_student_form_complete === 1) completedSteps++;
    if (formStatus.is_parent_form_complete === 1) completedSteps++;
    if (formStatus.is_grades_complete === 1) completedSteps++;

    const progressPercentage = (completedSteps / 3) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.setAttribute('aria-valuenow', progressPercentage);
    progressBar.textContent = `${progressPercentage.toFixed(0)}%`;

    // Ubah warna progress bar berdasarkan progress
    if (progressPercentage === 100) {
        progressBar.className = 'progress-bar bg-success';
        showPrintButton();  // Show print button if all forms are complete
    } else if (progressPercentage >= 50) {
        progressBar.className = 'progress-bar bg-warning';
    } else {
        progressBar.className = 'progress-bar bg-danger';
    }
}


}
