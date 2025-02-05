import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { showToast } from '../config/toast.js';

/**
 * Inisialisasi halaman Jadwal Pelajaran
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const addScheduleModal = new bootstrap.Modal(document.getElementById("editSchedule"));
    const addNewRecordBtn = document.getElementById("addNewRecordBtn");
    const editScheduleForm = document.getElementById("editScheduleForm");

    const paginationContainer = document.createElement("div");
    paginationContainer.className = "d-flex justify-content-between align-items-center p-3";
    document.querySelector(".card-datatable").appendChild(paginationContainer);

    let currentPage = 1;

    async function preloadDropdownData() {
        try {
            const [kelasResponse, mataPelajaranResponse, teacherResponse, semesterResponse] = await Promise.all([
                NetworkHelper.get(`${ENDPOINTS.KELAS.GET_KELAS}?page=1&size=100`),
                NetworkHelper.get(`${ENDPOINTS.MATA_PELAJARAN.GET_MATA_PELAJARAN}?page=1&size=100`),
                NetworkHelper.get(`${ENDPOINTS.TEACHERS.GET_TEACHERS}?page=1&size=100`),
                NetworkHelper.post(ENDPOINTS.SEMESTER.LIST, { page: 1, size: 100 })
            ]);
    
            populateDropdown("kelasId", kelasResponse.items, (item) => `${item.nama_kelas} - ${item.tingkat}`);
            populateDropdown("mataPelajaranId", mataPelajaranResponse.items, (item) => `${item.nama_pelajaran} (${item.kode_pelajaran})`);
            populateDropdown("teacherId", teacherResponse.items, (item) => item.nama_lengkap);
            populateDropdown("semesterTahunAjaranId", semesterResponse.items, (item) => `${item.tahun_ajaran} - ${item.semester}`);
        } catch (error) {
            console.error("Error loading dropdown data:", error);
            showToast("Gagal memuat data untuk form. Silakan coba lagi.", "danger");
        }
    }
    

    function populateDropdown(elementId, data, formatOptionText) {
        const dropdown = document.getElementById(elementId);
        dropdown.innerHTML = '<option value="">Pilih...</option>'; // Reset options
    
        data.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.id;
            option.textContent = formatOptionText(item);
            dropdown.appendChild(option);
        });
    }
    

    /**
     * Fetch jadwal pelajaran dari server dan render ke dalam tabel
     */
    async function fetchSchedules(page = 1) {
        try {
            const response = await NetworkHelper.get(`${ENDPOINTS.JADWAL_PELAJARAN.GET_LIST}?page=${page}&size=10`);
    
            if (response.status && response.data) {
                console.log('API Response:', response.data); // Debugging
                renderTable(response.data); // Pass the 'data' object to renderTable
                renderPagination(response.data.pagination); // Pass the pagination details
            } else {
                console.error("Failed to fetch jadwal pelajaran:", response.message);
                showToast("Gagal mengambil data jadwal pelajaran!", "danger");
            }
        } catch (error) {
            console.error("Error fetching jadwal pelajaran:", error);
            showToast("Terjadi kesalahan saat mengambil data jadwal pelajaran.", "danger");
        }
    }
    

    /**
     * Fetch jadwal pelajaran berdasarkan ID
     */
    async function fetchScheduleById(scheduleId) {
        try {
            // Preload data dropdown
            await preloadDropdownData();
    
            const response = await NetworkHelper.get(`${ENDPOINTS.JADWAL_PELAJARAN.GET_BY_ID(scheduleId)}`);
    
            if (response) {
                resetForm("edit", response);
    
                // Isi data ke dalam form modal
                document.getElementById("kelasId").value = response.kelas_id || "";
                document.getElementById("mataPelajaranId").value = response.mata_pelajaran_id || "";
                document.getElementById("teacherId").value = response.teacher_id || "";
                document.getElementById("semesterTahunAjaranId").value = response.semester_tahun_ajaran_id || "";
                document.getElementById("hari").value = response.hari || "";
                document.getElementById("jamMulai").value = response.jam_mulai || "";
                document.getElementById("jamSelesai").value = response.jam_selesai || "";
    
                addScheduleModal.show();
    
                // Pastikan handleUpdateSchedule dipanggil saat form disubmit
                editScheduleForm.onsubmit = async (e) => {
                    e.preventDefault();
                    await handleUpdateSchedule(scheduleId);
                };
            } else {
                showToast("Gagal memuat data jadwal pelajaran!", "danger");
            }
        } catch (error) {
            console.error("Error fetching jadwal pelajaran:", error);
            showToast("Terjadi kesalahan saat memuat data jadwal pelajaran.", "danger");
        }
    }
    

    /**
     * Render data jadwal pelajaran ke dalam tabel
     */
    function renderTable(data) {
        if (!data || !data.items) {
            console.error('Invalid data structure:', data);
            showToast('Data jadwal pelajaran tidak valid atau kosong.', 'danger');
            return;
        }
    
        tableBody.innerHTML = "";
    
        data.items.forEach((schedule, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${schedule.id}</td>
                    <td>${schedule.kelas_id} - ${schedule.nama_kelas}</td>
                    <td>${schedule.mata_pelajaran_id} - ${schedule.nama_pelajaran}</td>
                    <td>${schedule.teacher_id} - ${schedule.nama_guru}</td>
                    <td>${schedule.semester_tahun_ajaran_id} - ${schedule.tahun_ajaran} (${schedule.semester})</td>
                    <td>${schedule.hari}</td>
                    <td>${schedule.jam_mulai}</td>
                    <td>${schedule.jam_selesai}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-2 edit-btn" data-id="${schedule.id}">
                            <i class="ti ti-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${schedule.id}">
                            <i class="ti ti-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });
    
        // Tambahkan event listener untuk tombol Edit
        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                fetchScheduleById(id);
            });
        });
    
        // Tambahkan event listener untuk tombol Delete
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                handleDeleteSchedule(id);
            });
        });
    }
    
    
    /**
     * Handle Update Jadwal Pelajaran
     */
    async function handleUpdateSchedule(scheduleId) {
        const requestBody = {
            kelas_id: document.getElementById("kelasId").value.trim(),
            mata_pelajaran_id: document.getElementById("mataPelajaranId").value.trim(),
            teacher_id: document.getElementById("teacherId").value.trim(),
            semester_tahun_ajaran_id: document.getElementById("semesterTahunAjaranId").value.trim(),
            hari: document.getElementById("hari").value.trim(),
            jam_mulai: document.getElementById("jamMulai").value.trim(),
            jam_selesai: document.getElementById("jamSelesai").value.trim(),
        };

        try {
            const response = await NetworkHelper.put(`${ENDPOINTS.JADWAL_PELAJARAN.UPDATE(scheduleId)}`, requestBody);

            if (response.status && response.code === "SUCCESS") {
                showToast("Jadwal pelajaran updated successfully!", "success");
                addScheduleModal.hide();
                fetchSchedules(currentPage);
            } else {
                console.error("Failed to update jadwal pelajaran:", response.message);
                showToast("Gagal memperbarui jadwal pelajaran, coba lagi.", "danger");
            }
        } catch (error) {
            console.error("Error updating jadwal pelajaran:", error);
            showToast("Terjadi kesalahan saat memperbarui jadwal pelajaran.", "danger");
        }
    }

    /**
     * Tambah Jadwal Pelajaran
     */
    async function handleAddSchedule() {
        const requestBody = {
            kelas_id: document.getElementById("kelasId").value.trim(),
            mata_pelajaran_id: document.getElementById("mataPelajaranId").value.trim(),
            teacher_id: document.getElementById("teacherId").value.trim(),
            semester_tahun_ajaran_id: document.getElementById("semesterTahunAjaranId").value.trim(),
            hari: document.getElementById("hari").value.trim(),
            jam_mulai: document.getElementById("jamMulai").value.trim(),
            jam_selesai: document.getElementById("jamSelesai").value.trim(),
        };

        try {
            const response = await NetworkHelper.post(ENDPOINTS.JADWAL_PELAJARAN.ADD, requestBody);

            if (response.status && response.code === "SUCCESS") {
                showToast("Jadwal pelajaran added successfully!", "success");
                addScheduleModal.hide();
                fetchSchedules(currentPage);
            } else {
                console.error("Failed to add jadwal pelajaran:", response.message);
                showToast("Gagal menambahkan jadwal pelajaran, coba lagi.", "danger");
            }
        } catch (error) {
            console.error("Error adding jadwal pelajaran:", error);
            showToast("Terjadi kesalahan saat menambahkan jadwal pelajaran.", "danger");
        }
    }

    /**
     * Handle Delete Jadwal Pelajaran
     */
    async function handleDeleteSchedule(scheduleId) {
        const userConfirmed = confirm("Apakah Anda yakin ingin menghapus jadwal pelajaran ini? Data yang dihapus tidak dapat dikembalikan!");

        if (userConfirmed) {
            try {
                const response = await NetworkHelper.delete(`${ENDPOINTS.JADWAL_PELAJARAN.DELETE(scheduleId)}`);

                if (response.status && response.code === "SUCCESS") {
                    alert(response.message);
                    fetchSchedules(currentPage);
                } else {
                    alert(`Gagal menghapus jadwal pelajaran: ${response.message}`);
                    console.error("Failed to delete jadwal pelajaran:", response);
                }
            } catch (error) {
                alert("Terjadi kesalahan saat menghapus jadwal pelajaran.");
                console.error("Error deleting jadwal pelajaran:", error);
            }
        } else {
            console.log("Penghapusan jadwal pelajaran dibatalkan oleh pengguna.");
        }
    }

    /**
     * Reset form input modal
     */
    function resetForm(mode, scheduleData = null) {
        document.getElementById("editSchedule").setAttribute("data-mode", mode);
        const modalDescription = document.getElementById("modalDescription");
    
        if (mode === "add") {
            modalTitle.textContent = "Tambah Jadwal Pelajaran";
            modalDescription.textContent = "Isi form di bawah ini untuk menambahkan jadwal pelajaran baru.";
            document.getElementById("kelasId").value = "";
            document.getElementById("mataPelajaranId").value = "";
            document.getElementById("teacherId").value = "";
            document.getElementById("semesterTahunAjaranId").value = "";
            document.getElementById("hari").value = "";
            document.getElementById("jamMulai").value = "";
            document.getElementById("jamSelesai").value = "";
        } else if (mode === "edit" && scheduleData) {
            modalTitle.textContent = "Edit Jadwal Pelajaran";
            modalDescription.textContent = "Ubah informasi jadwal pelajaran di bawah ini.";
            document.getElementById("kelasId").value = scheduleData.kelas_id || "";
            document.getElementById("mataPelajaranId").value = scheduleData.mata_pelajaran_id || "";
            document.getElementById("teacherId").value = scheduleData.teacher_id || "";
            document.getElementById("semesterTahunAjaranId").value = scheduleData.semester_tahun_ajaran_id || "";
            document.getElementById("hari").value = scheduleData.hari || "";
            document.getElementById("jamMulai").value = scheduleData.jam_mulai || "";
            document.getElementById("jamSelesai").value = scheduleData.jam_selesai || "";
        }
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
                fetchSchedules(currentPage);
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
                fetchSchedules(currentPage);
            }
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
    }

    addNewRecordBtn.addEventListener("click", async () => {
        await preloadDropdownData();
        resetForm("add");
        addScheduleModal.show();
    
        editScheduleForm.onsubmit = async (e) => {
            e.preventDefault();
            await handleAddSchedule();
        };
    });
    
    fetchSchedules(currentPage); // Fetch data jadwal pelajaran saat halaman di-load
}