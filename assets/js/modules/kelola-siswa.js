import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { showToast } from '../config/toast.js';
import { pageScripts } from '../config/routes.js';

/**
 * Inisialisasi halaman Kelola Siswa
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const addStudentClassModal = new bootstrap.Modal(document.getElementById("editUser"));
    const addNewRecordBtn = document.getElementById("addNewRecordBtn");
    const paginationContainer = document.createElement("div");
    paginationContainer.className = "d-flex justify-content-between align-items-center p-3";
    document.querySelector(".card-datatable").appendChild(paginationContainer);

    let currentPage = 1;
    const kelasId = localStorage.getItem("kelasId");

    if (!kelasId) {
        showToast("Kelas ID tidak ditemukan! Kembali ke halaman kelas.", "danger");
        window.location.href = pageScripts.KELAS.fileName;
        return;
    }

    /**
     * Fetch data student classes berdasarkan kelasId dan render ke tabel
     */
    async function fetchStudentClasses(page = 1) {
        try {
            console.log(`Fetching data for kelasId: ${kelasId}, page: ${page}`);
            const response = await NetworkHelper.get(`${ENDPOINTS.STUDENT_CLASSES.GET_BY_CLASS}/${kelasId}?page=${page}&size=10`);

            if (response && response.items) {
                console.log("Data fetched successfully:", response);
                renderTable(response.items); // Render data ke tabel
                renderPagination(response.pagination); // Render navigasi pagination
            } else {
                console.error("Failed to fetch student classes:", response?.message || "Unknown error");
                showToast("Gagal mengambil data student classes!", "danger");
            }
        } catch (error) {
            // showToast("Terjadi kesalahan saat mengambil data student classes.", "danger");
        }
    }

    /**
     * Render data student classes ke tabel
     * @param {Array} data - Data student classes
     */
    function renderTable(data) {
        tableBody.innerHTML = "";

        data.forEach((studentClass, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${studentClass.student?.nama_lengkap || "-"}</td>
                    <td>${studentClass.student?.nis || "-"}</td>
                    <td>${studentClass.student?.jenis_kelamin || "-"}</td>
                    <td>${studentClass.student?.tempat_lahir || "-"}</td>
                    <td>${new Date(studentClass.student?.tanggal_lahir).toLocaleDateString()}</td>
                    <td style="text-align: center;">
                        <button class="btn btn-sm btn-danger me-2 delete-btn" data-id="${studentClass.id}">
                            <i class="ti ti-trash"></i> Remove
                        </button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });

        // Tambahkan event listener untuk tombol Remove
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                handleRemoveStudentFromClass(id);
            });
        });
    }

    /**
     * Render navigasi pagination
     * @param {object} pagination - Objek pagination dari API
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
                fetchStudentClasses(currentPage);
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
                fetchStudentClasses(currentPage);
            }
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
    }

    /**
     * Remove student from class
     */
    async function handleRemoveStudentFromClass(id) {
        const confirmRemove = confirm("Apakah Anda yakin ingin menghapus student dari kelas ini?");
        if (!confirmRemove) return;

        try {
            const response = await NetworkHelper.delete(`${ENDPOINTS.STUDENT_CLASSES.REMOVE}/${id}`);

            if (response.message === "Student removed from class successfully") {
                showToast("Student berhasil dihapus dari kelas!", "success");
                fetchStudentClasses(currentPage);
            } else {
                console.error("Failed to remove student from class:", response?.message || "Unknown error");
                showToast("Gagal menghapus student dari kelas!", "danger");
            }
        } catch (error) {
            console.error("Error removing student from class:", error);
            showToast("Terjadi kesalahan saat menghapus student dari kelas.", "danger");
        }
    }

    addNewRecordBtn.addEventListener("click", async () => {
        console.log("Add New Record Button Clicked");
    
        try {
            // Memuat data siswa
            const studentResponse = await NetworkHelper.get(ENDPOINTS.STUDENTS.GET_STUDENTS);
            if (studentResponse && studentResponse.items) {
                const studentDropdown = document.getElementById("studentId");
                studentDropdown.innerHTML = '<option value="">Pilih Siswa</option>';
                studentResponse.items.forEach(student => {
                    const option = document.createElement("option");
                    option.value = student.id;
                    option.textContent = `${student.nama_lengkap} - ${student.nis}`;
                    studentDropdown.appendChild(option);
                });
            } else {
                showToast("Gagal memuat data siswa!", "danger");
            }
        } catch (error) {
            console.error("Error loading student data:", error);
            showToast("Terjadi kesalahan saat memuat data siswa.", "danger");
        }
    
        addStudentClassModal.show(); // Tampilkan modal
    });
    

    document.getElementById("bulkUpdateForm").addEventListener("submit", async (event) => {
        event.preventDefault(); // Cegah reload halaman
    
        const fileInput = document.getElementById("fileUpload");
        const file = fileInput.files[0];
    
        if (!file) {
            showToast("File tidak ditemukan. Harap unggah file terlebih dahulu.", "danger");
            return;
        }
    
        try {
            // Baca file menggunakan FileReader
            const fileContent = await readFileAsText(file);
    
            // Parse file berdasarkan format (CSV atau Excel)
            const studentsData = parseFileContent(file, fileContent);
    
            if (studentsData.length === 0) {
                showToast("Data siswa kosong atau tidak valid.", "danger");
                return;
            }
    
            const kelasId = localStorage.getItem("kelasId");
            if (!kelasId) {
                showToast("Kelas ID tidak ditemukan! Harap pilih kelas terlebih dahulu.", "danger");
                return;
            }
    
            // Kirim data ke endpoint BULK
            const response = await NetworkHelper.post(ENDPOINTS.STUDENT_CLASSES.BULK, {
                kelas_id: kelasId,
                students: studentsData,
            });
    
            // Handle respons sesuai dengan hasil bulk insert
            const { successCount, failedCount, failedInsertions } = response;
    
            if (successCount > 0) {
                showToast(`${successCount} siswa berhasil ditambahkan ke kelas.`, "success");
            }
    
            if (failedCount > 0) {
                showToast(
                    `${failedCount} siswa gagal ditambahkan ke kelas. Periksa alasan berikut:`,
                    "warning"
                );
    
                // Tampilkan alasan untuk kegagalan
                failedInsertions.forEach((failure) => {
                    console.warn(
                        `Siswa: ${failure.student.nama_lengkap} (NIS: ${failure.student.nis}) - Alasan: ${failure.reason}`
                    );
                    showToast(
                        `Gagal: ${failure.student.nama_lengkap} (NIS: ${failure.student.nis}). Alasan: ${failure.reason}`,
                        "danger"
                    );
                });
            }
    
            fetchStudentClasses(); // Refresh tabel
        } catch (error) {
            console.error("Error during bulk update:", error);
            // showToast("Terjadi kesalahan saat memproses bulk update.", "danger");
        }
    });
    
    /**
     * Helper: Membaca file sebagai teks
     */
    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    }
    
    /**
     * Helper: Parse konten file CSV atau Excel
     */
    function parseFileContent(file, fileContent) {
        if (file.name.endsWith(".csv")) {
            return parseCSV(fileContent);
        } else if (file.name.endsWith(".xlsx")) {
            return parseExcel(file);
        } else {
            showToast("Format file tidak didukung. Harap unggah file CSV atau Excel.", "danger");
            return [];
        }
    }
    
    /**
     * Helper: Parse CSV menjadi array objek
     */
    function parseCSV(csvContent) {
        const rows = csvContent.split("\n").filter((row) => row.trim() !== "");
        const headers = rows.shift().split(","); // Ambil header
    
        return rows.map((row) => {
            const values = row.split(",");
            return headers.reduce((obj, header, index) => {
                obj[header.trim()] = values[index].trim();
                return obj;
            }, {});
        });
    }
    
    /**
     * Helper: Parse Excel menjadi array objek
     */
    function parseExcel(file) {
        const workbook = XLSX.read(file, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
    
        return XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    }
    
    
    
    
    document.getElementById("editUserForm").addEventListener("submit", async (event) => {
        event.preventDefault();
    
        const studentId = document.getElementById("studentId").value;
        if (!studentId) {
            showToast("Pilih siswa terlebih dahulu!", "danger");
            return;
        }
    
        try {
            const response = await NetworkHelper.post(ENDPOINTS.STUDENT_CLASSES.CREATE, {
                student_id: studentId,
                kelas_id: kelasId // kelasId sudah diambil dari localStorage
            });
    
            if (response.message === "Student assigned to class successfully") {
                showToast("Siswa berhasil ditambahkan ke kelas!", "success");
                addStudentClassModal.hide(); // Tutup modal
                fetchStudentClasses(currentPage); // Refresh tabel
            } else {
                showToast("Gagal menambahkan siswa ke kelas!", "danger");
            }
        } catch (error) {
            console.error("Error adding student to class:", error);
            showToast("Terjadi kesalahan saat menambahkan siswa ke kelas.", "danger");
        }
    });
    document.getElementById("bulkUpdateBtn").addEventListener("click", () => {
        const bulkUpdateModal = new bootstrap.Modal(document.getElementById("bulkUpdateModal"));
        bulkUpdateModal.show();

      });
      
    // Fetch data saat halaman di-load
    fetchStudentClasses(currentPage);
}
