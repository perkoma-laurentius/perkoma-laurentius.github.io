import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { showToast } from '../config/toast.js';

/**
 * Inisialisasi halaman Presensi
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const presensiModal = new bootstrap.Modal(document.getElementById("editPresensi"));
    const editPresensiForm = document.getElementById("editPresensiForm");
    const addNewPresensiBtn = document.getElementById("addNewPresensiBtn");

    let currentPage = 1;

    /**
     * Fetch daftar presensi dari server dan render ke dalam tabel
     */
    async function fetchPresensi(page = 1) {
        try {
            const response = await NetworkHelper.get(`${ENDPOINTS.ABSENSI.GET_ALL}?page=${page}&size=10`);
            
            if (response.statusCode === 200 && response.data.items) {
                const { items, pagination } = response.data;
                renderTable(items);
                renderPagination(pagination);
            } else {
                showToast("Gagal mengambil data presensi!", "danger");
            }
        } catch (error) {
            console.error("Error fetching presensi:", error);
            showToast("Terjadi kesalahan saat mengambil data presensi.", "danger");
        }
    }

    /**
     * Ambil daftar pertemuan untuk dropdown
     */
    
    async function fetchPertemuanOptions(selectedPertemuanId = null) {
        try {
            const response = await NetworkHelper.get(ENDPOINTS.PERTEMUAN.GET_ALL);
            const pertemuanSelect = document.getElementById("pertemuan_id");
    
            pertemuanSelect.innerHTML = `<option value="">Pilih Pertemuan</option>`;
    
            // ✅ Pastikan mengambil data dari `data.items`
            if (response.statusCode === 200 && response.data && Array.isArray(response.data.items)) {
                response.data.items.forEach(pertemuan => {
                    pertemuanSelect.innerHTML += `
                        <option value="${pertemuan.id}" ${selectedPertemuanId == pertemuan.id ? "selected" : ""}>
                            ${pertemuan.nama}
                        </option>
                    `;
                });
    
                pertemuanSelect.disabled = false;
            } else {
                console.error("Response format invalid:", response);
                showToast("Data pertemuan tidak valid.", "danger");
            }
        } catch (error) {
            console.error("Error fetching pertemuan:", error);
            showToast("Terjadi kesalahan saat mengambil data pertemuan.", "danger");
        }
    }
    


/**
     * Ambil daftar kelompok untuk dropdown
     */
async function fetchKelompokOptions(selectedKelompokId = null) {
    try {
        const response = await NetworkHelper.get(ENDPOINTS.KELOMPOK.GET_ALL);
        const kelompokSelect = document.getElementById("kelompok_id");
        
        kelompokSelect.innerHTML = `<option value="">Pilih Kelompok</option>`;

        if (response.statusCode === 200 && Array.isArray(response.data)) {
            response.data.forEach(kelompok => {
                kelompokSelect.innerHTML += `
                    <option value="${kelompok.id}" ${selectedKelompokId == kelompok.id ? "selected" : ""}>
                        ${kelompok.nama_kelompok}
                    </option>
                `;
            });

            kelompokSelect.disabled = false;
        } else {
            console.error("Response format invalid:", response);
            showToast("Data kelompok tidak valid.", "danger");
        }
    } catch (error) {
        console.error("Error fetching kelompok:", error);
        showToast("Terjadi kesalahan saat mengambil data kelompok.", "danger");
    }
}


    /**
     * Ambil daftar peserta berdasarkan kelompok yang dipilih
     * 
     */
    async function fetchPesertaByKelompok(kelompok_id, selectedPesertaId = null) {
    try {
        const response = await NetworkHelper.get(ENDPOINTS.KELOMPOK.GET_PESERTA_BY_KELOMPOK(kelompok_id));
        const pesertaSelect = document.getElementById("peserta_id");

        pesertaSelect.innerHTML = `<option value="">Pilih Peserta</option>`;

        if (response.statusCode === 200 && Array.isArray(response.data)) {
            response.data.forEach(peserta => {
                pesertaSelect.innerHTML += `
                    <option value="${peserta.peserta_id}" ${selectedPesertaId == peserta.peserta_id ? "selected" : ""}>
                        ${peserta.nama}
                    </option>
                `;
            });

            pesertaSelect.disabled = false;
        } else {
            pesertaSelect.disabled = true;
        }
    } catch (error) {
        console.error("Error fetching peserta by kelompok:", error);
    }
}

    

    // // ** Event Listener untuk Dropdown **
    // document.getElementById("kelompok_id").addEventListener("change", function () {
    //     const kelompok_id = this.value;
    //     if (kelompok_id) {
    //         fetchPesertaByKelompok(kelompok_id);
    //     } else {
    //         document.getElementById("peserta_id").innerHTML = `<option value="">Pilih Peserta</option>`;
    //         document.getElementById("peserta_id").disabled = true;
    //     }
    // });
    


    /**
     * Render data presensi ke dalam tabel
     */
    function renderTable(data) {
        tableBody.innerHTML = "";

        data.forEach((presensi, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${presensi.nama_pertemuan || "Tidak Tersedia"}</td>
                    <td>${presensi.tanggal_pertemuan || "Tidak Tersedia"}</td>
                    <td>${presensi.nama_peserta || "Tidak Tersedia"}</td>
                    <td>${presensi.status || "Tidak Tersedia"}</td>
                    <td>${new Date(presensi.updated_at).toLocaleDateString() || "Tidak Tersedia"}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-2 edit-btn" data-id="${presensi.absensi_id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${presensi.absensi_id}">Hapus</button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });

        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", () => handleEditPresensi(button.getAttribute("data-id")));
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", () => handleDeletePresensi(button.getAttribute("data-id")));
        });
    }

    /**
     * Tambah presensi baru
     */
    addNewPresensiBtn.addEventListener("click", async () => {
        resetForm("add");
        presensiModal.show();
    
        // Fetch semua kelompok
        await fetchKelompokOptions();
        
        // Fetch semua pertemuan setelah kelompok tersedia
        await fetchPertemuanOptions();
    
        // Set event listener untuk trigger peserta berdasarkan kelompok
        document.getElementById("kelompok_id").addEventListener("change", function () {
            const kelompok_id = this.value;
            if (kelompok_id) {
                fetchPesertaByKelompok(kelompok_id);
            } else {
                document.getElementById("peserta_id").innerHTML = `<option value="">Pilih Peserta</option>`;
                document.getElementById("peserta_id").disabled = true;
            }
        });
    
        editPresensiForm.onsubmit = async (e) => {
            e.preventDefault();
            createPresensi();
        };
    });
    

    async function createPresensi() {
        const requestBody = {
            pertemuan_id: document.getElementById("pertemuan_id").value,
            peserta_id: document.getElementById("peserta_id").value,
            status: document.getElementById("status").value
        };

        try {
            const response = await NetworkHelper.post(ENDPOINTS.ABSENSI.CREATE, requestBody);
            if (response.statusCode === 201) {
                showToast("Presensi berhasil ditambahkan!", "success");
                fetchPresensi();
                presensiModal.hide();
            } else if (response.statusCode === 400 || response.message === "Peserta sudah melakukan absensi") {
                showToast(response.message, "warning"); // 🔥 Tampilkan pesan dari server
            } else {
                showToast("Gagal menambahkan presensi!", "danger");
            }
        } catch (error) {
            showToast(error.message || "Terjadi kesalahan saat menambahkan presensi.", "danger");        }
    }

/**
 * Render navigasi pagination
 */
function renderPagination(pagination) {
    const paginationContainer = document.querySelector(".pagination-container");
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    const prevBtn = document.createElement("button");
    prevBtn.className = "btn btn-sm btn-secondary";
    prevBtn.textContent = "Previous";
    prevBtn.disabled = !pagination.urls.prev;
    prevBtn.addEventListener("click", () => fetchPresensi(pagination.currentPage - 1));

    const pageInfo = document.createElement("span");
    pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;

    const nextBtn = document.createElement("button");
    nextBtn.className = "btn btn-sm btn-secondary";
    nextBtn.textContent = "Next";
    nextBtn.disabled = !pagination.urls.next;
    nextBtn.addEventListener("click", () => fetchPresensi(pagination.currentPage + 1));

    paginationContainer.appendChild(prevBtn);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextBtn);
}
/**
 * Reset form modal sebelum menambah atau mengedit presensi peserta
 * @param {string} mode - "add" untuk tambah, "edit" untuk edit
 * @param {Object} data - Data yang akan diisi ke dalam form (jika edit)
 */
