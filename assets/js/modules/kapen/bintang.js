import { NetworkHelper } from '../../config/networkHelper.js';
import { ENDPOINTS } from '../../config/endpoint.js';
import { showToast } from '../../config/toast.js';

/**
 * Inisialisasi halaman Pemberian Bintang
 */
export function init() {
    console.log("✅ pemberian-bintang.js loaded successfully");

    const kelompokId = localStorage.getItem("kelompok_id"); 
    const pendampingId = localStorage.getItem("id"); 

    if (!kelompokId) {
        showToast("❌ Kelompok tidak ditemukan!", "danger");
        return;
    }

    if (!pendampingId) {
        showToast("❌ Pendamping tidak ditemukan. Silakan login ulang!", "danger");
        return;
    }

    fetchBintangByKelompok(kelompokId);

    // Event listener untuk pencarian dengan debounce
    let debounceTimeout;
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                const searchTerm = searchInput.value.trim().toLowerCase();
                filterPeserta(searchTerm);
            }, 300);
        });
    }
}

/**
 * Fetch data bintang peserta berdasarkan kelompok dengan pagination
 */
async function fetchBintangByKelompok(kelompokId, page = 1, size = 10) {
    try {
        const response = await NetworkHelper.get(ENDPOINTS.BINTANG.GET_BY_KELOMPOK(kelompokId, page, size));
        if (response.statusCode === 200 && response.data) {
            renderBintang(response.data.items);
            renderPagination(response.data.pagination, kelompokId);
        } else {
            showToast("❌ Gagal mengambil data bintang!", "danger");
        }
    } catch (error) {
        console.error("❌ Error fetching bintang:", error);
        showToast("⚠️ Terjadi kesalahan saat mengambil data bintang.", "danger");
    }
}

/**
 * Render data bintang ke dalam tampilan kartu (card)
 */
function renderBintang(bintangList) {
    const listContainer = document.getElementById("bintangList");
    if (!listContainer) {
        console.error("❌ Element bintangList tidak ditemukan!");
        return;
    }
    listContainer.innerHTML = "";

    bintangList.forEach((bintang) => {
        const jumlahBintangDisabled = bintang.jumlah_bintang ? 'disabled' : '';

        const cardHTML = `
            <div class="col-md-4">
                <div class="card shadow-sm p-3 mb-3">
                    <h5 class="fw-bold">${bintang.nama_peserta}</h5>
                    <p class="text-muted">${bintang.nama_pertemuan} - ${new Date(bintang.tanggal_pertemuan).toLocaleDateString()}</p>
                    
                    <div class="mb-2">
                        <label class="form-label">Jumlah Bintang (1-5)</label>
                        <input type="number" class="form-control jumlah-bintang" data-peserta="${bintang.peserta_id}" data-pertemuan="${bintang.pertemuan_id}" min="1" max="5" value="${bintang.jumlah_bintang || ''}" ${jumlahBintangDisabled}>
                    </div>

                    <div class="mb-2">
                        <label class="form-label">Bintang Bonus</label>
                        <input type="number" class="form-control bintang-bonus" data-peserta="${bintang.peserta_id}" data-pertemuan="${bintang.pertemuan_id}" min="0" value="${bintang.bintang_bonus || 0}">
                    </div>
                </div>
            </div>
        `;

        listContainer.insertAdjacentHTML("beforeend", cardHTML);
    });
    document.querySelectorAll(".jumlah-bintang, .bintang-bonus").forEach(input => {
        input.addEventListener("focus", function () {
            let pesertaId = this.getAttribute("data-peserta");
            let pertemuanId = this.getAttribute("data-pertemuan");
            let value = this.value;
            let modalId = this.classList.contains("bintang-bonus") ? "bintangBonusModal" : "jumlahBintangModal";
            let inputId = this.classList.contains("bintang-bonus") ? "bonusBintangInput" : "jumlahBintangInput";
            
            document.getElementById(inputId).setAttribute("data-peserta", pesertaId);
            document.getElementById(inputId).setAttribute("data-pertemuan", pertemuanId);
            // document.getElementById(inputId).value = value;
            
            let modal = new bootstrap.Modal(document.getElementById(modalId));
            modal.show();
        });
    });
}

