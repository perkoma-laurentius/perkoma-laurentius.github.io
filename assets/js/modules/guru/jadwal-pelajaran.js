import { NetworkHelper } from '../../config/networkHelper.js';
import { ENDPOINTS } from '../../config/endpoint.js';
import { showToast } from '../../config/toast.js';
import { pageScripts } from '../../config/routes.js';

/**
 * Inisialisasi halaman Jadwal Pelajaran
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const addScheduleModal = new bootstrap.Modal(document.getElementById("editSchedule"));
    const editScheduleForm = document.getElementById("editScheduleForm");

    const paginationContainer = document.createElement("div");
    paginationContainer.className = "d-flex justify-content-between align-items-center p-3";
    document.querySelector(".card-datatable").appendChild(paginationContainer);

    let currentPage = 1;
    

    /**
     * Fetch jadwal pelajaran dari server dan render ke dalam tabel
     */
    async function fetchSchedules(page = 1) {
        try {
            const response = await NetworkHelper.get(`${ENDPOINTS.JADWAL_PELAJARAN_GURU.GET_LIST}?page=${page}&size=10`);
    
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
                       
                        <button class="btn btn-sm btn-danger absen-btn" 
                        data-kelas-id="${schedule.kelas_id}" 
                        data-semester-id="${schedule.semester_tahun_ajaran_id}" 
                        data-jadwal-pelajaran-id="${schedule.id}">
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <i class="fa-solid fa-clock"></i>
                            <span>Absensi</span>
                        </div>
                    </button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });
    
        // Tambahkan event listener untuk tombol Edit
       
    
        // Tambahkan event listener untuk tombol Delete
        document.querySelectorAll(".absen-btn").forEach(button => {
            button.addEventListener("click", () => {
                const kelasId = button.getAttribute("data-kelas-id");
                const semesterId = button.getAttribute("data-semester-id");
                const jadwalPelajaranId = button.getAttribute("data-jadwal-pelajaran-id");
                handleAbsensi(kelasId, semesterId, jadwalPelajaranId);
            });
        });
    }
    
    function handleAbsensi(kelasId, semesterId, jadwalPelajaranId) {
        if (!kelasId || !semesterId || !jadwalPelajaranId) {
            showToast('Data jadwal tidak valid.', 'danger');
            return;
        }
    
        const kelolaSiswaPage = pageScripts.STUDENT_CLASSES_GURU.fileName; // Ambil path dari konfigurasi routes
        if (kelolaSiswaPage) {
            // Simpan classId ke Local Storage
            localStorage.setItem("kelasId", kelasId);
            localStorage.setItem("semesterId", semesterId);
            localStorage.setItem("jadwalPelajaranId", jadwalPelajaranId);
    
            // Navigasi ke halaman Kelola Siswa
            window.location.href = `/${kelolaSiswaPage}`;
        } else {
            console.error("Halaman Kelola Siswa tidak ditemukan di konfigurasi routes.");
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

    
    fetchSchedules(currentPage); // Fetch data jadwal pelajaran saat halaman di-load
}