import { NetworkHelper } from '../../config/networkHelper.js';
import { ENDPOINTS } from '../../config/endpoint.js';
import { showToast } from '../../config/toast.js';

/**
 * Inisialisasi halaman Pengumuman
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const addAnnouncementModal = new bootstrap.Modal(document.getElementById("editAnnouncement"));
    const addNewRecordBtn = document.getElementById("addNewRecordBtn");
    const editAnnouncementForm = document.getElementById("editAnnouncementForm");

    const paginationContainer = document.createElement("div");
    paginationContainer.className = "d-flex justify-content-between align-items-center p-3";
    document.querySelector(".card-datatable").appendChild(paginationContainer);

    let currentPage = 1;

    /**
     * Fetch pengumuman dari server dan render ke dalam tabel
     */
    async function fetchAnnouncements(page = 1) {
        try {
            const response = await NetworkHelper.get(`${ENDPOINTS.SCHOOL_ANNOUNCEMENTS.GET_ALL}?page=${page}&size=10`);

            if (response) {
                const { items, pagination } = response;

                renderTable(items); // Render data ke tabel
                renderPagination(pagination); // Render navigasi pagination
            } else {
                console.error("Failed to fetch pengumuman:", response.message);
                showToast("Gagal mengambil data pengumuman!", "danger");
            }
        } catch (error) {
            console.error("Error fetching pengumuman:", error);
            showToast("Terjadi kesalahan saat mengambil data pengumuman.", "danger");
        }
    }

    /**
     * Render data pengumuman ke dalam tabel
     * @param {Array} data - Data pengumuman dari API
     */
    function renderTable(data) {
        tableBody.innerHTML = "";

        data.forEach((pengumuman, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${pengumuman.id}</td>
                    <td>${pengumuman.title}</td>
                    <td>${pengumuman.category}</td>
                    <td>${new Date(pengumuman.start_date).toLocaleDateString()} - ${new Date(pengumuman.end_date).toLocaleDateString()}</td>
                    <td>
                        <span class="badge bg-label-${pengumuman.is_active ? "success" : "danger"}">
                            ${pengumuman.is_active ? "Active" : "Inactive"}
                        </span>
                    </td>
                    <td>${new Date(pengumuman.updated_at).toLocaleDateString()}</td>
                    <td style="text-align: center;">
                        <button class="btn btn-sm btn-primary me-2 edit-btn" data-id="${pengumuman.id}">
                            <i class="ti ti-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger me-2 delete-btn" data-id="${pengumuman.id}">
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
                handleEditPengumuman(id);
            });
        });

        // Tambahkan event listener untuk tombol Delete
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                handleDeletePengumuman(id);
            });
        });
    }

    /**
 * Edit pengumuman
 * @param {number} pengumumanId - ID pengumuman yang akan diedit
 */
