import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { showToast } from '../config/toast.js';

/**
 * Inisialisasi halaman Semester
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const addSemesterModal = new bootstrap.Modal(document.getElementById("editUser")); // Perbaikan ID modal
    const addNewRecordBtn = document.getElementById("addNewRecordBtn");
    const editSemesterForm = document.getElementById("editSubjectForm");

    const paginationContainer = document.createElement("div");
    paginationContainer.className = "d-flex justify-content-between align-items-center p-3";
    document.querySelector(".card-datatable").appendChild(paginationContainer);

    let currentPage = 1;

    /**
     * Fetch semester dari server dan render ke dalam tabel
     */
    async function fetchSemesters(page = 1) {
        const requestBody = {
            page,
            size: 10,
            term: "",
            startDate: "",
            endDate: ""
        };

        try {
            const response = await NetworkHelper.post(`${ENDPOINTS.SEMESTER.LIST}`, requestBody);

            if (response) {
                const { items, pagination } = response;

                renderTable(items); // Render data ke tabel
                renderPagination(pagination); // Render navigasi pagination
            } else {
                console.error("Failed to fetch semester:", response.message);
                showToast("Gagal mengambil data semester!", "danger");
            }
        } catch (error) {
            console.error("Error fetching semester:", error);
            showToast("Terjadi kesalahan saat mengambil data semester.", "danger");
        }
    }

    /**
     * Render data semester ke dalam tabel
     */
    function renderTable(data) {
        tableBody.innerHTML = "";

        data.forEach((semester, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${semester.id}</td>
                    <td>${semester.tahun_ajaran}</td>
                    <td>${semester.semester}</td>
                    <td>${semester.status}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-2 edit-btn" data-id="${semester.id}">
                            <i class="ti ti-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${semester.id}">
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
                handleEditSemester(id);
            });
        });

        // Tambahkan event listener untuk tombol Delete
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                handleDeleteSemester(id);
            });
        });
    }

    /**
     * Handle Edit Semester
     */
    async function handleEditSemester(semesterId) {
        try {
            const response = await NetworkHelper.get(`${ENDPOINTS.SEMESTER.GET_BY_ID}/${semesterId}`);
            if (response) {
                resetForm("edit", response);

                // Isi data ke dalam form modal
                document.getElementById("academicYear").value = response.tahun_ajaran || "";
                document.getElementById("semester").value = response.semester || "";
                document.getElementById("status").value = response.status || "";

                addSemesterModal.show();

                // Pastikan handleUpdateSemester dipanggil saat form disubmit
                editSemesterForm.onsubmit = async (e) => {
                    e.preventDefault();
                    await handleUpdateSemester(semesterId);
                };
            } else {
                showToast("Gagal memuat data semester!", "danger");
            }
        } catch (error) {
            console.error("Error fetching semester:", error);
            showToast("Terjadi kesalahan saat memuat data semester.", "danger");
        }
    }

    /**
     * Handle Update Semester
     */
    async function handleUpdateSemester(semesterId) {
        const tahunAjaran = document.getElementById("academicYear").value.trim();
        const semester = document.getElementById("semester").value.trim();
        const status = document.getElementById("status").value.trim();

        if (!tahunAjaran || !semester || !status) {
            showToast("Semua field wajib diisi!", "danger");
            return;
        }

        const requestBody = {
            tahun_ajaran: tahunAjaran,
            semester,
            status
        };

        try {
            const response = await NetworkHelper.put(`${ENDPOINTS.SEMESTER.UPDATE(semesterId)}`, requestBody);

            if (response.status && response.code === "SUCCESS") {
                showToast("Semester updated successfully!", "success");
                addSemesterModal.hide();
                fetchSemesters(currentPage);
            } else {
                console.error("Failed to update semester:", response.message);
                showToast("Gagal memperbarui semester, coba lagi.", "danger");
            }
        } catch (error) {
            console.error("Error updating semester:", error);
            showToast("Terjadi kesalahan saat memperbarui semester.", "danger");
        }
    }

    /**
     * Tambah Semester
     */
    async function handleAddSemester() {
        const tahunAjaran = document.getElementById("academicYear").value.trim();
        const semester = document.getElementById("semester").value.trim();
        const status = document.getElementById("status").value.trim();

        if (!tahunAjaran || !semester || !status) {
            showToast("Semua field wajib diisi!", "danger");
            return;
        }

        const requestBody = {
            tahun_ajaran: tahunAjaran,
            semester,
            status
        };

        try {
            const response = await NetworkHelper.post(ENDPOINTS.SEMESTER.ADD, requestBody);

            if (response.statusCode === 201 || response.code === "SUCCESS") {
                showToast("Semester added successfully!", "success");
                addSemesterModal.hide();
                fetchSemesters(currentPage);
            } else {
                console.error("Failed to add semester:", response.message);
                showToast("Gagal menambahkan semester, coba lagi.", "danger");
            }
        } catch (error) {
            console.error("Error adding semester:", error);
            showToast("Terjadi kesalahan saat menambahkan semester.", "danger");
        }
    }

    /**
     * Handle Delete Semester
     */
    async function handleDeleteSemester(semesterId) {
        const userConfirmed = confirm("Apakah Anda yakin ingin menghapus semester ini? Data yang dihapus tidak dapat dikembalikan!");

        if (userConfirmed) {
            try {
                const response = await NetworkHelper.delete(`${ENDPOINTS.SEMESTER.DELETE(semesterId)}`);

                if (response.status && response.code === "SUCCESS") {
                    alert(response.message);
                    fetchSemesters(currentPage);
                } else {
                    alert(`Gagal menghapus semester: ${response.message}`);
                    console.error("Failed to delete semester:", response);
                }
            } catch (error) {
                alert("Terjadi kesalahan saat menghapus semester.");
                console.error("Error deleting semester:", error);
            }
        } else {
            console.log("Penghapusan semester dibatalkan oleh pengguna.");
        }
    }

    /**
     * Reset form input modal
     */
    function resetForm(mode, semesterData = null) {
        document.getElementById("editUser").setAttribute("data-mode", mode);
        const modalDescription = document.getElementById("modalDescription");

        if (mode === "add") {
            modalTitle.textContent = "Tambah Semester";
            modalDescription.textContent = "Isi form di bawah ini untuk menambahkan semester baru.";
            document.getElementById("academicYear").value = "";
            document.getElementById("semester").value = "";
            document.getElementById("status").value = "Aktif";
        } else if (mode === "edit" && semesterData) {
            modalTitle.textContent = "Edit Semester";
            modalDescription.textContent = "Ubah informasi semester di bawah ini.";
            document.getElementById("academicYear").value = semesterData.tahun_ajaran || "";
            document.getElementById("semester").value = semesterData.semester || "";
            document.getElementById("status").value = semesterData.status || "Aktif";
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
                fetchSemesters(currentPage);
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
                fetchSemesters(currentPage);
            }
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
    }

    addNewRecordBtn.addEventListener("click", () => {
        resetForm("add");
        addSemesterModal.show();

        // Tambahkan event listener untuk submit form pada mode tambah
        editSemesterForm.onsubmit = async (e) => {
            e.preventDefault();
            await handleAddSemester();
        };
    });

    fetchSemesters(currentPage); // Fetch data semester saat halaman di-load
}
