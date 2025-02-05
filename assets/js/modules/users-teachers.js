import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { showToast } from '../config/toast.js';

/**
 * Inisialisasi halaman Guru/Teacher
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const addTeacherModal = new bootstrap.Modal(document.getElementById("editTeacher"));
    const addNewRecordBtn = document.getElementById("addNewRecordBtn");
    const editTeacherForm = document.getElementById("editTeacherForm");
    const datalistEmail = document.getElementById("datalistEmail"); 

    const paginationContainer = document.createElement("div");
    paginationContainer.className = "d-flex justify-content-between align-items-center p-3";
    document.querySelector(".card-datatable").appendChild(paginationContainer);

    let currentPage = 1;

    /**
     * Fetch guru dari server dan render ke dalam tabel
     */
    async function fetchTeachers(page = 1) {
        try {
            const response = await NetworkHelper.get(`${ENDPOINTS.TEACHERS.GET_TEACHERS}?page=${page}&size=10`);

            if (response) {
                const { items, pagination } = response;

                renderTable(items); // Render data ke tabel
                renderPagination(pagination); // Render navigasi pagination
            } else {
                console.error("Failed to fetch teachers:", response.message);
                showToast("Gagal mengambil data guru!", "danger");
            }
        } catch (error) {
            console.error("Error fetching teachers:", error);
            showToast("Terjadi kesalahan saat mengambil data guru.", "danger");
        }
    }
     /**
     * Fetch suggestions untuk email
     */
    //  async function fetchEmailSuggestions(term) {
    //     try {
    //         // Bentuk URL dengan parameter query
    //         const url = `${ENDPOINTS.USERS.GET_ALL}?term=${encodeURIComponent(term)}`;
    //         const response = await NetworkHelper.get(url);
    
    //         if (response.items) {
    //             datalistEmail.innerHTML = ""; // Kosongkan datalist
    
    //             // Isi datalist dengan email dari respons
    //             response.items.forEach(user => {
    //                 const option = document.createElement("option");
    //                 option.value = user.email; // Menggunakan email sebagai value
    //                 datalistEmail.appendChild(option);
    //             });
    //         } else {
    //             console.error("Failed to fetch email suggestions:", response.message);
    //         }
    //     } catch (error) {
    //         console.error("Error fetching email suggestions:", error);
    //     }
    // }
    
    //     // Event listener untuk input suggestion
    //     const emailInput = document.getElementById("email"); // Pastikan ID input sesuai
    // emailInput.addEventListener("input", (e) => {
    //     const term = e.target.value.trim();
    //     if (term.length >= 3) { // Minimum 3 karakter untuk memulai pencarian
    //         fetchEmailSuggestions(term);
    //     }
    // });

    /**
     * Render data guru ke dalam tabel
     * @param {Array} data - Data guru dari API
     */
    function renderTable(data) {
        tableBody.innerHTML = "";

        data.forEach((teacher, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${teacher.id}</td>
                    <td>${teacher.nip || "Tidak Tersedia"}</td>
                    <td>${teacher.nama_lengkap || "Tidak Tersedia"}</td>
                    <td>${teacher.tempat_lahir || "Tidak Tersedia"}</td>
                    <td>${new Date(teacher.tanggal_lahir).toLocaleDateString()}</td>
                    <td>${teacher.jenis_kelamin === "P" ? "Perempuan" : "Laki-Laki"}</td>
                    <td>${teacher.agama || "Tidak Tersedia"}</td>
                    <td>${teacher.no_telepon || "Tidak Tersedia"}</td>
                    <td>${teacher.user?.email || "Tidak Tersedia"}</td>
                    <td>${teacher.status || "Tidak Tersedia"}</td>
                    <td>${teacher.is_wali_kelas ? "Ya" : "Tidak"}</td>
                    <td>${new Date(teacher.updated_at).toLocaleDateString()}</td>
                    <td style="text-align: center;">
                        <button class="btn btn-sm btn-primary me-2 edit-btn" data-id="${teacher.id}">
                            <i class="ti ti-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${teacher.id}">
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
                handleEditTeacher(id);
            });
        });

        // Tambahkan event listener untuk tombol Delete
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                handleDeleteTeacher(id);
            });
        });
    }

    /**
     * Edit data guru
     */
    async function handleEditTeacher(teacherId) {
        try {
            const response = await NetworkHelper.get(`${ENDPOINTS.TEACHERS.GET_TEACHERS_BYID(teacherId)}`);
            if (response) {
                resetForm("edit", response);
                addTeacherModal.show();

                editTeacherForm.onsubmit = async (e) => {
                    e.preventDefault();
                    await handleUpdateTeacher(teacherId);
                };
            } else {
                showToast("Gagal memuat data guru!", "danger");
            }
        } catch (error) {
            console.error("Error fetching teacher:", error);
            showToast("Terjadi kesalahan saat memuat data guru.", "danger");
        }
    }

    /**
     * Update data guru
     */
    async function handleUpdateTeacher(teacherId) {
        const requestBody = {
            email: document.getElementById("email").value.trim(),
            nip: document.getElementById("nip").value.trim(),
            namaLengkap: document.getElementById("namaLengkap").value.trim(),
            tempatLahir: document.getElementById("tempatLahir").value.trim(),
            tanggalLahir: document.getElementById("tanggalLahir").value.trim(),
            jenisKelamin: document.getElementById("jenisKelamin").value.trim(),
            agama: document.getElementById("agama").value.trim(),
            alamat: document.getElementById("alamat").value.trim(),
            noTelepon: document.getElementById("noTelepon").value.trim(),
            tanggalMasuk: document.getElementById("tanggalMasuk").value.trim(),
            status: document.getElementById("status").value.trim(),
            catatanKhusus: document.getElementById("catatanKhusus").value.trim() || null,
            isWaliKelas: document.getElementById("isWaliKelas").checked ? 1 : 0,
        };

        try {
            const response = await NetworkHelper.put(`${ENDPOINTS.TEACHERS.UPDATE_TEACHERS(teacherId)}`, requestBody);

            if (response.message === "Teacher updated successfully") {
                showToast("Guru berhasil diperbarui!", "success");
                addTeacherModal.hide();
                fetchTeachers(currentPage);
            } else {
                console.error("Failed to update teacher:", response.message);
                showToast("Gagal memperbarui guru, coba lagi.", "danger");
            }
        } catch (error) {
            console.error("Error updating teacher:", error);
            showToast("Terjadi kesalahan saat memperbarui guru.", "danger");
        }
    }

    /**
     * Hapus guru
     */
    async function handleDeleteTeacher(teacherId) {
        const userConfirmed = confirm("Apakah Anda yakin ingin menghapus guru ini?");

        if (userConfirmed) {
            try {
                const response = await NetworkHelper.delete(ENDPOINTS.TEACHERS.DELETE_TEACHERS(teacherId));

                if (response.message === "Teacher deleted successfully") {
                    showToast("Guru berhasil dihapus!", "success");
                    fetchTeachers(currentPage);
                } else {
                    console.error("Failed to delete teacher:", response.message);
                    showToast("Gagal menghapus guru, coba lagi.", "danger");
                }
            } catch (error) {
                console.error("Error deleting teacher:", error);
                showToast("Terjadi kesalahan saat menghapus guru.", "danger");
            }
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
                fetchTeachers(currentPage);
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
                fetchTeachers(currentPage);
            }
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
    }

    /**
     * Reset form input modal
     */
    function resetForm(mode, teacherData = null) {
        const modal = document.getElementById("editTeacher");
        if (!modal) {
            console.error("Modal dengan ID 'editTeacher' tidak ditemukan.");
            return;
        }

        modal.setAttribute("data-mode", mode);

        if (mode === "add") {
            document.getElementById("email").value = "";
            document.getElementById("nip").value = "";
            document.getElementById("namaLengkap").value = "";
            document.getElementById("tempatLahir").value = "";
            document.getElementById("tanggalLahir").value = "";
            document.getElementById("jenisKelamin").value = "";
            document.getElementById("agama").value = "";
            document.getElementById("alamat").value = "";
            document.getElementById("noTelepon").value = "";
            document.getElementById("tanggalMasuk").value = new Date().toISOString().split("T")[0];
            document.getElementById("status").value = "Aktif";
            document.getElementById("isWaliKelas").checked = false;
        } else if (mode === "edit" && teacherData) {
            document.getElementById("email").value = teacherData.user?.email || "";
            document.getElementById("nip").value = teacherData.nip || "";
            document.getElementById("namaLengkap").value = teacherData.nama_lengkap || "";
            document.getElementById("tempatLahir").value = teacherData.tempat_lahir || "";
            document.getElementById("tanggalLahir").value = teacherData.tanggal_lahir || "";
            document.getElementById("jenisKelamin").value = teacherData.jenis_kelamin || "";
            document.getElementById("tanggalMasuk").value = new Date().toISOString().split("T")[0];

            document.getElementById("alamat").value = teacherData.alamat || "";
            document.getElementById("agama").value = teacherData.agama || "";
            document.getElementById("noTelepon").value = teacherData.no_telepon || "";
            document.getElementById("status").value = teacherData.status || "Aktif";
            document.getElementById("isWaliKelas").checked = teacherData.is_wali_kelas;
        }
    }

    /**
     * Tambah guru baru melalui modal
     */
    async function handleAddTeacher() {
        const requestBody = {
            email: document.getElementById("email").value.trim(),
            nip: document.getElementById("nip").value.trim(),
            namaLengkap: document.getElementById("namaLengkap").value.trim(),
            tempatLahir: document.getElementById("tempatLahir").value.trim(),
            tanggalLahir: document.getElementById("tanggalLahir").value.trim(),
            jenisKelamin: document.getElementById("jenisKelamin").value.trim(),
            agama: document.getElementById("agama").value.trim(),
            alamat: document.getElementById("alamat").value.trim(),
            noTelepon: document.getElementById("noTelepon").value.trim(),
            tanggalMasuk: document.getElementById("tanggalMasuk").value.trim(),
            status: document.getElementById("status").value.trim(),
            catatanKhusus: document.getElementById("catatanKhusus").value.trim() || null, // Default null jika kosong
            isWaliKelas: document.getElementById("isWaliKelas").checked ? 1 : 0, // Konversi ke 1 atau 0
        };
    
        try {
            const response = await NetworkHelper.post(ENDPOINTS.TEACHERS.GET_TEACHERS, requestBody);
    
            if (response.message === "Teacher created successfully") {
                showToast("Guru berhasil ditambahkan!", "success");
                addTeacherModal.hide();
                fetchTeachers(currentPage); // Refresh tabel
            } else {
                console.error("Failed to add teacher:", response.message);
                showToast("Gagal menambahkan guru, coba lagi.", "danger");
            }
        } catch (error) {
            console.error("Error adding teacher:", error);
            showToast("Terjadi kesalahan saat menambahkan guru.", "danger");
        }
    }
    

    addNewRecordBtn.addEventListener("click", () => {
        resetForm("add");
        addTeacherModal.show();
        editTeacherForm.onsubmit = async (e) => {
            e.preventDefault();
            await handleAddTeacher();
        };
    });

    fetchTeachers(currentPage); // Fetch data guru saat halaman di-load
}
