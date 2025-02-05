import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { showToast } from '../config/toast.js';

/**
 * Inisialisasi halaman Kehadiran
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const addAttendanceModal = new bootstrap.Modal(document.getElementById("editAttendance"));
    const addNewRecordBtn = document.getElementById("addNewRecordBtn");
    const editAttendanceForm = document.getElementById("editAttendanceForm");

    const paginationContainer = document.createElement("div");
    paginationContainer.className = "d-flex justify-content-between align-items-center p-3";
    document.querySelector(".card-datatable").appendChild(paginationContainer);

    let currentPage = 1;

    function populateDropdown(elementId, data, formatOptionText) {
        const dropdown = document.getElementById(elementId);
        dropdown.innerHTML = '<option value="">Pilih...</option>'; // Reset options
    
        if (!data || !Array.isArray(data)) {
            console.error(`Invalid data for dropdown ${elementId}:`, data);
            return;
        }
    
        data.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.id;
            option.textContent = formatOptionText(item);
            dropdown.appendChild(option);
        });
    }
    
    async function preloadDropdownData() {
        try {
            const [studentsResponse, scheduleResponse, semesterResponse] = await Promise.all([
                NetworkHelper.get(`${ENDPOINTS.STUDENTS.GET_STUDENTS}?page=1&size=100`),
                NetworkHelper.get(`${ENDPOINTS.JADWAL_PELAJARAN.GET_LIST}?page=1&size=100`),
                NetworkHelper.post(ENDPOINTS.SEMESTER.LIST, { page: 1, size: 100 })
            ]);
    
            populateDropdown(
                "studentId",
                studentsResponse?.items || [], 
                (item) => `${item.id} - ${item.user?.email || 'No Email'} - ${item.nama_lengkap}` // Format opsi dropdown
            );
            
            populateDropdown(
                "jadwalPelajaranId",
                scheduleResponse?.data?.items || [],
                (item) => `${item.id} - ${item.nama_pelajaran} (${item.nama_guru}) - ${item.hari} (${item.jam_mulai} - ${item.jam_selesai})` // Format opsi dropdown
            );
            
            populateDropdown(
                "semesterTahunAjaranId",
                semesterResponse?.items || [],
                (item) => `${item.tahun_ajaran} - ${item.semester}`
            );
        } catch (error) {
            console.error("Error loading dropdown data:", error);
            showToast("Gagal memuat data untuk form. Silakan coba lagi.", "danger");
        }
    }

    function populateDropdown(elementId, data, formatOptionText) {
        const dropdown = document.getElementById(elementId);
        dropdown.innerHTML = '<option value="">Pilih...</option>'; // Reset options
    
        if (!data || !Array.isArray(data)) {
            console.error(`Invalid data for dropdown ${elementId}:`, data);
            return;
        }
    
        data.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.id;
            option.textContent = formatOptionText(item);
            dropdown.appendChild(option);
        });
    }

    async function fetchAttendances(page = 1) {
        try {
            const response = await NetworkHelper.get(`${ENDPOINTS.KEHADIRAN.GET_LIST}?page=${page}&size=10`);
    
            if (response.data && response.data.items) {
                renderTable(response.data); // Render data ke tabel
                renderPagination(response.data.pagination); // Render navigasi pagination
            } else {
                console.error("Failed to fetch kehadiran:", response.message);
                showToast("Gagal mengambil data kehadiran!", "danger");
            }
        } catch (error) {
            console.error("Error fetching kehadiran:", error);
            showToast("Terjadi kesalahan saat mengambil data kehadiran.", "danger");
        }
    }
    

    function renderTable(data) {
        if (!data || !data.items) {
            console.error('Invalid data structure:', data);
            showToast('Data kehadiran tidak valid atau kosong.', 'danger');
            return;
        }
    
        tableBody.innerHTML = "";
    
        data.items.forEach((attendance, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${attendance.id}</td>
                    <td>${attendance.nama_siswa}</td>
                    <td>${attendance.nama_pelajaran}</td>
                    <td>${attendance.nama_semester}</td>
                    <td>${attendance.tanggal}</td>
                    <td>${attendance.status}</td>
                    <td>${attendance.keterangan}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-2 edit-btn" data-id="${attendance.id}">
                            <i class="ti ti-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${attendance.id}">
                            <i class="ti ti-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });
    
        document.querySelectorAll(".edit-btn").forEach((button) => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                fetchAttendanceById(id);
            });
        });
    
        document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                handleDeleteAttendance(id);
            });
        });
    }

    function renderPagination(pagination) {
        paginationContainer.innerHTML = ""; // Reset pagination container
    
        const prevBtn = document.createElement("button");
        prevBtn.className = "btn btn-sm btn-secondary";
        prevBtn.textContent = "Previous";
        prevBtn.disabled = !pagination.urls.prev;
        prevBtn.addEventListener("click", () => {
            if (pagination.urls.prev) {
                currentPage--;
                fetchAttendances(currentPage);
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
                fetchAttendances(currentPage);
            }
        });
    
        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
    }
    
    async function fetchAttendanceById(attendanceId) {
        try {
            await preloadDropdownData();

            const response = await NetworkHelper.get(`${ENDPOINTS.KEHADIRAN.GET_BY_ID(attendanceId)}`);

            if (response) {
                resetForm("edit", response);

                document.getElementById("studentId").value = response.student_id || "";
                document.getElementById("jadwalPelajaranId").value = response.jadwal_pelajaran_id || "";
                document.getElementById("semesterTahunAjaranId").value = response.semester_tahun_ajaran_id || "";
                document.getElementById("tanggal").value = response.tanggal || "";
                document.getElementById("status").value = response.status || "";
                document.getElementById("keterangan").value = response.keterangan || "";

                addAttendanceModal.show();

                editAttendanceForm.onsubmit = async (e) => {
                    e.preventDefault();
                    await handleUpdateAttendance(attendanceId);
                };
            } else {
                showToast("Gagal memuat data kehadiran!", "danger");
            }
        } catch (error) {
            console.error("Error fetching kehadiran:", error);
            showToast("Terjadi kesalahan saat memuat data kehadiran.", "danger");
        }
    }

    function resetForm(mode, data = {}) {
        
        document.getElementById("studentId").value = data.student_id || "";
        document.getElementById("jadwalPelajaranId").value = data.jadwal_pelajaran_id || "";
        document.getElementById("semesterTahunAjaranId").value = data.semester_tahun_ajaran_id || "";
        document.getElementById("tanggal").value = data.tanggal || "";
        document.getElementById("status").value = data.status || "";
        document.getElementById("keterangan").value = data.keterangan || "";
    }
    async function handleAddAttendance() {
        const requestBody = {
            student_id: document.getElementById("studentId").value.trim(),
            jadwal_pelajaran_id: document.getElementById("jadwalPelajaranId").value.trim(),
            semester_tahun_ajaran_id: document.getElementById("semesterTahunAjaranId").value.trim(),
            tanggal: document.getElementById("tanggal").value.trim(),
            status: document.getElementById("status").value.trim(),
            keterangan: document.getElementById("keterangan").value.trim(),
        };
    
        // Validasi form
        if (!requestBody.student_id || !requestBody.jadwal_pelajaran_id || !requestBody.semester_tahun_ajaran_id || !requestBody.tanggal || !requestBody.status) {
            showToast("Semua field wajib diisi!", "danger");
            return;
        }
    
        try {
            const response = await NetworkHelper.post(ENDPOINTS.KEHADIRAN.ADD, requestBody);
    
            if (response && response.statusCode === 201) {
                showToast(
                    `Kehadiran berhasil ditambahkan! 
                     ID: ${response.data.id}, 
                     Siswa: ${response.data.student_id}, 
                     Tanggal: ${new Date(response.data.tanggal).toLocaleDateString()}`,
                    "success"
                );
    
                addAttendanceModal.hide(); // Tutup modal
                fetchAttendances(currentPage); // Refresh tabel
            } else {
                console.error("Failed to add attendance:", response?.message || "Unknown error");
                showToast(response?.message || "Gagal menambahkan kehadiran, coba lagi.", "danger");
            }
        } catch (error) {
            console.error("Error adding attendance:", error);
            showToast("Terjadi kesalahan saat menambahkan kehadiran.", "danger");
        }
    }
    

    async function handleUpdateAttendance(attendanceId) {
        const requestBody = {
            student_id: document.getElementById("studentId").value.trim(),
            jadwal_pelajaran_id: document.getElementById("jadwalPelajaranId").value.trim(),
            semester_tahun_ajaran_id: document.getElementById("semesterTahunAjaranId").value.trim(),
            tanggal: document.getElementById("tanggal").value.trim(),
            status: document.getElementById("status").value.trim(),
            keterangan: document.getElementById("keterangan").value.trim(),
        };

        try {
            const response = await NetworkHelper.put(`${ENDPOINTS.KEHADIRAN.UPDATE(attendanceId)}`, requestBody);

            if (response.statusCode === 200) {
                showToast("Kehadiran updated successfully!", "success");
                addAttendanceModal.hide();
                fetchAttendances(currentPage);
            } else {
                console.error("Failed to update kehadiran:", response.message);
                showToast("Gagal memperbarui kehadiran, coba lagi.", "danger");
            }
        } catch (error) {
            console.error("Error updating kehadiran:", error);
            showToast("Terjadi kesalahan saat memperbarui kehadiran.", "danger");
        }
    }

    async function handleDeleteAttendance(attendanceId) {
        const userConfirmed = confirm("Apakah Anda yakin ingin menghapus kehadiran ini?");

        if (userConfirmed) {
            try {
                const response = await NetworkHelper.delete(`${ENDPOINTS.KEHADIRAN.DELETE(attendanceId)}`);

                if (response.statusCode === 200) {
                    showToast("Kehadiran deleted successfully!", "success");
                    fetchAttendances(currentPage);
                } else {
                    console.error("Failed to delete kehadiran:", response.message);
                    showToast("Gagal menghapus kehadiran, coba lagi.", "danger");
                }
            } catch (error) {
                console.error("Error deleting kehadiran:", error);
                showToast("Terjadi kesalahan saat menghapus kehadiran.", "danger");
            }
        }
    }

    addNewRecordBtn.addEventListener("click", async () => {
        await preloadDropdownData();
        resetForm("add");
        addAttendanceModal.show();

        editAttendanceForm.onsubmit = async (e) => {
            e.preventDefault();
            await handleAddAttendance();
        };
    });

    fetchAttendances(currentPage);
}
