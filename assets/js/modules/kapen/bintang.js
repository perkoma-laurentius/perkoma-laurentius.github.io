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
 * Fetch data bintang peserta berdasarkan kelompok dengan pagination
 */
async function fetchBintangByKelompok(kelompokId, pertemuanId = null, page = 1, size = 10) {
    try {
        // 1. Ambil semua peserta dalam kelompok
        const pesertaResponse = await NetworkHelper.get(ENDPOINTS.BINTANG.GET_BY_KELOMPOK(kelompokId));

        if (!pesertaResponse || pesertaResponse.statusCode !== 200 || !Array.isArray(pesertaResponse.data.items)) {
            console.error("❌ Kesalahan mengambil peserta!", pesertaResponse);
            showToast("❌ Gagal mengambil peserta!", "danger");
            return;
        }

        const pesertaList = pesertaResponse.data.items; // Semua peserta dalam kelompok

        // 2. Ambil total bintang per peserta
        let url = ENDPOINTS.BINTANG.GETBINTANG_BY_KELOMPOK(kelompokId, page, size);
        if (pertemuanId) {
            url += `&pertemuanId=${pertemuanId}`;
        }
        const bintangResponse = await NetworkHelper.get(url);

        if (!bintangResponse || bintangResponse.statusCode !== 200 || !bintangResponse.data.items) {
            console.error("❌ Kesalahan mengambil bintang peserta!", bintangResponse);
            showToast("❌ Gagal mengambil data bintang!", "danger");
            return;
        }

        const bintangList = bintangResponse.data.items.peserta || []; // Total bintang berdasarkan peserta_id

        // 3. Benchmarking: Cocokkan peserta dengan total bintang
        const pesertaWithBintang = pesertaList.map((peserta) => {
            const bintangData = bintangList.find(b => b.peserta_id === peserta.peserta_id) || {};
            return {
                peserta_id: peserta.peserta_id,
                nama_peserta: peserta.nama_peserta,
                nama_panggilan_peserta: peserta.nama_panggilan || peserta.nama_peserta,
                total_jumlah_bintang: bintangData.total_jumlah_bintang || { total: "0", detail: [] },
                total_bintang_bonus: bintangData.total_bintang_bonus || { total: "0", detail: [] },
                total_semua: bintangData.total_semua || "0"
            };
        });

        // 4. Render peserta dengan data bintang
        renderBintang(pesertaWithBintang);
        renderPagination(bintangResponse.data.pagination, kelompokId, pertemuanId);

    } catch (error) {
        console.error("❌ Error fetching bintang:", error);
        showToast("⚠️ Terjadi kesalahan saat mengambil data bintang.", "danger");
    }
}






/**
 * Render data bintang ke dalam tampilan kartu (card)
 */
