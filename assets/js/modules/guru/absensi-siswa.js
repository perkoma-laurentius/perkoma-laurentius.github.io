import { NetworkHelper } from '../../config/networkHelper.js';
import { ENDPOINTS } from '../../config/endpoint.js';
import { showToast } from '../../config/toast.js';
import { pageScripts } from '../../config/routes.js';

/**
 * Inisialisasi halaman Kelola Siswa
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const addStudentClassModal = new bootstrap.Modal(document.getElementById("editUser"));
    const paginationContainer = document.createElement("div");
    paginationContainer.className = "d-flex justify-content-between align-items-center p-3";
    document.querySelector(".card-datatable").appendChild(paginationContainer);

    let currentPage = 1;
    const kelasId = localStorage.getItem("kelasId");
    const jadwal_pelajaran_id = localStorage.getItem("jadwalPelajaranId");

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
            const response = await NetworkHelper.get(`${ENDPOINTS.STUDENT_CLASSES.GET_BY_CLASS_TEACHERS}/${kelasId}/schedules/${jadwal_pelajaran_id}?page=${page}&size=10`);
            if (response && response.status && response.data) {
                const { items, pagination } = response.data;
    
                // Render tabel dengan data items
                renderTable(items);
    
                // Render navigasi paginasi
                renderPagination(pagination);
            } else {
                console.error("Failed to fetch student classes:", response?.message || "Unknown error");
                showToast("Gagal mengambil data student classes!", "danger");
            }
        } catch (error) {
            console.error("Error fetching student classes:", error);
            showToast("Terjadi kesalahan saat mengambil data student classes.", "danger");
        }
    }
    

    /**
     * Render data student classes ke tabel
     * @param {Array} data - Data student classes
     */
    function renderTable(data) {
        tableBody.innerHTML = "";
    
        data.forEach((studentClass, index) => {
            const attendanceStatus = studentClass.kehadiran.length > 0 ? studentClass.kehadiran[0].status : null;
    
            let actionButtons;
    
            if (attendanceStatus === "Hadir") {
                actionButtons = `
                    <button class="btn btn-sm btn-success hadir-btn" data-id="${studentClass.student_id}" disabled>
                        Hadir
                    </button>
                `;
            } else if (attendanceStatus === "Sakit") {
                actionButtons = `
                    <button class="btn btn-sm btn-warning sakit-btn" data-id="${studentClass.student_id}" disabled>
                        Sakit
                    </button>
                `;
            } else if (attendanceStatus === "Alpha") {
                actionButtons = `
                    <button class="btn btn-sm btn-danger alpha-btn" data-id="${studentClass.student_id}" disabled>
                        Alpha
                    </button>
                `;
            } else {
                actionButtons = `
                    <button class="btn btn-sm btn-success hadir-btn" data-id="${studentClass.student_id}">
                        Hadir
                    </button>
                    <button class="btn btn-sm btn-warning sakit-btn" data-id="${studentClass.student_id}">
                        Sakit
                    </button>
                    <button class="btn btn-sm btn-danger alpha-btn" data-id="${studentClass.student_id}">
                        Alpha
                    </button>
                `;
            }
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${studentClass.student?.nama_lengkap || "-"}</td>
                    <td>${studentClass.student?.nis || "-"}</td>
                    <td>${studentClass.student?.jenis_kelamin || "-"}</td>
                    <td>${studentClass.student?.tempat_lahir || "-"}</td>
                    <td>${new Date(studentClass.student?.tanggal_lahir).toLocaleDateString()}</td>
                    <td style="text-align: center;">
                        ${actionButtons}
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });
    
        // Event listener untuk tombol Hadir
        document.querySelectorAll(".hadir-btn").forEach(button => {
            if (!button.disabled) {
                button.addEventListener("click", () => {
                    const id = button.getAttribute("data-id");
                    handleAttendance(id, "Hadir");
                });
            }
        });
    
        // Event listener untuk tombol Sakit
        document.querySelectorAll(".sakit-btn").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                handleAttendance(id, "Sakit");
            });
        });
    
        // Event listener untuk tombol Alpha
        document.querySelectorAll(".alpha-btn").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                handleAttendance(id, "Alpha");
            });
        });
    }
    
    
    /**
     * Fungsi untuk menangani absensi siswa
     * @param {string} studentId - ID siswa
     * @param {string} status - Status kehadiran ("Hadir", "Sakit", "Alpha")
     */
    async function handleAttendance(id, status) {
        try {
            const response = await NetworkHelper.post(`${ENDPOINTS.STUDENT_CLASSES.ATTENDANCE}`, {
                student_class_id: id,
                status: status,
            });

            if (response.message === "Attendance updated successfully") {
                showToast(`Status kehadiran berhasil diperbarui menjadi ${status}`, "success");
            } else {
                showToast(`Gagal memperbarui status kehadiran: ${response.message}`, "danger");
            }
        } catch (error) {
            console.error("Error updating attendance:", error);
            showToast("Terjadi kesalahan saat memperbarui status kehadiran.", "danger");
        }
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
     * Fungsi untuk menangani absensi siswa
     * @param {string} studentClassId - ID student_class
     * @param {string} status - Status kehadiran ("Hadir", "Sakit", "Alpha")
     */
    async function handleAttendance(studentClassId, status) {
        const semesterId = parseInt(localStorage.getItem("semesterId"));
        const jadwalPelajaranId = parseInt(localStorage.getItem("jadwalPelajaranId"));
        const kelasId = parseInt(localStorage.getItem("kelasId"));
        const studentId = parseInt(studentClassId);


        if (!semesterId || !jadwalPelajaranId || !kelasId || !studentId) {
            showToast("Data jadwal tidak lengkap. Harap muat ulang halaman.", "danger");
            return;
        }

        let keterangan = "On time";

        if (status === "Alpha") {
            // Jika status Alpha, tampilkan modal untuk input keterangan
            const inputKeterangan = prompt("Masukkan keterangan untuk Alpha:");
            if (!inputKeterangan) {
                showToast("Keterangan harus diisi untuk Alpha.", "danger");
                return;
            }
            keterangan = inputKeterangan;
        } else if (status === "Sakit") {
            keterangan = "Tidak Masuk";
        }

        const payload = {
            student_id: studentId,
            jadwal_pelajaran_id: jadwalPelajaranId,
            semester_tahun_ajaran_id: semesterId,
            tanggal: new Date().toISOString().split("T")[0], // Tanggal saat ini
            status: status,
            keterangan: keterangan,
        };

        try {
            const response = await NetworkHelper.post(`${ENDPOINTS.STUDENT_CLASSES.ATTENDANCE}`, payload);

            if (response.statusCode === 200) {
                showToast(`Kehadiran berhasil diperbarui: ${status}`, "success");
                fetchStudentClasses(currentPage);
            } else if (response.statusCode === 201) {
                showToast(`Kehadiran berhasil dibuat: ${status}`, "success");
                fetchStudentClasses(currentPage);
            } else {
                showToast(`Gagal memperbarui kehadiran: ${response.message}`, "danger");
                fetchStudentClasses(currentPage);

            }
    
        } catch (error) {
            console.error("Error updating attendance:", error);
            showToast("Terjadi kesalahan saat memperbarui status kehadiran.", "danger");
        }
    }




    

    fetchStudentClasses(currentPage);
}
