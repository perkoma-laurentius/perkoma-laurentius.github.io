// Import helper modules
import { NetworkHelper } from '../../config/networkHelper.js';
import { ENDPOINTS } from '../../config/endpoint.js';
import { showToast } from '../../config/toast.js';
import { navigateToDashboard } from '../../config/back.js';

export function init() {
    console.log("Form Data Nilai Initialized");
    navigateToDashboard();
    const jalurId = localStorage.getItem('selectedJalurId'); // Ambil jalur_id dari localStorage
    const studentRegistrationId = localStorage.getItem('student_registration_id'); // Ambil student_registration_id dari localStorage

    if (!jalurId || !studentRegistrationId) {
        showToast('Jalur ID atau Student Registration ID tidak ditemukan.', 'warning');
        return;
    }

    getGradeRequirements(jalurId); // Ambil syarat nilai berdasarkan jalur ID
    getStudentGrades(studentRegistrationId); // Ambil data nilai siswa berdasarkan student_registration_id

    // Event listener untuk tombol Simpan
    const saveButton = document.querySelector('.btn-primary');
    saveButton.addEventListener('click', () => saveStudentGrades(studentRegistrationId));
}
function setLoading(isLoading) {
    const loader = document.getElementById('loading-indicator');
    if (isLoading) {
        loader.classList.remove('d-none'); // Show loading indicator
    } else {
        loader.classList.add('d-none'); // Hide loading indicator
    }
}
/**
 * Fetch Grade Requirements by Jalur ID dan buat form
 * @param {number} jalurId - Jalur ID
 */
async function getGradeRequirements(jalurId) {
    try {
        const response = await NetworkHelper.get(ENDPOINTS.GRADE_REQUIREMENTS.GET_BY_JALUR_ID(jalurId));
        const gradeRequirements = response.data;

        if (gradeRequirements && gradeRequirements.length > 0) {
            createForm(gradeRequirements);
        } else {
            console.warn('Tidak ada syarat nilai untuk jalur ini.');
            showToast('Tidak ada syarat nilai untuk jalur ini.', 'warning');
        }
    } catch (error) {
        console.error('Error fetching grade requirements:', error);
        showToast('Gagal mengambil data syarat nilai.', 'danger');
    }
}

/**
 * Fetch Student Grades by Student Registration ID dan isi form
 * @param {number} studentRegistrationId - Student Registration ID
 */
async function getStudentGrades(studentRegistrationId) {
    try {
        console.log(`Fetching grades for Student Registration ID: ${studentRegistrationId}`);
        console.log(`Endpoint: ${ENDPOINTS.STUDENT_GRADES.GET_BY_STUDENT_REGISTRATION_ID(studentRegistrationId)}`);

        const response = await NetworkHelper.get(ENDPOINTS.STUDENT_GRADES.GET_BY_STUDENT_REGISTRATION_ID(studentRegistrationId));
        const grades = response.data;

        if (grades && grades.length > 0) {
            console.log('Grades fetched successfully:', grades);
            populateForm(grades);
        } else {
            console.warn('Data nilai tidak ditemukan.');
            showToast('Data nilai tidak ditemukan. Silakan isi nilai baru.', 'info');
        }
    } catch (error) {
        console.error('Error fetching student grades:', error);
        // showToast('Gagal mengambil data nilai siswa.', 'danger');
    }
}


/**
 * Populate form fields dengan data nilai siswa
 * @param {Array} grades - Data nilai siswa dari API
 */
function populateForm(grades) {
    grades.forEach((grade) => {
        const inputField = document.getElementById(`${grade.subject_name}-score`);
        if (inputField) {
            inputField.value = grade.score;
        }
    });
}
function createForm(gradeRequirements) {
    const formContainer = document.getElementById('form-grade-container');
    formContainer.innerHTML = ''; // Kosongkan container sebelum mengisi ulang

    gradeRequirements.forEach((requirement) => {
        const { subject_name, minimum_score, description } = requirement;

        const formGroup = `
            <div class="col-md-6">
                <label class="form-label" for="${subject_name}-score">${subject_name}</label>
                <input 
                    type="number" 
                    id="${subject_name}-score" 
                    class="form-control" 
                    placeholder="Masukan nilai ${subject_name}" 
                    min="${minimum_score}" 
                    max="100" 
                    data-minimum-score="${minimum_score}" 
                />
                <small class="text-muted">Syarat minimum: ${minimum_score}. ${description}</small>
                <small id="${subject_name}-error" class="text-danger d-none">Nilai harus minimal ${minimum_score}.</small>
            </div>
        `;

        formContainer.insertAdjacentHTML('beforeend', formGroup);

        // Tambahkan event listener untuk validasi
        const inputField = document.getElementById(`${subject_name}-score`);
        inputField.addEventListener('input', (e) => validateInput(e, minimum_score, subject_name));
    });
}

/**
 * Validasi input nilai
 * @param {Event} event - Event input
 * @param {number} minimumScore - Nilai minimum
 * @param {string} subjectName - Nama mata pelajaran
 */
function validateInput(event, minimumScore, subjectName) {
    const value = parseFloat(event.target.value);
    const errorElement = document.getElementById(`${subjectName}-error`);

    if (isNaN(value) || value < minimumScore || value > 100) {
        // Tampilkan error jika nilai di bawah minimum atau di atas 100
        errorElement.textContent = `Nilai harus minimal ${minimumScore}.`;
        errorElement.classList.remove('d-none');
    } else {
        // Sembunyikan error jika nilai valid
        errorElement.classList.add('d-none');
    }
}
async function saveStudentGrades(studentRegistrationId) {
    try {
        setLoading(true); 
        const gradeData = getFormData();
        const invalidGrades = gradeData.filter(grade => grade.score < grade.minimum_score || grade.score > 100);

        if (invalidGrades.length > 0) {
            showToast('Terdapat nilai yang tidak valid. Periksa kembali.', 'warning');
            setLoading(false); 
            return;
        }

        await NetworkHelper.post(ENDPOINTS.STUDENT_GRADES.UPSERT_BY_STUDENT_REGISTRATION_ID(studentRegistrationId), gradeData);
        showToast('Data nilai berhasil disimpan.', 'success');
    } catch (error) {
        console.error('Error saving student grades:', error);
        showToast('Gagal menyimpan data nilai.', 'danger');
    } finally {
        setLoading(false); 
    }
}


/**
 * Get form data as an array of objects
 * @returns {Array} Form data
 */
function getFormData() {
    const inputs = document.querySelectorAll('#form-grade-container input');
    const grades = [];

    inputs.forEach((input) => {
        const subjectName = input.id.replace('-score', ''); // Hapus '-score' dari id input
        const score = parseFloat(input.value);
        if (!isNaN(score)) {
            grades.push({ subject_name: subjectName, score });
        }
    });

    return grades;
}
