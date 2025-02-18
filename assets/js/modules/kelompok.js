import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { showToast } from '../config/toast.js';
import { navigate } from '../modules/main.js';
/**
 * Inisialisasi halaman Kelompok
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const kelompokModal = new bootstrap.Modal(document.getElementById("editKelompok"));
    const editKelompokForm = document.getElementById("editKelompokForm");
    const addNewKelompokBtn = document.getElementById("addNewKelompokBtn");
    const pendampingSelect = document.getElementById("pendamping_id");


    let currentPage = 1;
    /**
     * Fetch daftar pendamping untuk dropdown
     */
    async function fetchPendampingOptions(selectedPendampingId = null) {
        try {
            const response = await NetworkHelper.get(`${ENDPOINTS.PENDAMPING.GET_ALL}?page=1&size=100`);
            pendampingSelect.innerHTML = `<option value="">Pilih Pendamping</option>`;

            if (response.statusCode === 200 && response.data.items) {
                response.data.items.forEach(pendamping => {
                    pendampingSelect.innerHTML += `
                        <option value="${pendamping.id}" ${selectedPendampingId == pendamping.id ? "selected" : ""}>
                            ${pendamping.nama}
                        </option>
                    `;
                });

                pendampingSelect.disabled = false;
            } else {
                console.error("Response format invalid:", response);
                showToast("Data pendamping tidak valid.", "danger");
            }
        } catch (error) {
            console.error("Error fetching pendamping:", error);
            showToast("Terjadi kesalahan saat mengambil data pendamping.", "danger");
        }
    }

    /**
     * Fetch daftar kelompok dari server dan render ke dalam tabel
     */
    async function fetchKelompok(page = 1) {
        try {
            const response = await NetworkHelper.get(`${ENDPOINTS.KELOMPOK.GET_ALL}?page=${page}&size=10`);
            
            if (response.statusCode === 200 && response.data) {
                const { data } = response;
                renderTable(data);
            } else {
                showToast("Gagal mengambil data kelompok!", "danger");
            }
        } catch (error) {
            console.error("Error fetching kelompok:", error);
            showToast("Terjadi kesalahan saat mengambil data kelompok.", "danger");
        }
    }

    /**
     * Render data kelompok ke dalam tabel
     */
    function renderTable(data) {
        tableBody.innerHTML = "";

        data.forEach((kelompok, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${kelompok.nama_kelompok || "Tidak Tersedia"}</td>
                    <td>${kelompok.nama_pendamping || "Tidak Tersedia"}</td>
                    <td>${new Date(kelompok.created_at).toLocaleDateString() || "Tidak Tersedia"}</td>
                    <td style="text-align: center;">
                                            
                        <button class="btn btn-sm btn-warning me-2 kelola-btn" data-id="${kelompok.id}">Kelola Peserta</button>
                        <button class="btn btn-sm btn-primary me-2 edit-btn" data-id="${kelompok.id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${kelompok.id}">Hapus</button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });

        document.querySelectorAll(".kelola-btn").forEach(button => {
            button.addEventListener("click", function () {
                const kelompokId = this.getAttribute("data-id");
                navigate("KELOLA_PESERTA", { kelompok_id: kelompokId });
            });
        });
        
        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", () => handleEditKelompok(button.getAttribute("data-id")));
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", () => handleDeleteKelompok(button.getAttribute("data-id")));
        });
    }

    /**
     * Tambah kelompok baru
     */
    addNewKelompokBtn.addEventListener("click", async ()  => {
        resetForm("add");
        await fetchPendampingOptions();

        kelompokModal.show();
        editKelompokForm.onsubmit = async (e) => {
            e.preventDefault();
            createKelompok();
        };
    });
    async function createKelompok() {
        const namaKelompokInput = document.getElementById("nama_kelompok");
        const pendampingSelect = document.getElementById("pendamping_id");
    
        if (!namaKelompokInput) {
            console.error("Element nama_kelompok tidak ditemukan!");
            showToast("Terjadi kesalahan: Input nama kelompok tidak ditemukan.", "danger");
            return;
        }
    
        const namaKelompok = namaKelompokInput.value.trim();
        const pendampingId = pendampingSelect.value;
    
        // Validasi input
        if (!namaKelompok) {
            showToast("Nama kelompok tidak boleh kosong!", "warning");
            return;
        }
    
        if (!pendampingId) {
            showToast("Harap pilih pendamping!", "warning");
            return;
        }
    
        const requestBody = {
            nama: namaKelompok,
            pendamping_id: pendampingId
        };
    
        try {
            const response = await NetworkHelper.post(ENDPOINTS.KELOMPOK.CREATE, requestBody);
            if (response.statusCode === 201) {
                showToast("Kelompok berhasil ditambahkan!", "success");
                fetchKelompok();
                kelompokModal.hide();
            } else {
                showToast(response.message || "Gagal menambahkan kelompok!", "danger");
            }
        } catch (error) {
            showToast(error.message || "Terjadi kesalahan saat menambahkan kelompok.", "danger");
        }
    }
    
    

    async function handleEditKelompok(id) {
        try {
            const response = await NetworkHelper.get(ENDPOINTS.KELOMPOK.GET_BY_ID(id));
            if (response.statusCode === 200) {
                const data = response.data;
                document.getElementById("nama_kelompok").value = data.nama_kelompok;
                document.getElementById("pendamping_id").value = data.pendamping_id;
                kelompokModal.show();
            } else {
                showToast("Gagal memuat data kelompok!", "danger");
            }
        } catch (error) {
            showToast("Terjadi kesalahan saat memuat data kelompok.", "danger");
        }
    }

    async function handleDeleteKelompok(id) {
        if (confirm("Apakah Anda yakin ingin menghapus kelompok ini?")) {
            try {
                const response = await NetworkHelper.delete(ENDPOINTS.KELOMPOK.DELETE(id));
                if (response.statusCode === 200) {
                    showToast("Kelompok berhasil dihapus!", "success");
                    fetchKelompok();
                } else {
                    showToast("Gagal menghapus kelompok!", "danger");
                }
            } catch (error) {
                showToast("Terjadi kesalahan saat menghapus kelompok.", "danger");
            }
        }
    }

    function resetForm(mode) {
        document.getElementById("editKelompokForm").reset();
        document.getElementById("modalTitle").textContent = mode === "add" ? "Tambah Kelompok" : "Edit Kelompok";
    }

    fetchKelompok(currentPage);
}