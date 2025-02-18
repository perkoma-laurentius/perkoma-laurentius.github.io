import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { showToast } from '../config/toast.js';

/**
 * Inisialisasi halaman dan event listener
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const bintangModal = new bootstrap.Modal(document.getElementById("editBintang"));
    const editBintangForm = document.getElementById("editBintangForm");
    const addNewBintangBtn = document.getElementById("addNewBintangBtn");
    let pertemuanSelect = document.getElementById("pertemuan_id");
    const searchInput = document.getElementById("searchInput"); // Input pencarian

    let pesertaSelect = document.getElementById("peserta_id");
    const pendampingId = localStorage.getItem("pendamping_id");
    const pendampingid = 4;
    let currentPage = 1;
    let currentSearch = ""; // Menyimpan nilai pencarian

    // Buat container pagination di dalam card-datatable
    const paginationContainer = document.createElement("div");
    paginationContainer.className = "d-flex justify-content-between align-items-center p-3";
    document.querySelector(".card-datatable").appendChild(paginationContainer);

    addNewBintangBtn.addEventListener("click", () => {
        editBintangForm.reset();
        fetchPertemuan();
        fetchPeserta();
        fetchPendamping();
        bintangModal.show();
    });

    editBintangForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await createBintang();
    });
// Event listener untuk pencarian
let debounceTimeout;
    searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            currentSearch = searchInput.value.trim();
            fetchAllBintang(1, currentSearch); // Reset ke halaman 1 saat mencari
        }, 300); // Tunggu 300ms sebelum fetch
    });
    fetchAllBintang(currentPage);
}
   


/**
 * Fetch semua data bintang dari server dan render ke tabel
 */
async function fetchAllBintang(page = 1, search = "") {
    try {
        console.log(`Fetching data for page: ${page} with search: "${search}"`);
        const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
        const response = await NetworkHelper.get(`${ENDPOINTS.BINTANG.GET_ALL}?page=${page}&size=10${searchParam}`);

        if (response.statusCode === 200 && response.data) {
            console.log("Data fetched successfully:", response);
            renderTable(response.data.items);
            renderPagination(response.data.pagination, search);
        } else {
            console.error("Failed to fetch bintang data:", response?.message || "Unknown error");
            showToast("Gagal mengambil data bintang!", "danger");
        }
    } catch (error) {
        console.error("Error fetching bintang data:", error);
        showToast("Terjadi kesalahan saat mengambil data bintang.", "danger");
    }
}

    /**
 * Render navigasi pagination
 */
function renderPagination(pagination) {
    const paginationContainer = document.querySelector(".card-datatable .d-flex");

    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    const prevBtn = document.createElement("button");
    prevBtn.className = "btn btn-sm btn-secondary";
    prevBtn.textContent = "Previous";
    prevBtn.disabled = pagination.currentPage === 1;
    prevBtn.addEventListener("click", () => {
        if (pagination.currentPage > 1) {
            fetchAllBintang(pagination.currentPage - 1);
        }
    });

    const pageInfo = document.createElement("span");
    pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;

    const nextBtn = document.createElement("button");
    nextBtn.className = "btn btn-sm btn-secondary";
    nextBtn.textContent = "Next";
    nextBtn.disabled = pagination.currentPage === pagination.totalPages;
    nextBtn.addEventListener("click", () => {
        if (pagination.currentPage < pagination.totalPages) {
            fetchAllBintang(pagination.currentPage + 1);
        }
    });

    paginationContainer.appendChild(prevBtn);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextBtn);
}


/**
 * Render data bintang ke dalam tabel dengan nama lengkap
 */
function renderTable(data) {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    data.forEach((bintang, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${bintang.pertemuan_nama} (${bintang.pertemuan_tanggal})</td>
                <td>${bintang.peserta_nama}</td>
                <td>${bintang.pendamping_nama}</td>
                <td>${bintang.jumlah_bintang || "-"}</td>
                <td>${bintang.bintang_bonus}</td>
                <td>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${bintang.bintang_id}">Hapus</button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", row);
    });
}

/**
 * Fetch daftar pendamping dan isi dropdown
 */
