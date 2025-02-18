import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { showToast } from '../config/toast.js';
import { navigate } from '../modules/main.js';

/**
 * Inisialisasi halaman Kelola Peserta
 */
export function init() {
    console.log("✅ kelola-peserta.js loaded successfully");

    // **Ambil Elemen DOM**
    const tableBody = document.getElementById("tableBody");
    const pesertaSearch = document.getElementById("peserta_search");
    const searchResultsContainer = document.getElementById("searchResults");
    const addPesertaBtn = document.getElementById("addNewPesertaBtn");
    const editPesertaForm = document.getElementById("editPesertaForm");
    const editPesertaModal = new bootstrap.Modal(document.getElementById("editPeserta"));

    
    // **Ambil kelompok_id dari URL**
    const kelompokId = new URLSearchParams(window.location.search).get("kelompok_id");

    // **Jika kelompok_id tidak ada, redirect ke halaman Kelompok**
    if (!kelompokId) {
        showToast("Kelompok tidak ditemukan!", "danger");
        navigate("KELOMPOK");
        return;
    }

    /**
     * Fetch daftar peserta berdasarkan pencarian
     */
    async function searchPeserta(query) {
        try {
            if (!searchResultsContainer) {
                console.error("❌ ERROR: searchResultsContainer tidak ditemukan!");
                return;
            }

            searchResultsContainer.innerHTML = `<div class="search-result-item">🔄 Memuat...</div>`;
            const response = await NetworkHelper.get(`${ENDPOINTS.STUDENTS.GET_STUDENTS}?search=${query}`);

            if (response.statusCode === 200 && response.data.items.length > 0) {
                renderSearchResults(response.data.items);
            } else {
                searchResultsContainer.innerHTML = `<div class="search-result-item">❌ Tidak ada hasil</div>`;
            }
        } catch (error) {
            console.error("Error fetching peserta:", error);
            showToast("Terjadi kesalahan saat mencari peserta.", "danger");
        }
    }

    /**
     * Render hasil pencarian peserta
     */
    function renderSearchResults(data) {
        searchResultsContainer.innerHTML = "";

        data.forEach(peserta => {
            const item = document.createElement("div");
            item.classList.add("search-result-item");
            item.textContent = peserta.nama;
            item.addEventListener("click", () => selectPeserta(peserta.id, peserta.nama));
            searchResultsContainer.appendChild(item);
        });
    }

    /**
     * Pilih peserta dari hasil pencarian
     */
    function selectPeserta(id, nama) {
        pesertaSearch.value = nama;
        pesertaSearch.setAttribute("data-selected-id", id);
        searchResultsContainer.innerHTML = ""; // Kosongkan hasil pencarian setelah memilih
    }

    /**
     * Tampilkan modal dan bersihkan pencarian
     */
    addPesertaBtn.addEventListener("click", () => {
        pesertaSearch.value = "";
        pesertaSearch.removeAttribute("data-selected-id");
        searchResultsContainer.innerHTML = "";
        editPesertaModal.show();
    });

    /**
     * Event listener untuk pencarian peserta
     */
    pesertaSearch.addEventListener("input", (event) => {
        const query = event.target.value.trim();
        if (query.length > 2) {
            searchPeserta(query);
        } else {
            searchResultsContainer.innerHTML = ""; // Kosongkan jika input kosong
        }
    });

    /**
     * Tambah peserta ke kelompok saat form dikirim
     */
    editPesertaForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const pesertaId = pesertaSearch.getAttribute("data-selected-id");
        if (!pesertaId) {
            showToast("Harap pilih peserta dari hasil pencarian!", "warning");
            return;
        }

        const requestBody = { kelompok_id: kelompokId, peserta_id: pesertaId };

        try {
            const response = await NetworkHelper.post(ENDPOINTS.KELOMPOK.ADD_PESERTA_TO_KELOMPOK, requestBody);
            if (response.statusCode === 201) {
                showToast("Peserta berhasil ditambahkan!", "success");
                editPesertaModal.hide();
                fetchPesertaByKelompok();
            } else {
                showToast(response.message || "Gagal menambahkan peserta!", "danger");
            }
        } catch (error) {
            showToast(error.message || "Terjadi kesalahan saat menambahkan peserta.", "danger");
        }
    });
 /**
     * Render daftar peserta dalam kelompok ke tabel
     */
 function renderTable(data) {
    tableBody.innerHTML = "";

    data.forEach((peserta, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${peserta.nama || "Tidak Tersedia"}</td>
                <td style="text-align: center;">
                    <button class="btn btn-sm btn-danger remove-btn" data-id="${peserta.peserta_id}">Hapus</button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", row);
    });


    document.querySelectorAll(".remove-btn").forEach(button => {
        button.addEventListener("click", function () {
            const pesertaId = this.getAttribute("data-id");
            removePesertaFromKelompok(pesertaId);
        });
    });
    
    }
    /**
     * Hapus peserta dari kelompok
     * @param {string} pesertaId - ID peserta
     * @returns {Promise<void>}
     * @throws {Error}
     * 
     * @example
     */
    async function removePesertaFromKelompok(pesertaId) {
        try {
            const response = await NetworkHelper.delete(ENDPOINTS.KELOMPOK.REMOVE_PESERTA_FROM_KELOMPOK(kelompokId, pesertaId));
            if (response.statusCode === 200) {
                showToast("Peserta berhasil dihapus dari kelompok!", "success");
                fetchPesertaByKelompok();
            } else {
                showToast("Gagal menghapus peserta dari kelompok!", "danger");
            }
        } catch (error) {
            console.error("Error removing peserta from kelompok:", error);
            showToast("Terjadi kesalahan saat menghapus peserta dari kelompok.", "danger");
        }}
    
    
    /**
     * Fetch daftar peserta dalam kelompok dan render ke tabel
     */
    async function fetchPesertaByKelompok() {
        try {
            const response = await NetworkHelper.get(ENDPOINTS.KELOMPOK.GET_PESERTA_BY_KELOMPOK(kelompokId));
            if (response.statusCode === 200 && Array.isArray(response.data)) {
                renderTable(response.data);
            } else {
                showToast("Gagal mengambil data peserta!", "danger");
            }
        } catch (error) {
            console.error("Error fetching peserta by kelompok:", error);
            showToast("Terjadi kesalahan saat mengambil data peserta.", "danger");
        }
    }

    /**
     * Panggil fungsi untuk mengambil data awal
     */
    fetchPesertaByKelompok();
}