/** Event Listener untuk tombol simpan dalam modal **/
document.getElementById("saveJumlahBintang").addEventListener("click", function () {
    let pesertaId = document.getElementById("jumlahBintangInput").getAttribute("data-peserta");
    let pertemuanId = document.getElementById("jumlahBintangInput").getAttribute("data-pertemuan");
    let value = parseInt(document.getElementById("jumlahBintangInput").value) || 0;
    updateBintang(pesertaId, pertemuanId, value, null);
    bootstrap.Modal.getInstance(document.getElementById("jumlahBintangModal")).hide();
});

document.getElementById("saveBonusBintang").addEventListener("click", function () {
    let pesertaId = document.getElementById("bonusBintangInput").getAttribute("data-peserta");
    let pertemuanId = document.getElementById("bonusBintangInput").getAttribute("data-pertemuan");
    let value = parseInt(document.getElementById("bonusBintangInput").value) || 0;
    updateBintang(pesertaId, pertemuanId, null, value);
    bootstrap.Modal.getInstance(document.getElementById("bintangBonusModal")).hide();
});

if (document.getElementById("bintangBonusModal")) {
    document.getElementById("bintangBonusModal").addEventListener("hidden.bs.modal", function () {
        document.getElementById("bonusBintangInput").value = "";
    });
}

/**
 * Update atau Tambah Bintang (Hanya bintang bonus jika bintang wajib sudah diberikan)
 */
async function updateBintang(pesertaId, pertemuanId, jumlahBintang, bintangBonus) {
    try {
        const pendampingId = localStorage.getItem("pendamping_id");

        if (!pendampingId) {
            showToast("❌ Pendamping tidak ditemukan. Silakan login ulang!", "danger");
            return;
        }

        // **Ambil input jumlah bintang untuk cek apakah disabled**
        const jumlahBintangInput = document.querySelector(`.jumlah-bintang[data-peserta="${pesertaId}"][data-pertemuan="${pertemuanId}"]`);
        
        let jumlahBintangFinal = jumlahBintang ? parseInt(jumlahBintang) : null;
        let bintangBonusFinal = parseInt(bintangBonus) || 0;

        // **Jika jumlah bintang sudah diberikan sebelumnya, jangan kirim ke backend**
        const jumlahBintangAda = jumlahBintangInput && jumlahBintangInput.value !== "" && jumlahBintangInput.hasAttribute("disabled");

        // **Buat objek request tanpa jumlah_bintang jika sudah ada**
        let requestData = {
            pendamping_id: parseInt(pendampingId),
            bintang_list: [
                {
                    pertemuan_id: pertemuanId,
                    peserta_id: pesertaId,
                    bintang_bonus: bintangBonusFinal
                }
            ]
        };

        // **Jika jumlah_bintang masih kosong, masukkan ke request**
        if (!jumlahBintangAda) {
            requestData.bintang_list[0].jumlah_bintang = jumlahBintangFinal;
        }

        console.log("🚀 Mengirim request ke backend:", requestData);

        // Kirim request ke backend
        const saveResponse = await NetworkHelper.post(ENDPOINTS.BINTANG.CREATE, requestData);

        if (saveResponse.statusCode === 201) {
            showToast("✅ Bintang berhasil diberikan!", "success");
            fetchBintangByKelompok(localStorage.getItem("kelompok_id"));
        } else {
            showToast("❌ Gagal menyimpan bintang!", "danger");
        }
    } catch (error) {
        console.error("❌ Error updating bintang:", error);
        showToast("⚠️ Terjadi kesalahan saat menyimpan bintang.", "danger");
    }
}


/**
 * Filter daftar peserta berdasarkan input pencarian (Debounce)
 */
function filterPeserta(searchTerm) {
    const cards = document.querySelectorAll("#bintangList .card");
    cards.forEach(card => {
        const namaPeserta = card.querySelector("h5").textContent.toLowerCase();
        if (namaPeserta.includes(searchTerm)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

/**
 * Render navigasi pagination
 */
function renderPagination(pagination, kelompokId) {
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
                fetchBintangByKelompok(kelompokId, pagination.currentPage - 1);
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
                fetchBintangByKelompok(kelompokId, pagination.currentPage + 1);
            }
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
    }
}