async function fetchPendamping() {
    let pendampingSelect = document.getElementById("pendamping_id");
    try {
        const response = await NetworkHelper.get(ENDPOINTS.PENDAMPING.GET_ALL);
        if (response.statusCode === 200 && response.data.items) {
            pendampingSelect.innerHTML = '<option value="">Pilih Pendamping</option>' + 
                response.data.items.map(item => `<option value="${item.id}">${item.nama}</option>`).join('');
        }
    } catch (error) {
        console.error("Error fetching pendamping:", error);
    }
}


/**
 * Fetch daftar pertemuan dan isi dropdown
 */
async function fetchPertemuan() {
    let pertemuanSelect = document.getElementById("pertemuan_id");
    try {
        const response = await NetworkHelper.get(ENDPOINTS.PERTEMUAN.GET_ALL);
        if (response.statusCode === 200 && response.data.items) {
            pertemuanSelect.innerHTML = '<option value="">Pilih Pertemuan</option>' + 
                response.data.items.map(item => `<option value="${item.id}">${item.nama}</option>`).join('');
        }
    } catch (error) {
        console.error("Error fetching pertemuan:", error);
    }
}


/**
 * Fetch daftar peserta dan isi dropdown
 */
async function fetchPeserta() {
    let pesertaSelect = document.getElementById("peserta_id");
    try {
        const response = await NetworkHelper.get(ENDPOINTS.STUDENTS.GET_STUDENTS);
        if (response.statusCode === 200 && response.data.items) {
            pesertaSelect.innerHTML = '<option value="">Pilih Peserta</option>' + 
                response.data.items.map(item => `<option value="${item.id}">${item.nama}</option>`).join('');
        }
    } catch (error) {
        console.error("Error fetching peserta:", error);
    }
}
/**
 * Tambahkan event listener untuk delete button
 */
document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-btn")) {
        const bintangId = event.target.getAttribute("data-id");

        if (confirm("Apakah Anda yakin ingin menghapus bintang ini?")) {
            await deleteBintang(bintangId);
        }
    }
});

/**
 * Hapus bintang berdasarkan ID
 */
async function deleteBintang(bintangId) {
    try {
        const response = await NetworkHelper.delete(`${ENDPOINTS.BINTANG.DELETE}/${bintangId}`);

        if (response.statusCode === 200) {
            showToast("Bintang berhasil dihapus!", "success");
            fetchAllBintang(); // Refresh tabel setelah penghapusan
        } else if (response.statusCode === 404) {
            showToast("Bintang tidak ditemukan!", "warning");
        } else {
            showToast("Gagal menghapus bintang!", "danger");
        }
    } catch (error) {
        console.error("Error deleting bintang:", error);
        showToast("Terjadi kesalahan saat menghapus bintang.", "danger");
    }
}

/**
 * Tambah bintang baru
 */
async function createBintang() {
    let pertemuanSelect = document.getElementById("pertemuan_id");
    let pesertaSelect = document.getElementById("peserta_id");
    let pendampingSelect = document.getElementById("pendamping_id");

    const jumlahBintang = document.getElementById("jumlah_bintang").value;
    const bintangBonus = document.getElementById("bintang_bonus").value;

    // **Pastikan hanya mengirim jumlah_bintang atau bintang_bonus jika ada isinya**
    const bintangData = {};
    if (jumlahBintang) bintangData.jumlah_bintang = parseInt(jumlahBintang, 10);
    if (bintangBonus) bintangData.bintang_bonus = parseInt(bintangBonus, 10);

    const requestBody = {
        pendamping_id: pendampingSelect.value,
        bintang_list: [
            {
                pertemuan_id: pertemuanSelect.value,
                peserta_id: pesertaSelect.value,
                ...bintangData
            }
        ]
    };

    try {
        const response = await NetworkHelper.post(ENDPOINTS.BINTANG.CREATE, requestBody);

        if (response.statusCode === 201) {
            showToast(response.message || "Bintang berhasil ditambahkan!", "success");
            fetchAllBintang();
            document.getElementById("editBintangForm").reset();
            const bintangModal = bootstrap.Modal.getInstance(document.getElementById("editBintang"));
            bintangModal.hide();
        } else {
            showToast(response.message || "Gagal menambahkan bintang!", "danger");
        }
    } catch (error) {
        console.error("Error creating bintang:", error);
        showToast("Terjadi kesalahan saat menambahkan bintang.", "danger");
    }
}

