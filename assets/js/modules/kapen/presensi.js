import { NetworkHelper } from '../../config/networkHelper.js';
import { ENDPOINTS } from '../../config/endpoint.js';
import { showToast } from '../../config/toast.js';
import { navigate } from '../../modules/main.js';

/**
 * Inisialisasi halaman Presensi
 */
export function init() {
    console.log("✅ presensi.js loaded successfully");
    const urlParams = new URLSearchParams(window.location.search);
    const pertemuanId = urlParams.get("pertemuanId");

    const kelompokId = localStorage.getItem("kelompok_id");
    if (!kelompokId) {
        showToast("❌ Kelompok tidak ditemukan!", "danger");
        return;
    }

    // Event listener untuk pencarian dengan debounce
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        let debounceTimeout;
        searchInput.addEventListener("input", () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                const searchTerm = searchInput.value.trim().toLowerCase();
                filterPeserta(searchTerm);
            }, 300); // Delay 300ms sebelum pencarian dijalankan
        });
    }

    fetchAbsensiByKelompok(kelompokId, pertemuanId);
}
async function fetchAbsensiByKelompok(kelompokId, pertemuanId = null, page = 1, size = 15) {
    try {
        // Ambil ulang pertemuanId dari URL jika tidak ada di parameter
        if (!pertemuanId) {
            const urlParams = new URLSearchParams(window.location.search);
            pertemuanId = urlParams.get("pertemuanId");  // ✅ Pastikan pakai underscore `_`
        }

        if (!pertemuanId) {
            showToast("❌ Pertemuan tidak ditemukan!", "danger");
            return;
        }

        const url = ENDPOINTS.ABSENSI.GET_BY_KELOMPOK(kelompokId, pertemuanId, page, size);
        const response = await NetworkHelper.get(url);

        if (response.statusCode === 200 && response.data) {
            renderAbsensi(response.data.items);
            renderPagination(response.data.pagination, kelompokId, pertemuanId);
        } else {
            showToast("❌ Gagal mengambil data absensi!", "danger");
        }
    } catch (error) {
        console.error("❌ Error fetching absensi:", error);
        showToast("⚠️ Terjadi kesalahan saat mengambil data absensi.", "danger");
    }
}

/**
 * Render data absensi ke dalam list view
 */
function renderAbsensi(absensiList) {
    const listContainer = document.getElementById("listContainer");
    if (!listContainer) {
        console.error("❌ Element listContainer tidak ditemukan!");
        return;
    }
    listContainer.innerHTML = "";

    // Simpan data absensi ke dalam dataset untuk pencarian
    listContainer.dataset.absensi = JSON.stringify(absensiList);

    absensiList.forEach((absensi) => {
        let actionButtons = `
            <button class="btn btn-success btn-sm status-btn" data-peserta="${absensi.peserta_id}" data-pertemuan="${absensi.pertemuan_id}" data-status="Hadir">
                ✅ Hadir
            </button>
            <button class="btn btn-danger btn-sm status-btn" data-peserta="${absensi.peserta_id}" data-pertemuan="${absensi.pertemuan_id}" data-status="Tidak Hadir">
                ❌ Tidak Hadir
            </button>
          
        `;

        if (absensi.status_absensi !== "Belum Absen") {
            let btnClass = "";
            switch (absensi.status_absensi) {
                case "Hadir": btnClass = "btn-success"; break;
                case "Tidak Hadir": btnClass = "btn-danger"; break;
                case "Sakit": btnClass = "btn-warning"; break;
                case "Izin": btnClass = "btn-info"; break;
            }
            actionButtons = `<button class="btn ${btnClass} btn-sm w-100" disabled>${absensi.status_absensi}</button>`;
        }

        const cardHTML = `
            <div class="col-md-4 peserta-card" data-name="${absensi.nama_peserta.toLowerCase()}">
                <div class="card shadow-sm p-3 mb-3">
                    <h5 class="fw-bold">${absensi.nama_panggilan}</h5>
                    <p class="text-muted">${absensi.nama_pertemuan} - ${new Date(absensi.tanggal_pertemuan).toLocaleDateString()}</p>
                    <div class="d-flex flex-wrap gap-2">${actionButtons}</div>
                </div>
            </div>
        `;

        listContainer.insertAdjacentHTML("beforeend", cardHTML);
    });

    // Tambahkan event listener ke tombol status
    document.querySelectorAll(".status-btn").forEach(button => {
        button.addEventListener("click", function () {
            let pesertaId = this.getAttribute("data-peserta");
            let pertemuanId = this.getAttribute("data-pertemuan");
            let status = this.getAttribute("data-status");
            updateStatus(pesertaId, pertemuanId, status);
        });
    });
}

/**
 * Filter peserta berdasarkan input pencarian
 */
function filterPeserta(searchTerm) {
    const cards = document.querySelectorAll(".peserta-card");
    cards.forEach(card => {
        const namaPeserta = card.dataset.name;
        if (namaPeserta.includes(searchTerm)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

/**
 * Menampilkan modal loading
 */
function showLoadingModal() {
    const modal = new bootstrap.Modal(document.getElementById("loadingModal"));
    modal.show();
}

/**
 * Menyembunyikan modal loading
 */
function hideLoadingModal() {
    const modalEl = document.getElementById("loadingModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) {
        modalInstance.hide();
    }
}
/**
 * Update Status Absensi dengan modal loading
 */
async function updateStatus(pesertaId, pertemuanId, status) {
    try {
        showLoadingModal(); // ✅ Tampilkan modal sebelum request

        const requestBody = { pertemuan_id: pertemuanId, peserta_id: pesertaId, status: status };
        const response = await NetworkHelper.post(ENDPOINTS.ABSENSI.CREATE, requestBody);

        if (response.statusCode === 201) {
            showToast(`✅ Absensi berhasil: ${status}`, "success");
            fetchAbsensiByKelompok(localStorage.getItem("kelompok_id")); // Refresh Data
        } else {
            showToast("❌ Gagal mengupdate absensi!", "danger");
        }

    } catch (error) {
        console.error("❌ Error updating absensi:", error);
        showToast("⚠️ Terjadi kesalahan saat mengupdate absensi.", "danger");
    } finally {
        hideLoadingModal(); // ✅ Sembunyikan modal setelah request selesai
    }
}

/**
 * Render navigasi pagination dengan pencarian
 */
function renderPagination(pagination, kelompokId, term) {
    const paginationContainer = document.getElementById("paginationContainer");
    if (!paginationContainer) {
        console.warn("⚠️ Element paginationContainer tidak ditemukan. Melewati pagination.");
        return;
    }
    paginationContainer.innerHTML = "";

    if (pagination.totalPages > 1) {
        const prevBtn = document.createElement("button");
        prevBtn.className = "btn btn-sm btn-secondary me-2";
        prevBtn.textContent = "⬅ Previous";
        prevBtn.disabled = !pagination.urls.prev;
        prevBtn.addEventListener("click", () => {
            if (pagination.urls.prev) {
                fetchAbsensiByKelompok(kelompokId, pertemuanId, pagination.currentPage - 1);
            }
        });

        const pageInfo = document.createElement("span");
        pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;

        const nextBtn = document.createElement("button");
        nextBtn.className = "btn btn-sm btn-secondary ms-2";
        nextBtn.textContent = "Next ➡";
        nextBtn.disabled = !pagination.urls.next;
        nextBtn.addEventListener("click", () => {
            if (pagination.urls.next) {
                fetchAbsensiByKelompok(kelompokId, pertemuanId, pagination.currentPage + 1);
            }
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
    }
}
