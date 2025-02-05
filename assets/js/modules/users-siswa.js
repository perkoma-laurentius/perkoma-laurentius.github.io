import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { showToast } from '../config/toast.js';

/**
 * Inisialisasi halaman Student
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const paginationContainer = document.createElement("div");
    paginationContainer.className = "d-flex justify-content-between align-items-center p-3";
    document.querySelector(".card-datatable").appendChild(paginationContainer);

    let currentPage = 1;

    /**
     * Fetch siswa dari server dan render ke dalam tabel
     */
    async function fetchStudents(page = 1) {
        try {
            const response = await NetworkHelper.get(`${ENDPOINTS.STUDENTS.GET_STUDENTS}?page=${page}&size=10`);

            if (response) {
                const { items, pagination } = response;

                renderTable(items); // Render data ke tabel
                renderPagination(pagination); // Render navigasi pagination
            } else {
                console.error("Failed to fetch students:", response.message);
                showToast("Gagal mengambil data siswa!", "danger");
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            showToast("Terjadi kesalahan saat mengambil data siswa.", "danger");
        }
    }

    /**
     * Render data siswa ke dalam tabel
     * @param {Array} data - Data siswa dari API
     */
    function renderTable(data) {
        tableBody.innerHTML = "";

        data.forEach((student, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${student.id}</td>
                    <td>${student.nis || "Tidak Tersedia"}</td>
                    <td>${student.nama_lengkap || "Tidak Tersedia"}</td>
                    <td>${student.tempat_lahir || "Tidak Tersedia"}</td>
                    <td>${new Date(student.tanggal_lahir).toLocaleDateString()}</td>
                    <td>${student.jenis_kelamin === "P" ? "Perempuan" : "Laki-Laki"}</td>
                    <td>${student.agama || "Tidak Tersedia"}</td>
                    <td>${student.no_telepon || "Tidak Tersedia"}</td>
                    <td>${student.user?.email || "Tidak Tersedia"}</td>
                    <td>${student.status || "Tidak Tersedia"}</td>
                    <td>${new Date(student.updated_at).toLocaleDateString()}</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });
    }

    /**
     * Render navigasi pagination
     */
    function renderPagination(pagination) {
        paginationContainer.innerHTML = "";

        const prevBtn = document.createElement("button");
        prevBtn.className = "btn btn-sm btn-secondary";
        prevBtn.textContent = "Previous";
        prevBtn.disabled = !pagination.urls.prev;
        prevBtn.addEventListener("click", () => {
            if (pagination.urls.prev) {
                currentPage--;
                fetchStudents(currentPage);
            }
        });

        const pageInfo = document.createElement("span");
        pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;

        const nextBtn = document.createElement("button");
        nextBtn.className = "btn btn-sm btn-secondary";
        nextBtn.textContent = "Next";
        nextBtn.disabled = !pagination.urls.next;
        nextBtn.addEventListener("click", () => {
            if (pagination.urls.next) {
                currentPage++;
                fetchStudents(currentPage);
            }
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
    }

    /**
 * Tambah data siswa baru
 */
/**
 * Tambah data siswa baru
 */
async function createStudent() {
    const requestBody = {
        email: document.getElementById("email").value.trim(),
        nis: document.getElementById("nis").value.trim(),
        namaLengkap: document.getElementById("namaLengkap").value.trim(),
        tempatLahir: document.getElementById("tempatLahir").value.trim(),
        tanggalLahir: document.getElementById("tanggalLahir").value.trim(),
        jenisKelamin: document.getElementById("jenisKelamin").value.trim(),
        agama: document.getElementById("agama").value.trim(),
        alamat: document.getElementById("alamat").value.trim(),
        noTelepon: document.getElementById("noTelepon").value.trim(),
        tanggalMasuk: document.getElementById("tanggalMasuk").value.trim(),
        status: document.getElementById("status").value.trim(),
        catatanKhusus: document.getElementById("catatanKhusus").value.trim(),
    };

    try {
        const response = await NetworkHelper.post(ENDPOINTS.STUDENTS.CREATE_STUDENTS, requestBody);

        if (response.message === "Student created successfully") {
            showToast("Siswa berhasil ditambahkan!", "success");
            fetchStudents(); // Refresh data siswa
            document.getElementById("editStudentForm").reset(); // Reset form setelah berhasil
            const addStudentModal = bootstrap.Modal.getInstance(document.getElementById("editStudent"));
            addStudentModal.hide();
        } else {
            console.error("Failed to add student:", response.message);
            showToast("Gagal menambahkan siswa, coba lagi.", "danger");
        }
    } catch (error) {
        console.error("Error adding student:", error);
        showToast("Terjadi kesalahan saat menambahkan siswa.", "danger");
    }
}


    // Tambahkan event listener untuk tombol tambah siswa
    const addNewRecordBtn = document.getElementById("addNewStudentBtn");
    const editStudentForm = document.getElementById("editStudentForm");

    addNewRecordBtn.addEventListener("click", () => {
        document.getElementById("editStudentForm").reset(); // Reset form sebelum digunakan
        const addStudentModal = new bootstrap.Modal(document.getElementById("editStudent"));
        addStudentModal.show();

        editStudentForm.onsubmit = async (e) => {
            e.preventDefault();
            await createStudent();
        };
    });


    fetchStudents(currentPage); // Fetch data siswa saat halaman di-load
}
