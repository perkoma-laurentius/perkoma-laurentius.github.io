import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { showToast } from '../config/toast.js';
import { pageScripts } from '../config/routes.js';

/**
 * Inisialisasi halaman Kelas
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const addKelasModal = new bootstrap.Modal(document.getElementById("editUser"));
    const addNewRecordBtn = document.getElementById("addNewRecordBtn");
    const editSubjectForm = document.getElementById("editUserForm");
    const teacherDropdown = document.getElementById("teacherId"); // Dropdown Guru

    const paginationContainer = document.createElement("div");
    paginationContainer.className = "d-flex justify-content-between align-items-center p-3";
    document.querySelector(".card-datatable").appendChild(paginationContainer);

    let currentPage = 1;

    /**
     * Fetch kelas dari server dan render ke dalam tabel
     */
    async function fetchKelas(page = 1) {
        try {
            const response = await NetworkHelper.get(`${ENDPOINTS.KELAS.GET_KELAS}?page=${page}&size=10`);

            if (response) {
                const { items, pagination } = response;

                renderTable(items); // Render data ke tabel
                renderPagination(pagination); // Render navigasi pagination
            } else {
                console.error("Failed to fetch kelas:", response.message);
                showToast("Gagal mengambil data kelas!", "danger");
            }
        } catch (error) {
            console.error("Error fetching kelas:", error);
            showToast("Terjadi kesalahan saat mengambil data kelas.", "danger");
        }
    }
    /**
     * Load data guru ke dropdown
     */
    async function loadTeachers() {
    try {
        const response = await NetworkHelper.get(ENDPOINTS.TEACHERS.GET_WALI_KELAS);
        if (response) {
            renderTeacherDropdown(response);
        } else {
            console.error("Failed to fetch teachers:", response.message);
            showToast("Gagal memuat data guru!", "danger");
        }
    } catch (error) {
        console.error("Error fetching teachers:", error);
        showToast("Terjadi kesalahan saat memuat data guru.", "danger");
    }
    }

    /**
     * Render data guru ke dropdown GET GURU
     * @param {Array} teachers - Data guru dari API
     */
    function renderTeacherDropdown(response) {
        const teachers = response.items; // Akses data guru dari properti 'items'
        teacherDropdown.innerHTML = '<option value="">Pilih Guru</option>';

        teachers.forEach(teacher => {
            const option = document.createElement("option");
            option.value = teacher.id;
            option.textContent = teacher.nama_lengkap;
            teacherDropdown.appendChild(option);
        });
    }

    /**
     * Render data kelas ke dalam tabel
     * @param {Array} data - Data kelas dari API
     */
    function renderTable(data) {
        tableBody.innerHTML = "";
    
        data.forEach((kelas, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${kelas.id}</td>
                    <td>${kelas.nama_kelas}</td>
                    <td>${kelas.teacher?.nama_lengkap || "-"}</td>
                    <td>${kelas.tingkat}</td>
                    <td>${kelas.kapasitas}</td>
                    <td>
                        <span class="badge bg-label-${kelas.status ? "success" : "danger"}">
                            ${kelas.status ? "Active" : "Inactive"}
                        </span>
                    </td>
                    <td>${new Date(kelas.updated_at).toLocaleDateString()}</td>
                    <td style="text-align: center;"
>
                         <button class="btn btn-sm btn-primary me-2 edit-btn" data-id="${kelas.id}">
                        <i class="ti ti-pencil"></i> Edit
                    </button>
                        <button class="btn btn-sm btn-danger me-2 delete-btn" data-id="${kelas.id}">
                            <i class="ti ti-trash"></i> Delete
                        </button>
                        <button class="btn btn-sm btn-danger me-2 kelola-btn" data-id="${kelas.id}">
                            <i class="ti ti-settings"></i> Kelola Siswa
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
                handleEditKelas(id);
            });
        });
    
        // Tambahkan event listener untuk tombol Delete
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                handleDeleteKelas(id);
            });
        });

        document.querySelectorAll(".kelola-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const kelasId = button.getAttribute("data-id");
                navigateToKelolaSiswa(kelasId);
            });
        });
        
    }

    function navigateToKelolaSiswa(kelasId) {
        const kelolaSiswaPage = pageScripts.KELOLASISWA.fileName; // Ambil path dari konfigurasi routes
        if (kelolaSiswaPage) {
            // Simpan kelasId ke Local Storage
            localStorage.setItem("kelasId", kelasId);
    
            // Gunakan path absolut
            window.location.href = `/${kelolaSiswaPage}`;
        } else {
            console.error("Halaman Kelola Siswa tidak ditemukan di konfigurasi routes.");
        }
    }
    
    
     /**
     * AMBIL DULU DATA GET KELAS
     */

    async function handleEditKelas(kelasId) {
        
        try {
            await loadTeachers();

            const response = await NetworkHelper.get(`${ENDPOINTS.KELAS.GET_KELAS}/${kelasId}`);
            if (response) {
                resetForm("edit", response);
                addKelasModal.show();
                const kelas = response;
    
                // Isi data ke dalam form modal
                teacherDropdown.value = kelas.teacher_id || ""; // Ambil teacher_id untuk dropdown
                document.getElementById("modalRoleName").value = kelas.nama_kelas || ""; // Nama kelas
                document.getElementById("tingkat").value = kelas.tingkat || ""; // Tingkat
                document.getElementById("kapasitas").value = kelas.kapasitas || ""; // Kapasitas
                document.getElementById("modalRoleStatus").value = kelas.status || ""; // Status
    
                // Jika data teacher tersedia, tampilkan di dropdown
                if (kelas.teacher && kelas.teacher.nama_lengkap) {
                    console.log(`Guru: ${kelas.teacher.nama_lengkap}`);
                }
    
                // Tampilkan modal
                addKelasModal.show();
    
                // Pastikan handleUpdateKelas dipanggil saat form disubmit
                editSubjectForm.onsubmit = async (e) => {
                    e.preventDefault();
                    await handleUpdateKelas(kelasId);
                };
            } else {
                showToast("Gagal memuat data kelas!", "danger");
            }
        } catch (error) {
            console.error("Error fetching kelas:", error);
            showToast("Terjadi kesalahan saat memuat data kelas.", "danger");
        }
    }
    
    
    /**
     * Update Kelas
     * @param {number} kelasId - ID kelas yang akan diperbarui
     */
    async function handleUpdateKelas(kelasId) {
        const teacherId = teacherDropdown.value.trim();
        const namaKelas = document.getElementById("modalRoleName").value.trim();
        const tingkat = document.getElementById("tingkat").value.trim();
        const kapasitas = document.getElementById("kapasitas").value.trim();
        const status = document.getElementById("modalRoleStatus").value.trim();
    
        if (!teacherId || !namaKelas || !tingkat || !kapasitas) {
            showToast("Semua field wajib diisi!", "danger");
            return;
        }
    
        const requestBody = {
            teacher_id: teacherId,
            nama_kelas: namaKelas,
            tingkat,
            kapasitas,
            status,
        };
    
        try {
            const response = await NetworkHelper.put(`${ENDPOINTS.KELAS.UPDATE_KELAS(kelasId)}`, requestBody);
    
            if (response.message === "Kelas updated successfully") {
                showToast("Kelas updated successfully!", "success");
                addKelasModal.hide();
                fetchKelas(currentPage);
            } else {
                console.error("Failed to update kelas:", response.message);
                showToast("Gagal memperbarui kelas, coba lagi.", "danger");
            }
        } catch (error) {
            console.error("Error updating kelas:", error);
            showToast("Terjadi kesalahan saat memperbarui kelas.", "danger");
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
                fetchKelas(currentPage);
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
                fetchKelas(currentPage);
            }
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
    }

    /**
     * Reset form input modal
     */
    function resetForm(mode, kelasData = null) {
        const modal = document.getElementById("editUser");
        if (!modal) {
            console.error("Modal dengan ID 'editUser' tidak ditemukan.");
            return;
        }
    
        modal.setAttribute("data-mode", mode);
    
        const modalTitle = document.getElementById("modalTitle");
        const modalDescription = document.getElementById("modalDescription");
        if (mode === "add") {
            modalTitle.textContent = "Tambah Kelas";
            modalDescription.textContent = "Isi form di bawah ini untuk menambahkan kelas baru.";
            teacherDropdown.value = "";
            document.getElementById("modalRoleName").value = "";
            document.getElementById("tingkat").value = "";
            document.getElementById("kapasitas").value = "";
            document.getElementById("modalRoleStatus").value = "Aktif";
        } else if (mode === "edit" && kelasData) {
            modalTitle.textContent = "Edit Kelas";
            modalDescription.textContent = "Ubah informasi kelas di bawah ini.";
            teacherDropdown.value = kelasData.teacher_id || "";
            document.getElementById("modalRoleName").value = kelasData.nama_kelas || "";
            document.getElementById("tingkat").value = kelasData.tingkat || "";
            document.getElementById("kapasitas").value = kelasData.kapasitas || "";
            document.getElementById("modalRoleStatus").value = kelasData.status || "Aktif";
        }
    }
    
   

    /**
     * Tambah kelas baru melalui modal
     */
    async function handleAddKelas() {
        const teacherId = teacherDropdown.value.trim();
        const namaKelas = document.getElementById("modalRoleName").value.trim();
        const tingkat = document.getElementById("tingkat").value.trim();
        const kapasitas = document.getElementById("kapasitas").value.trim();
        const status = document.getElementById("modalRoleStatus").value.trim();
    
        if (!teacherId || !namaKelas || !tingkat || !kapasitas) {
            showToast("Semua field wajib diisi!", "danger");
            return;
        }
    
        const requestBody = {
            teacher_id: teacherId,
            nama_kelas: namaKelas,
            tingkat,
            kapasitas,
            status,
        };
    
        try {
            const response = await NetworkHelper.post(ENDPOINTS.KELAS.ADD_KELAS, requestBody);
    
            if (response.message === "Kelas created successfully") {
                showToast("Kelas added successfully!", "success");
                addKelasModal.hide();
                fetchKelas(currentPage);
            } else {
                console.error("Failed to add kelas:", response.message);
                showToast("Gagal menambahkan kelas, coba lagi.", "danger");
            }
        } catch (error) {
            console.error("Error adding kelas:", error);
            showToast("Terjadi kesalahan saat menambahkan kelas.", "danger");
        }
    }
    
    
    
    /**
     * Hapus Kelas
     * @param {number} kelasId - ID kelas yang akan dihapus
     */
    async function handleDeleteKelas(kelasId) {
        const userConfirmed = confirm("Apakah Anda yakin ingin menghapus kelas ini? Kelas yang dihapus tidak dapat dikembalikan!");

        if (userConfirmed) {
            try {
                // Pastikan memanggil fungsi DELETE_KELAS dengan parameter
                const response = await NetworkHelper.delete(ENDPOINTS.KELAS.DELETE_KELAS(kelasId));

                if (response.message === "Kelas deleted successfully") {
                    alert("Kelas telah dihapus.");
                    fetchKelas(currentPage); // Refresh tabel setelah penghapusan
                } else {
                    alert("Gagal menghapus kelas. Silakan coba lagi.");
                    console.error("Failed to delete kelas:", response.message);
                }
            } catch (error) {
                alert("Terjadi kesalahan saat menghapus kelas.");
                console.error("Error deleting kelas:", error);
            }
        } else {
            console.log("Penghapusan kelas dibatalkan oleh pengguna.");
        }
    }

    /**
     * Helper pada modal
     */

    addNewRecordBtn.addEventListener("click", () => {
        resetForm("add");
        loadTeachers(); 
        addKelasModal.show();
        
        // Tambahkan event listener untuk submit form pada mode tambah
        editSubjectForm.onsubmit = async (e) => {
            e.preventDefault(); // Mencegah reload halaman
        };
    });

    editSubjectForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Mencegah reload halaman
        const mode = document.getElementById("editUser").getAttribute("data-mode");

        const requestBody = {
            teacher_id: teacherDropdown.value.trim(),
            nama_kelas: document.getElementById("modalRoleName").value.trim(),
            tingkat: document.getElementById("tingkat").value.trim(),
            kapasitas: document.getElementById("kapasitas").value.trim(),
            status: document.getElementById("modalRoleStatus").value.trim(),
        };

        if (mode === "add") {
            await handleAddKelas(); // Panggil fungsi tambah kelas
        } else if (mode === "edit") {
            const kelasId = document.getElementById("kelasId").value; 
            await handleUpdateKelas(kelasId, requestBody); // Panggil fungsi edit kelas
        }
    }); 


    

  
    fetchKelas(currentPage); // Fetch data kelas saat halaman di-load
}
