import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { showToast } from '../config/toast.js';

/**
 * Inisialisasi halaman Mata Pelajaran
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const addSubjectModal = new bootstrap.Modal(document.getElementById("editUser")); // Perbaikan ID modal
    const addNewRecordBtn = document.getElementById("addNewRecordBtn");
    const editSubjectForm = document.getElementById("editSubjectForm");

    const paginationContainer = document.createElement("div");
    paginationContainer.className = "d-flex justify-content-between align-items-center p-3";
    document.querySelector(".card-datatable").appendChild(paginationContainer);

    let currentPage = 1;

    /**
     * Fetch mata pelajaran dari server dan render ke dalam tabel
     */
    async function fetchSubjects(page = 1) {
        try {
            const response = await NetworkHelper.get(`${ENDPOINTS.MATA_PELAJARAN.GET_MATA_PELAJARAN}?page=${page}&size=10`);

            if (response) {
                const { items, pagination } = response;

                renderTable(items); // Render data ke tabel
                renderPagination(pagination); // Render navigasi pagination
            } else {
                console.error("Failed to fetch mata pelajaran:", response.message);
                showToast("Gagal mengambil data mata pelajaran!", "danger");
            }
        } catch (error) {
            console.error("Error fetching mata pelajaran:", error);
            showToast("Terjadi kesalahan saat mengambil data mata pelajaran.", "danger");
        }
    }

    /**
     * Render data mata pelajaran ke dalam tabel
     */
    function renderTable(data) {
        tableBody.innerHTML = "";

        data.forEach((subject, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${subject.id}</td>
                    <td>${subject.nama_pelajaran}</td>
                    <td>${subject.kode_pelajaran}</td>
                    <td>${new Date(subject.created_at).toLocaleDateString()}</td>
                    <td>${new Date(subject.updated_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-2 edit-btn" data-id="${subject.id}">
                            <i class="ti ti-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${subject.id}">
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
                handleEditSubject(id);
            });
        });

        // Tambahkan event listener untuk tombol Delete
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                handleDeleteSubject(id);
            });
        });
    }

    /**
     * Handle Edit Mata Pelajaran
     */
    async function handleEditSubject(subjectId) {
        try {
            const response = await NetworkHelper.get(`${ENDPOINTS.MATA_PELAJARAN.GET_MATA_PELAJARAN}/${subjectId}`);
            if (response) {
                resetForm("edit", response);

                // Isi data ke dalam form modal
                document.getElementById("subjectName").value = response.nama_pelajaran || "";
                document.getElementById("subjectCode").value = response.kode_pelajaran || "";

                addSubjectModal.show();

                // Pastikan handleUpdateSubject dipanggil saat form disubmit
                editSubjectForm.onsubmit = async (e) => {
                    e.preventDefault();
                    await handleUpdateSubject(subjectId);
                };
            } else {
                showToast("Gagal memuat data mata pelajaran!", "danger");
            }
        } catch (error) {
            console.error("Error fetching mata pelajaran:", error);
            showToast("Terjadi kesalahan saat memuat data mata pelajaran.", "danger");
        }
    }

    /**
     * Handle Update Mata Pelajaran
     */
    async function handleUpdateSubject(subjectId) {
        const namaPelajaran = document.getElementById("subjectName").value.trim();
        const kodePelajaran = document.getElementById("subjectCode").value.trim();

        if (!namaPelajaran || !kodePelajaran) {
            showToast("Semua field wajib diisi!", "danger");
            return;
        }

        const requestBody = {
            nama_pelajaran: namaPelajaran,
            kode_pelajaran: kodePelajaran
        };

        try {
            const response = await NetworkHelper.put(`${ENDPOINTS.MATA_PELAJARAN.UPDATE_MATA_PELAJARAN(subjectId)}`, requestBody);

            if (response.status && response.code === "SUCCESS") {
                showToast("Mata pelajaran updated successfully!", "success");
                addSubjectModal.hide();
                fetchSubjects(currentPage);
            } else {
                console.error("Failed to update mata pelajaran:", response.message);
                showToast("Gagal memperbarui mata pelajaran, coba lagi.", "danger");
            }
        } catch (error) {
            console.error("Error updating mata pelajaran:", error);
            showToast("Terjadi kesalahan saat memperbarui mata pelajaran.", "danger");
        }
    }

    /**
     * Tambah Mata Pelajaran
     */
    async function handleAddSubject() {
        const namaPelajaran = document.getElementById("subjectName").value.trim();
        const kodePelajaran = document.getElementById("subjectCode").value.trim();

        if (!namaPelajaran || !kodePelajaran) {
            showToast("Semua field wajib diisi!", "danger");
            return;
        }

        const requestBody = {
            nama_pelajaran: namaPelajaran,
            kode_pelajaran: kodePelajaran
        };

        try {
            const response = await NetworkHelper.post(ENDPOINTS.MATA_PELAJARAN.ADD_MATA_PELAJARAN, requestBody);

            if (response.statusCode === 200 || response.code === "SUCCESS") {
                showToast("Mata pelajaran added successfully!", "success");
                addSubjectModal.hide();
                fetchSubjects(currentPage);
            } else {
                console.error("Failed to add mata pelajaran:", response.message);
                showToast("Gagal menambahkan mata pelajaran, coba lagi.", "danger");
            }
        } catch (error) {
            console.error("Error adding mata pelajaran:", error);
            showToast("Terjadi kesalahan saat menambahkan mata pelajaran.", "danger");
        }
    }

    /**
     * Handle Delete Mata Pelajaran
     */
    async function handleDeleteSubject(subjectId) {
        const userConfirmed = confirm("Apakah Anda yakin ingin menghapus mata pelajaran ini? Data yang dihapus tidak dapat dikembalikan!");
    
        if (userConfirmed) {
            try {
                const response = await NetworkHelper.delete(`${ENDPOINTS.MATA_PELAJARAN.DELETE_MATA_PELAJARAN(subjectId)}`);
    
                if (response.status && response.code === "SUCCESS") {
                    alert(response.message); // Pesan dari respons server
                    fetchSubjects(currentPage); // Refresh data
                } else {
                    alert(`Gagal menghapus mata pelajaran: ${response.message}`);
                    console.error("Failed to delete mata pelajaran:", response);
                }
            } catch (error) {
                alert("Terjadi kesalahan saat menghapus mata pelajaran.");
                console.error("Error deleting mata pelajaran:", error);
            }
        } else {
            console.log("Penghapusan mata pelajaran dibatalkan oleh pengguna.");
        }
    }
    
    /**
     * Reset form input modal
     */
    function resetForm(mode, subjectData = null) {
        document.getElementById("editUser").setAttribute("data-mode", mode);
        const modalDescription = document.getElementById("modalDescription");

        if (mode === "add") {
            modalTitle.textContent = "Tambah Mata Pelajaran";
            modalDescription.textContent = "Isi form di bawah ini untuk menambahkan mata pelajaran baru.";
            document.getElementById("subjectName").value = "";
            document.getElementById("subjectCode").value = "";
        } else if (mode === "edit" && subjectData) {
            modalTitle.textContent = "Edit Mata Pelajaran";
            modalDescription.textContent = "Ubah informasi mata pelajaran di bawah ini.";
            document.getElementById("subjectName").value = subjectData.nama_pelajaran || "";
            document.getElementById("subjectCode").value = subjectData.kode_pelajaran || "";
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
                fetchSubjects(currentPage);
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
                fetchSubjects(currentPage);
            }
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
    }

    addNewRecordBtn.addEventListener("click", () => {
        resetForm("add");
        addSubjectModal.show();

        // Tambahkan event listener untuk submit form pada mode tambah
        editSubjectForm.onsubmit = async (e) => {
            e.preventDefault(); // Mencegah reload halaman
            await handleAddSubject(); // Panggil fungsi tambah mata pelajaran
        };
    });

    fetchSubjects(currentPage); // Fetch data mata pelajaran saat halaman di-load
}