function resetForm(mode, data = null) {
    document.getElementById("editPresensiForm").reset(); // Reset semua input form

    if (mode === "add") {
        document.getElementById("modalTitle").textContent = "Tambah Presensi";
        document.getElementById("modalDescription").textContent = "Isi form untuk menambahkan presensi peserta.";
    } else if (mode === "edit" && data) {
        document.getElementById("modalTitle").textContent = "Edit Presensi";
        document.getElementById("modalDescription").textContent = "Ubah informasi presensi peserta.";

        document.getElementById("pertemuan_id").value = data.pertemuan_id;
        document.getElementById("peserta_id").value = data.peserta_id;
        document.getElementById("status").value = data.status;
    }
}
async function handleEditPresensi(id) {
    try {
        const response = await NetworkHelper.get(ENDPOINTS.ABSENSI.GET_BY_ID(id));

        if (response.statusCode === 200) {
            const data = response.data;

            // 🔥 Pastikan dropdown pertemuan, kelompok, peserta, dan status langsung terisi
            await fetchPertemuanOptions(data.pertemuan_id);
            await fetchKelompokOptions(data.kelompok_id);
            await fetchPesertaByKelompok(data.kelompok_id, data.peserta_id);

            // 🔥 Set status
            document.getElementById("status").value = data.status;

            // 🔥 Aktifkan semua dropdown
            document.getElementById("pertemuan_id").disabled = false;
            document.getElementById("kelompok_id").disabled = false;
            document.getElementById("peserta_id").disabled = false;
            document.getElementById("status").disabled = false;

            // 🔥 Tampilkan modal edit setelah data selesai dimuat
            presensiModal.show();
        } else {
            showToast("Gagal memuat data presensi!", "danger");
        }
    } catch (error) {
        showToast("Terjadi kesalahan saat memuat data presensi.", "danger");
    }
}
    
    async function handleDeletePresensi(id) {
        if (confirm("Apakah Anda yakin ingin menghapus presensi ini?")) {
            try {
                const response = await NetworkHelper.delete(ENDPOINTS.ABSENSI.DELETE(id));
    
                if (response.statusCode === 200) {
                    showToast("Presensi berhasil dihapus!", "success");
                    fetchPresensi();
                } else {
                    showToast("Gagal menghapus presensi!", "danger");
                }
            } catch (error) {
                showToast("Terjadi kesalahan saat menghapus presensi.", "danger");
            }
        }
    }



    fetchPresensi(currentPage);
}
