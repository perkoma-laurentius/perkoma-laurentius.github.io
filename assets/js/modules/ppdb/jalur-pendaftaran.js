import { NetworkHelper } from '../../config/networkHelper.js';
import { ENDPOINTS } from '../../config/endpoint.js';
import { showToast } from '../../config/toast.js';
import { navigate } from '../main.js';

/**
 * Inisialisasi halaman Jalur Periode
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const addJalurPeriodeModal = new bootstrap.Modal(document.getElementById("editJalurPeriode")); 
    const addNewRecordBtn = document.getElementById("addNewRecordBtn");
    const editJalurPeriodeForm = document.getElementById("editJalurPeriodeForm");

    const paginationContainer = document.createElement("div");
    paginationContainer.className = "d-flex justify-content-between align-items-center p-3";
    document.querySelector(".card-datatable").appendChild(paginationContainer);

    let currentPage = 1;

    /**
     * Fetch data jalur periode dari server dan render ke tabel
     */
    async function fetchJalurPeriode(page = 1) {
        try {
            const response = await NetworkHelper.get(`${ENDPOINTS.PPDB_JALUR_PERIODE.GET_LIST}?page=${page}&size=10`);

            if (response && response.data) {
                const { items, pagination } = response.data;

                renderTable(items);
                renderPagination(pagination);
            } else {
                console.error("Failed to fetch jalur periode:", response.message);
                showToast("Gagal mengambil data jalur periode!", "danger");
            }
        } catch (error) {
            console.error("Error fetching jalur periode:", error);
            showToast("Terjadi kesalahan saat mengambil data jalur periode.", "danger");
        }
    }

    /**
     * Render data jalur periode ke dalam tabel
     */
    function renderTable(data) {
        tableBody.innerHTML = "";

        data.forEach((periode, index) => {
            // Tentukan status berdasarkan tanggal
            const currentDate = new Date();
            const periodeMulai = new Date(periode.periode_mulai);
            const periodeSelesai = new Date(periode.periode_selesai);
        
            let status = "Belum Dibuka";
            let statusClass = "btn-warning"; // Default warna untuk "Belum Dibuka"
        
            if (currentDate >= periodeMulai && currentDate <= periodeSelesai) {
                status = "Sedang Berlangsung";
                statusClass = "btn-success"; // Warna hijau untuk "Sedang Berlangsung"
            } else if (currentDate > periodeSelesai) {
                status = "Berakhir";
                statusClass = "btn-danger"; // Warna merah untuk "Berakhir"
            }
            // Render baris tabel
            const row = `
        <tr>
            <td>${index + 1}</td>
            <td>${periode.nama_jalur}</td>
            <td>${periode.periode_mulai}</td>
            <td>${periode.periode_selesai}</td>
            <td>${periode.deskripsi}</td>
            <td>
                <button class="btn btn-sm ${statusClass} status-btn">${status}</button>
            </td>
            <td>
             <button class="btn btn-sm btn-secondary me-2 view-students-btn" data-id="${periode.id}">
                    <i class="ti ti-pencil"></i> Lihat Siswa
                </button>
                <button class="btn btn-sm btn-primary me-2 edit-btn" data-id="${periode.id}">
                    <i class="ti ti-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${periode.id}">
                    <i class="ti ti-trash"></i> Delete
                </button>
            </td>
        </tr>
    `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });
        
        document.querySelectorAll(".view-students-btn").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id"); // Ambil ID dari data-id
                localStorage.setItem("selectedJalurId", id); // Simpan ID ke localStorage
                showToast(`ID Jalur ${id} disimpan ke localStorage`, "success");
                navigate('SISWA_BY_JALUR');            });
        });
        // Event listener untuk tombol Edit
        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                handleEditJalurPeriode(id);
            });
        });

        // Event listener untuk tombol Delete
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                handleDeleteJalurPeriode(id);
            });
        });
    }

    /**
     * Handle Edit Jalur Periode
     */
    async function handleEditJalurPeriode(periodeId) {
        try {
            const response = await NetworkHelper.get(ENDPOINTS.PPDB_JALUR_PERIODE.GET_BY_ID(periodeId));
            if (response && response.data) {
                resetForm("edit", response.data);
                addJalurPeriodeModal.show();

                // Submit form untuk update
                editJalurPeriodeForm.onsubmit = async (e) => {
                    e.preventDefault();
                    await handleUpdateJalurPeriode(periodeId);
                };
            } else {
                showToast("Gagal memuat data jalur periode!", "danger");
            }
        } catch (error) {
            console.error("Error fetching jalur periode:", error);
            showToast("Terjadi kesalahan saat memuat data jalur periode.", "danger");
        }
    }

    /**
     * Handle Update Jalur Periode
     */
    async function handleUpdateJalurPeriode(periodeId) {
        const namaJalur = document.getElementById("namaJalur").value.trim();
        const periodeMulai = document.getElementById("periodeMulai").value.trim();
        const periodeSelesai = document.getElementById("periodeSelesai").value.trim();
        const deskripsi = document.getElementById("deskripsi").value.trim();

        if (!namaJalur || !periodeMulai || !periodeSelesai) {
            showToast("Semua field wajib diisi!", "danger");
            return;
        }

        const requestBody = {
            nama_jalur: namaJalur,
            periode_mulai: periodeMulai,
            periode_selesai: periodeSelesai,
            deskripsi: deskripsi
        };

        try {
            const response = await NetworkHelper.put(ENDPOINTS.PPDB_JALUR_PERIODE.UPDATE(periodeId), requestBody);

            if (response.status && response.code === "SUCCESS") {
                showToast("Jalur periode updated successfully!", "success");
                addJalurPeriodeModal.hide();
                fetchJalurPeriode(currentPage);
            } else {
                console.error("Failed to update jalur periode:", response.message);
                showToast("Gagal memperbarui jalur periode, coba lagi.", "danger");
            }
        } catch (error) {
            console.error("Error updating jalur periode:", error);
            showToast("Terjadi kesalahan saat memperbarui jalur periode.", "danger");
        }
    }

    /**
     * Tambah Jalur Periode
     */
    async function handleAddJalurPeriode() {
        const namaJalur = document.getElementById("namaJalur").value.trim();
        const periodeMulai = document.getElementById("periodeMulai").value.trim();
        const periodeSelesai = document.getElementById("periodeSelesai").value.trim();
        const deskripsi = document.getElementById("deskripsi").value.trim();

        if (!namaJalur || !periodeMulai || !periodeSelesai) {
            showToast("Semua field wajib diisi!", "danger");
            return;
        }

        const requestBody = {
            nama_jalur: namaJalur,
            periode_mulai: periodeMulai,
            periode_selesai: periodeSelesai,
            deskripsi: deskripsi
        };

        try {
            const response = await NetworkHelper.post(ENDPOINTS.PPDB_JALUR_PERIODE.CREATE, requestBody);

            if (response.status && response.code === "SUCCESS") {
                showToast("Jalur periode added successfully!", "success");
                addJalurPeriodeModal.hide();
                fetchJalurPeriode(currentPage);
            } else {
                console.error("Failed to add jalur periode:", response.message);
                showToast("Gagal menambahkan jalur periode, coba lagi.", "danger");
            }
        } catch (error) {
            console.error("Error adding jalur periode:", error);
            showToast("Terjadi kesalahan saat menambahkan jalur periode.", "danger");
        }
    }

    /**
     * Handle Delete Jalur Periode
     */
    async function handleDeleteJalurPeriode(periodeId) {
        const userConfirmed = confirm("Apakah Anda yakin ingin menghapus jalur periode ini? Data yang dihapus tidak dapat dikembalikan!");

        if (userConfirmed) {
            try {
                const response = await NetworkHelper.delete(ENDPOINTS.PPDB_JALUR_PERIODE.DELETE(periodeId));

                if (response.status && response.code === "SUCCESS") {
                    showToast(response.message, "success");
                    fetchJalurPeriode(currentPage);
                } else {
                    console.error("Failed to delete jalur periode:", response.message);
                    showToast("Gagal menghapus jalur periode, coba lagi.", "danger");
                }
            } catch (error) {
                console.error("Error deleting jalur periode:", error);
                showToast("Terjadi kesalahan saat menghapus jalur periode.", "danger");
            }
        }
    }

    /**
     * Reset form input modal
     */
    function resetForm(mode, periodeData = null) {
        document.getElementById("editJalurPeriode").setAttribute("data-mode", mode);
        const modalTitle = document.getElementById("modalTitle");
        const modalDescription = document.getElementById("modalDescription");

        if (mode === "add") {
            modalTitle.textContent = "Tambah Jalur Periode";
            modalDescription.textContent = "Isi form di bawah ini untuk menambahkan jalur periode baru.";
            editJalurPeriodeForm.reset();
        } else if (mode === "edit" && periodeData) {
            modalTitle.textContent = "Edit Jalur Periode";
            modalDescription.textContent = "Ubah informasi jalur periode di bawah ini.";
            document.getElementById("namaJalur").value = periodeData.nama_jalur || "";
            document.getElementById("periodeMulai").value = periodeData.periode_mulai || "";
            document.getElementById("periodeSelesai").value = periodeData.periode_selesai || "";
            document.getElementById("deskripsi").value = periodeData.deskripsi || "";
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
                fetchJalurPeriode(currentPage);
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
                fetchJalurPeriode(currentPage);
            }
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
    }

    addNewRecordBtn.addEventListener("click", () => {
        resetForm("add");
        addJalurPeriodeModal.show();

        // Tambahkan event listener untuk submit form pada mode tambah
        editJalurPeriodeForm.onsubmit = async (e) => {
            e.preventDefault();
            await handleAddJalurPeriode();
        };
    });

    fetchJalurPeriode(currentPage);
}