function renderBintang(bintangList) {
    if (!Array.isArray(bintangList) || bintangList.length === 0) {
        console.error("❌ Data bintangList kosong atau bukan array:", bintangList);
        showToast("⚠️ Tidak ada peserta dalam kelompok ini!", "warning");
        return;
    }

    const listContainer = document.getElementById("bintangList");
    if (!listContainer) {
        console.error("❌ Element bintangList tidak ditemukan!");
        return;
    }
    listContainer.innerHTML = "";

    console.log("✅ Menampilkan peserta:", bintangList.length, "peserta");

    bintangList.forEach((bintang) => {
        const jumlahBintangDisabled = bintang.total_jumlah_bintang?.total !== "0";

        const cardHTML = `
            <div class="col-md-4">
                <div class="card shadow-sm p-3 mb-3">
                    <h5 class="fw-bold">${bintang.nama_panggilan_peserta}</h5>
                    <p class="text-muted">${bintang.nama_peserta}</p>
                    
                    <div class="mb-2">
                        <label class="form-label">Jumlah Bintang</label>
                        <input type="number" class="form-control jumlah-bintang" 
                            data-peserta="${bintang.peserta_id}" 
                            value="${bintang.total_jumlah_bintang?.total || 0}" 
                            ${jumlahBintangDisabled}>
                    </div>

                    <div class="mb-2">
                        <label class="form-label">Bintang Bonus</label>
                        <input type="number" class="form-control bintang-bonus" 
                            data-peserta="${bintang.peserta_id}" 
                            value="${bintang.total_bintang_bonus?.total || 0}">
                    </div>
                </div>
            </div>
        `;

        listContainer.insertAdjacentHTML("beforeend", cardHTML);
    });
    document.querySelectorAll(".jumlah-bintang").forEach(input => {
        input.addEventListener("focus", function () {
            let pesertaId = this.getAttribute("data-peserta");
            let pertemuanId = this.getAttribute("data-pertemuan");
    
            // Simpan peserta_id dan pertemuan_id di modal
            document.getElementById("kategoriBintang").setAttribute("data-peserta", pesertaId);
            document.getElementById("kategoriBintang").setAttribute("data-pertemuan", pertemuanId);
    
            // Tampilkan modal
            let modal = new bootstrap.Modal(document.getElementById("jumlahBintangModal"));
            modal.show();
        });
    });
    
    document.querySelectorAll(".bintang-bonus").forEach(input => {
        input.addEventListener("focus", function () {
            let pesertaId = this.getAttribute("data-peserta");

            document.getElementById("kategoriBonusBintang").value = "bonus";
            document.getElementById("deskripsiBonusBintang").value = "Lain-lain";
            document.getElementById("bonusBintangInput").setAttribute("data-peserta", pesertaId);

            let modal = new bootstrap.Modal(document.getElementById("bintangBonusModal"));
            modal.show();
        });
    });
    document.getElementById("kategoriBintang").addEventListener("change", function () {
        const kategori = this.value;
        const jumlahBintangInput = document.getElementById("jumlahBintangInput");
        const deskripsiContainer = document.getElementById("deskripsiContainer");
    
        jumlahBintangInput.value = "";
        deskripsiContainer.innerHTML = "";
    
        if (kategori === "pokok") {
            deskripsiContainer.innerHTML = `
                <label for="deskripsiBintang">Pilih Deskripsi Bintang Pokok</label>
                <select id="deskripsiBintang" class="form-control">
                    <option value="">Pilih Bintang Pokok</option>
                    ${Array.from({ length: 12 }, (_, i) => `<option value="Pokok ${i + 1}">Pokok ${i + 1}</option>`).join("")}
                </select>
            `;
        } else if (kategori === "doa_khusus") {
            deskripsiContainer.innerHTML = `
                <label for="deskripsiBintang">Pilih Deskripsi Doa</label>
                <select id="deskripsiBintang" class="form-control">
                    <option value="">Pilih Doa</option>
                    <option value="Hapal Bapa Kami">Hapal Bapa Kami</option>
                    <option value="Hapal Aku Percaya">Hapal Aku Percaya</option>
                    <option value="Hapal Salam Maria">Hapal Salam Maria</option>
                    <option value="Hapal Kemuliaan">Hapal Kemuliaan</option>
                    <option value="Hapal 10 Perintah Allah">Hapal 10 Perintah Allah</option>
                    <option value="Hapal 5 Perintah Gereja">Hapal 5 Perintah Gereja</option>
                </select>
            `;
        } else if (kategori === "misa") {
            deskripsiContainer.innerHTML = `
                <label for="deskripsiBintang">Deskripsi Bintang</label>
                <input type="text" id="deskripsiBintang" class="form-control" placeholder="Isi deskripsi misa...">
            `;
        }
    
        jumlahBintangInput.removeAttribute("disabled");
    
        // ✅ Debugging: Pastikan elemen `deskripsiBintang` ada
        setTimeout(() => {
            if (!document.getElementById("deskripsiBintang")) {
                console.error("❌ Element deskripsiBintang tidak dibuat di DOM!");
            } else {
                console.log("✅ Element deskripsiBintang berhasil dibuat di DOM!");
            }
        }, 100);
    });
    document.getElementById("saveJumlahBintang").addEventListener("click", function () {
        let pesertaId = document.getElementById("kategoriBintang").getAttribute("data-peserta");
        const urlParams = new URLSearchParams(window.location.search);
        const pertemuanId = urlParams.get("pertemuanId");
    
        let kategoriBintangElement = document.getElementById("kategoriBintang");
        let kategoriBintang = kategoriBintangElement ? kategoriBintangElement.value.trim() : "";
    
        let jumlahBintang = parseInt(document.getElementById("jumlahBintangInput").value) || 0;
        
        let deskripsiBintangElement = document.getElementById("deskripsiBintang");
        let deskripsi = deskripsiBintangElement ? deskripsiBintangElement.value.trim() : "";
    
        if (!deskripsiBintangElement) {
            // console.error("❌ Element deskripsiBintang tidak ditemukan di DOM! Menggunakan default...");
            // showToast("⚠️ Pilih kategori bintang terlebih dahulu!", "warning");
            return;
        }
    
        console.log("Kategori:", kategoriBintang);
        console.log("Deskripsi:", deskripsi);
    
        if (!kategoriBintang || kategoriBintang === "" || kategoriBintang === "Pilih Kategori") {
            showToast("❌ Pilih kategori bintang!", "danger");
            return;
        }
    
        if (kategoriBintang === "pokok" && !/^Pokok (1[0-2]|[1-9])$/.test(deskripsi)) {
            showToast("❌ Pilih deskripsi Bintang Pokok 1-12!", "danger");
            return;
        }
    
        if (kategoriBintang === "doa_khusus" && deskripsi === "") {
            showToast("❌ Pilih salah satu doa!", "danger");
            return;
        }
    
        if (kategoriBintang === "misa" && deskripsi.trim() === "") {
            showToast("❌ Isi deskripsi bintang misa!", "danger");
            return;
        }
    
        updateBintang(pesertaId, pertemuanId, jumlahBintang, kategoriBintang, deskripsi);
    
        // ✅ Reset form setelah penyimpanan
        resetForm();
    
        // ✅ Tutup modal setelah reset
        bootstrap.Modal.getInstance(document.getElementById("jumlahBintangModal")).hide();
    });
    
    
    function resetForm() {
        document.getElementById("kategoriBintang").value = "";
        document.getElementById("deskripsiContainer").innerHTML = "";
        document.getElementById("jumlahBintangInput").value = "";
    }
    
}

