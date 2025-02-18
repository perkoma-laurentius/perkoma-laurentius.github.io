import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { showToast } from '../config/toast.js';

/**
 * Inisialisasi halaman Pertemuan
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const pertemuanModal = new bootstrap.Modal(document.getElementById("editPertemuan")); // ✅ Perbaiki ID Modal
    const editPertemuanForm = document.getElementById("editPertemuanForm"); // ✅ Perbaiki ID Form
    const addNewPertemuanBtn = document.getElementById("addNewPertemuanBtn"); // ✅ Perbaiki ID Tombol
    let currentPage = 1;

   /**
 * Fetch pertemuan dari server dan render ke dalam tabel
 */
async function fetchPertemuan(page = 1) {
    try {
        const response = await NetworkHelper.get(`${ENDPOINTS.PERTEMUAN.GET_ALL}?page=${page}&size=10`);
        
        if (response.statusCode === 200 && response.data.items) {
            const { items, pagination } = response.data;

            console.log("Data pertemuan dari API:", items); // 🔹 Debugging: Lihat apakah data benar-benar diterima
            renderTable(items); // 🔹 Render data ke tabel
            renderPagination(pagination); // 🔹 Render navigasi pagination
        } else {
            showToast("Gagal mengambil data pertemuan!", "danger");
        }
    } catch (error) {
        console.error("Error fetching pertemuan:", error);
        showToast("Terjadi kesalahan saat mengambil data pertemuan.", "danger");
    }
}
/**
 * Render navigasi pagination
 * @param {Object} pagination - Data pagination dari API
 */
function renderPagination(pagination) {
    const paginationContainer = document.querySelector(".card-datatable .pagination-container");
    if (!paginationContainer) return;

    paginationContainer.innerHTML = ""; // Bersihkan isi pagination sebelum render ulang

    const prevBtn = document.createElement("button");
    prevBtn.className = "btn btn-sm btn-secondary";
    prevBtn.textContent = "Previous";
    prevBtn.disabled = !pagination.urls.prev;
    prevBtn.addEventListener("click", () => {
        if (pagination.urls.prev) {
            fetchPertemuan(pagination.currentPage - 1);
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
            fetchPertemuan(pagination.currentPage + 1);
        }
    });

    paginationContainer.appendChild(prevBtn);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextBtn);
}



    /**
     * Render data pertemuan ke dalam tabel
     */
    function renderTable(data) {
        tableBody.innerHTML = "";

        data.forEach((pertemuan, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${pertemuan.nama || "Tidak Tersedia"}</td>
                    <td>${pertemuan.materi || "Tidak Tersedia"}</td>
                    <td>${new Date(pertemuan.tanggal).toLocaleDateString() || "Tidak Tersedia"}</td>
                    <td>${new Date(pertemuan.updated_at).toLocaleDateString() || "Tidak Tersedia"}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-2 edit-btn" data-id="${pertemuan.id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${pertemuan.id}">Hapus</button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });

        document.querySelectorAll(".edit-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const id = button.getAttribute("data-id");
                handleEditPertemuan(id);
            });
        });

        document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const id = button.getAttribute("data-id");
                handleDeletePertemuan(id);
            });
        });
    }

    /**
     * Tambah pertemuan baru
     */
    async function createPertemuan() {
        const requestBody = {
            nama: document.getElementById("nama_pertemuan").value.trim(),
            materi: document.getElementById("materi_pertemuan").value.trim(),
            tanggal: document.getElementById("tanggal_pertemuan").value.trim(),
        };
    
        try {
            const response = await NetworkHelper.post(ENDPOINTS.PERTEMUAN.CREATE, requestBody);
            if (response.statusCode === 201) {
                showToast("Pertemuan berhasil ditambahkan!", "success");
                fetchPertemuan();
                document.getElementById("editPertemuanForm").reset();
                const pertemuanModal = bootstrap.Modal.getInstance(document.getElementById("editPertemuan"));
                pertemuanModal.hide();
            } else {
                showToast("Gagal menambahkan pertemuan!", "danger");
            }
        } catch (error) {
            showToast("Terjadi kesalahan saat menambahkan pertemuan.", "danger");
        }
    }
    

    /**
     * Update pertemuan
     */
    async function handleEditPertemuan(id) {
        try {
            const response = await NetworkHelper.get(`${ENDPOINTS.PERTEMUAN.GET_BY_ID(id)}`);
            if (response) {
                resetForm("edit", response.data);
                pertemuanModal.show();

                editPertemuanForm.onsubmit = async (e) => {
                    e.preventDefault();
                    await updatePertemuan(id);
                };
            } else {
                showToast("Gagal memuat data pertemuan!", "danger");
            }
        } catch (error) {
            showToast("Terjadi kesalahan saat memuat data pertemuan.", "danger");
        }
    }

    async function updatePertemuan(id) {
        const requestBody = {
            nama: document.getElementById("nama_pertemuan").value.trim(),
            materi: document.getElementById("materi_pertemuan").value.trim(),
            tanggal: document.getElementById("tanggal_pertemuan").value.trim(),
        };

        try {
            const response = await NetworkHelper.put(ENDPOINTS.PERTEMUAN.UPDATE(id), requestBody);
            if (response.statusCode === 200) {
                showToast("Pertemuan berhasil diperbarui!", "success");
                fetchPertemuan();
                pertemuanModal.hide();
            } else {
                showToast("Gagal memperbarui pertemuan!", "danger");
            }
        } catch (error) {
            showToast("Terjadi kesalahan saat memperbarui pertemuan.", "danger");
        }
    }

    /**
     * Hapus pertemuan
     */
    async function handleDeletePertemuan(id) {
        if (!confirm("Apakah Anda yakin ingin menghapus pertemuan ini?")) return;

        try {
            const response = await NetworkHelper.delete(ENDPOINTS.PERTEMUAN.DELETE(id));
            if (response.statusCode === 200) {
                showToast("Pertemuan berhasil dihapus!", "success");
                fetchPertemuan();
            } else {
                showToast("Gagal menghapus pertemuan!", "danger");
            }
        } catch (error) {
            showToast("Terjadi kesalahan saat menghapus pertemuan.", "danger");
        }
    }

    /**
     * Reset form modal
     */
    function resetForm(mode, data = null) {
        if (mode === "add") {
            document.getElementById("editPertemuanForm").reset();
        } else if (mode === "edit" && data) {
            document.getElementById("nama_pertemuan").value = data.nama;
            document.getElementById("materi_pertemuan").value = data.materi;
            document.getElementById("tanggal_pertemuan").value = data.tanggal;
        }
    }

    addNewPertemuanBtn.addEventListener("click", () => {
        resetForm("add");
        pertemuanModal.show();
        editPertemuanForm.onsubmit = async (e) => {
            e.preventDefault();
            await createPertemuan();
        };
    });

    fetchPertemuan(currentPage);
}