async function handleEditPengumuman(pengumumanId) {
    try {
        // Fetch data pengumuman berdasarkan ID
        const response = await NetworkHelper.get(`${ENDPOINTS.SCHOOL_ANNOUNCEMENTS.GET_BY_ID(pengumumanId)}`);
        
        if (response && response.statusCode === 200) {
            // Reset dan siapkan form modal
            resetForm("edit", response.data);
            addAnnouncementModal.show();

            const pengumuman = response.data;

            // Isi data ke dalam form modal
            document.getElementById("modalTitle").value = pengumuman.title || "";
            document.getElementById("category").value = pengumuman.category || "";
            document.getElementById("start_date").value = pengumuman.start_date || "";
            document.getElementById("end_date").value = pengumuman.end_date || "";
            document.getElementById("is_active").value = pengumuman.is_active ? "1" : "0"; // Status aktif (1) atau nonaktif (0)

            // Pastikan handleUpdatePengumuman dipanggil saat form disubmit
            editAnnouncementForm.onsubmit = async (e) => {
                e.preventDefault();
                await handleUpdatePengumuman(pengumumanId);
            };
        } else {
            showToast("Gagal memuat data pengumuman!", "danger");
        }
    } catch (error) {
        console.error("Error fetching pengumuman:", error);
        showToast("Terjadi kesalahan saat memuat data pengumuman.", "danger");
    }
}


    /**
     * Update Pengumuman
     * @param {number} pengumumanId - ID pengumuman yang akan diperbarui
     */
    async function handleUpdatePengumuman(pengumumanId) {
        const title = document.getElementById("modalTitle").value.trim();
        const category = document.getElementById("category").value.trim();
        const startDate = document.getElementById("start_date").value.trim();
        const endDate = document.getElementById("end_date").value.trim();
        const isActive = document.getElementById("is_active").value.trim();

        if (!title || !category || !startDate || !endDate) {
            showToast("Semua field wajib diisi!", "danger");
            return;
        }

        const requestBody = {
            title,
            category,
            start_date: startDate,
            end_date: endDate,
            is_active: isActive,
        };

        try {
            const response = await NetworkHelper.put(`${ENDPOINTS.SCHOOL_ANNOUNCEMENTS.UPDATE(pengumumanId)}`, requestBody);

            if (response.message === "Announcement updated successfully") {
                showToast("Pengumuman updated successfully!", "success");
                addAnnouncementModal.hide();
                fetchAnnouncements(currentPage);
            } else {
                showToast("Gagal memperbarui pengumuman, coba lagi.", "danger");
            }
        } catch (error) {
            showToast("Terjadi kesalahan saat memperbarui pengumuman.", "danger");
        }
    }

    /**
     * Hapus Pengumuman
     * @param {number} pengumumanId - ID pengumuman yang akan dihapus
     */
    async function handleDeletePengumuman(pengumumanId) {
        const userConfirmed = confirm("Apakah Anda yakin ingin menghapus pengumuman ini? Pengumuman yang dihapus tidak dapat dikembalikan!");

        if (userConfirmed) {
            try {
                const response = await NetworkHelper.delete(ENDPOINTS.SCHOOL_ANNOUNCEMENTS.DELETE(pengumumanId));

                if (response.message === "Announcement deleted successfully") {
                    showToast("Pengumuman telah dihapus.", "success");
                    fetchAnnouncements(currentPage); // Refresh tabel setelah penghapusan
                } else {
                    showToast("Gagal menghapus pengumuman. Silakan coba lagi.", "danger");
                }
            } catch (error) {
                showToast("Terjadi kesalahan saat menghapus pengumuman.", "danger");
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
                fetchAnnouncements(currentPage);
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
                fetchAnnouncements(currentPage);
            }
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
    }

    /**
     * Reset form input modal
     */
    function resetForm(mode, pengumumanData = null) {
        const modal = document.getElementById("editAnnouncement");
        if (!modal) {
            console.error("Modal dengan ID 'editAnnouncement' tidak ditemukan.");
            return;
        }

        modal.setAttribute("data-mode", mode);

        const modalTitle = document.getElementById("modalTitleAnnouncement");
        const modalDescription = document.getElementById("modalDescription");
        if (mode === "add") {
            modalTitle.textContent = "Tambah Pengumuman";
            modalDescription.textContent = "Isi form di bawah ini untuk menambahkan pengumuman baru.";
            document.getElementById("modalTitle").value = "";
            document.getElementById("category").value = "";
            document.getElementById("start_date").value = "";
            document.getElementById("end_date").value = "";
            document.getElementById("is_active").value = "1"; // Default ke "Aktif"
        } else if (mode === "edit" && pengumumanData) {
            modalTitle.textContent = "Edit Pengumuman";
            modalDescription.textContent = "Ubah informasi pengumuman di bawah ini.";
            document.getElementById("modalTitle").value = pengumumanData.title || "";
            document.getElementById("category").value = pengumumanData.category || "";
            document.getElementById("start_date").value = pengumumanData.start_date || "";
            document.getElementById("end_date").value = pengumumanData.end_date || "";
            document.getElementById("is_active").value = pengumumanData.is_active ? "1" : "0"; 
        }
    }

    /**
     * Tambah pengumuman baru melalui modal
     */
    async function handleAddPengumuman() {
        const title = document.getElementById("modalTitle").value.trim();
        const category = document.getElementById("category").value.trim();
        const startDate = document.getElementById("start_date").value.trim();
        const endDate = document.getElementById("end_date").value.trim();
        const isActive = document.getElementById("is_active").value.trim();

        if (!title || !category || !startDate || !endDate) {
            showToast("Semua field wajib diisi!", "danger");
            return;
        }

        const requestBody = {
            title,
            category,
            start_date: startDate,
            end_date: endDate,
            is_active: isActive,
        };

        try {
            const response = await NetworkHelper.post(ENDPOINTS.SCHOOL_ANNOUNCEMENTS.CREATE, requestBody);

            if (response.message === "Announcement created successfully") {
                showToast("Pengumuman added successfully!", "success");
                addAnnouncementModal.hide();
                fetchAnnouncements(currentPage);
            } else {
                console.error("Failed to add pengumuman:", response.message);
                showToast("Gagal menambahkan pengumuman, coba lagi.", "danger");
            }
        } catch (error) {
            console.error("Error adding pengumuman:", error);
            showToast("Terjadi kesalahan saat menambahkan pengumuman.", "danger");
        }
    }

    addNewRecordBtn.addEventListener("click", () => {
        resetForm("add");
        addAnnouncementModal.show();
    });

    editAnnouncementForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Mencegah reload halaman
        const mode = document.getElementById("editAnnouncement").getAttribute("data-mode");

        if (mode === "add") {
            await handleAddPengumuman(); // Panggil fungsi tambah pengumuman
        } else if (mode === "edit") {
            const pengumumanId = document.getElementById("pengumumanId").value;
            await handleUpdatePengumuman(pengumumanId); // Panggil fungsi edit pengumuman
        }
    });

    fetchAnnouncements(currentPage); // Fetch data pengumuman saat halaman di-load
}