/** Event Listener untuk tombol simpan dalam modal **/

document.getElementById("saveBonusBintang").addEventListener("click", async function () {
    const pesertaId = document.getElementById("bonusBintangInput").getAttribute("data-peserta");
    const urlParams = new URLSearchParams(window.location.search);
    const pertemuanId = urlParams.get("pertemuanId");
    const kategoriBintang = "bonus"; // kategori statis
    const deskripsi = "Lain-lain";     // deskripsi statis
    const jumlahBintangBonus = parseInt(document.getElementById("bonusBintangInput").value) || 0;

    if (!jumlahBintangValid(jumlahBintangBonus)) {
        showToast("❌ Masukkan jumlah bintang bonus yang valid!", "danger");
        return;
    }

    await updateBintangBonus(pesertaId, pertemuanId, kategoriBintang, deskripsi, jumlahBintangBonus);
    bootstrap.Modal.getInstance(document.getElementById("bintangBonusModal")).hide();
});



async function updateBintangBonus(pesertaId, pertemuanId, kategoriBintang, deskripsi, jumlahBintangBonus) {
    try {
        const pendampingId = localStorage.getItem("pendamping_id");

        let requestData = {
            pendamping_id: parseInt(pendampingId),
            bintang_list: [
                {
                    pertemuan_id: pertemuanId,
                    peserta_id: pesertaId,
                    jumlah_bintang: 0,
                    bintang_bonus: jumlahBintangBonus, 
                    kategori_bintang: kategoriBintang, // bonus
                    deskripsi: deskripsi
                }
            ]
        };
        showLoadingModal()
        bootstrap.Modal.getInstance(document.getElementById("bintangBonusModal")).hide();

        const response = await NetworkHelper.post(ENDPOINTS.BINTANG.CREATE, requestData);
        if (response.statusCode === 201) {
            showToast("✅ Bintang bonus berhasil diberikan!", "success");
            await fetchBintangByKelompok(localStorage.getItem("kelompok_id"));
            hideLoadingModal();
        } else {
            showToast("❌ Gagal menyimpan bintang bonus!", "danger");
            hideLoadingModal();

        }
    } catch (error) {
        console.error("❌ Error updating bonus bintang:", error);
        showToast("⚠️ Terjadi kesalahan saat menyimpan bintang bonus.", "danger");
        hideLoadingModal();
    }
}

function jumlahBintangValid(value) {
    return Number.isInteger(value) && value > 0;
}

if (document.getElementById("bintangBonusModal")) {
    document.getElementById("bintangBonusModal").addEventListener("hidden.bs.modal", function () {
        document.getElementById("bonusBintangInput").value = "";
    });
}
async function updateBintang(pesertaId, pertemuanId, jumlahBintang, kategoriBintang, deskripsi) {
    try {
        const pendampingId = localStorage.getItem("pendamping_id");

        if (!pendampingId) {
            showToast("❌ Pendamping tidak ditemukan. Silakan login ulang!", "danger");
            return;
        }

        if (!kategoriBintang || !deskripsi) {
            showToast("❌ Kategori bintang dan deskripsi harus diberikan!", "danger");
            return;
        }

        let requestData = {
            pendamping_id: parseInt(pendampingId),
            bintang_list: [
                {
                    pertemuan_id: pertemuanId,
                    peserta_id: pesertaId,
                    jumlah_bintang: jumlahBintang,
                    bintang_bonus: 0, // Default bintang bonus 0
                    kategori_bintang: kategoriBintang,
                    deskripsi: deskripsi
                }
            ]
        };

        console.log("🚀 Mengirim request ke backend:", requestData);

        const saveResponse = await NetworkHelper.post(ENDPOINTS.BINTANG.CREATE, requestData);

        if (saveResponse.statusCode === 201) {
            showToast("✅ Bintang berhasil diberikan!", "success");
            await fetchBintangByKelompok(localStorage.getItem("kelompok_id"));
        } else {
            showToast("❌ Gagal menyimpan bintang!", "danger");
        }
    } catch (error) {
        console.error("❌ Error updating bintang:", error);
        showToast("⚠️ Terjadi kesalahan saat menyimpan bintang.", "danger");
    }
}


// function updateTotalBintang(pesertaId, jumlahBintangBaru) {
//     const totalBintangInput = document.querySelector(`.jumlah-bintang[data-peserta="${pesertaId}"]`);

//     if (totalBintangInput) {
//         let totalSaatIni = parseInt(totalBintangInput.value) || 0;
//         totalBintangInput.value = totalSaatIni + jumlahBintangBaru;
//     }
// }


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
