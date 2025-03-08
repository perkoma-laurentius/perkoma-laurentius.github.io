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
    const urlParams = new URLSearchParams(window.location.search);

    const pertemuanId = urlParams.get("pertemuanId");

    if (!kelompokId) {
        showToast("❌ Kelompok tidak ditemukan!", "danger");
        return;
    }

    if (!pendampingId) {
        showToast("❌ Pendamping tidak ditemukan. Silakan login ulang!", "danger");
        return;
    }
    if (!pertemuanId) {
        showToast("❌ Pertemuan ID tidak ditemukan dalam URL!", "danger");
        return;
    }

    console.log(`📌 Memuat data untuk Kelompok ID: ${kelompokId}, Pertemuan ID: ${pertemuanId}`);
    fetchBintangByKelompok(kelompokId,pertemuanId);
    
    document.getElementById("kategoriBintang").addEventListener("change", function () {
        const kategori = this.value;
        const jumlahBintangModal = document.getElementById("jumlahBintangModal");
        const bintangPokokModal = document.getElementById("bintangPokokModal");
    
        if (kategori === "pokok") {
            // Sembunyikan modal jumlah bintang dan tampilkan modal bintang pokok
            if (jumlahBintangModal) bootstrap.Modal.getInstance(jumlahBintangModal).hide();
            fetchBintangPokokTabel(kelompokId, pertemuanId);
            let modal = new bootstrap.Modal(bintangPokokModal);
            modal.show();
        }
    });
      

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

const masterPokok = [
    { pokok: 1, hlm: [23, 24, 25], keterangan: "Aku Bersama Keluarga", due: "22-Feb" },
    { pokok: 2, hlm: [26, 27, 28], keterangan: "Makan Bersama Menyenangkan", due: "22-Feb" },
    { pokok: 3, hlm: [31, 32, 33], keterangan: "Yesus Memanggil Anak-anak", due: "8-Mar" },
    { pokok: 4, hlm: [34, 35, 36], keterangan: "Yesus Mencari Sahabat-sahabat-Nya", due: "8-Mar" },
    { pokok: 5, hlm: [37, 38], keterangan: "Yesus Memanggil 12 Rasul", due: "8-Mar" },
    { pokok: 6, hlm: [40, 41, 42], keterangan: "Yesus Memberi Makan Orang Banyak", due: "16-Mar" },
    { pokok: 7, hlm: [44, 45], keterangan: "Yesus Akan Memberi Roti Kehidupan", due: "22-Mar" },
    { pokok: 8, hlm: [48, 49], keterangan: "Yesus Memberi Roti Kehidupan", due: "22-Mar" },
    { pokok: 9, hlm: [51, 52, 53], keterangan: "Yesus Membasuh Kaki Sahabat-sahabatnya", due: "12-Apr" },
    { pokok: 10, hlm: [55, 56], keterangan: "Kasih dengan Bukti Perbuatan", due: "12-Apr" },
    { pokok: 11, hlm: [58, 59], keterangan: "Kasih terhadap Orang yang Tidak Kita Senangi", due: "26-Apr" },
    { pokok: 12, hlm: [61, 62, 63], keterangan: "Bekerja", due: "26-Apr" },
    { pokok: 13, hlm: [64, 65], keterangan: "Yesus Bersama Kita", due: "3-May" },
    { pokok: 14, hlm: [67, 69], keterangan: "Menyambut Tubuh Kristus", due: "3-May" },
    { pokok: 15, hlm: [70, 71, 72], keterangan: "Bagian-bagian Perayaan Ekaristi", due: "18-May" }
];

async function fetchBintangPokokTabel(kelompokId, pertemuanId) {
    try {
        // 🔥 Ambil daftar peserta dari kelompok (API kelompok)
        const pesertaResponse = await NetworkHelper.get(ENDPOINTS.BINTANG.GET_BY_KELOMPOK(kelompokId));
        if (!pesertaResponse || pesertaResponse.statusCode !== 200 || !pesertaResponse.data.items) {
            console.error("❌ Gagal mengambil peserta kelompok!", pesertaResponse);
            showToast("❌ Gagal mengambil peserta kelompok!", "danger");
            return;
        }
        const pesertaList = pesertaResponse.data.items; // ✅ Simpan daftar peserta

        // 🔥 Ambil data bintang dari total peserta yang hadir (API total bintang)
        const bintangResponse = await NetworkHelper.get(ENDPOINTS.BINTANG.GETBINTANG_BY_KELOMPOK(kelompokId, 1, 15));
        if (!bintangResponse || bintangResponse.statusCode !== 200 || !bintangResponse.data.items || !bintangResponse.data.items.peserta) {
            console.error("❌ Gagal mengambil data bintang pokok!", bintangResponse);
            showToast("❌ Gagal mengambil data bintang pokok!", "danger");
            return;
        }
        const bintangList = bintangResponse.data.items.peserta; // ✅ Simpan daftar peserta yang mendapat bintang

        // 🔥 Cocokkan peserta dari API kelompok dengan API total bintang
        pesertaList.forEach((peserta) => {
            const foundPeserta = bintangList.find(b => b.peserta_id === peserta.peserta_id);
            if (foundPeserta) {
                peserta.total_jumlah_bintang = foundPeserta.total_jumlah_bintang;
                peserta.total_bintang_bonus = foundPeserta.total_bintang_bonus;
                peserta.total_semua = foundPeserta.total_semua;
            } else {
                peserta.total_jumlah_bintang = { total: "0", detail: [] };
                peserta.total_bintang_bonus = { total: "0", detail: [] };
                peserta.total_semua = "0";
            }
        });

        // 🔥 Render tabel dengan peserta_id yang benar
        renderBintangPokokTable(pesertaList, pertemuanId);
    } catch (error) {
        console.error("❌ Error fetching bintang pokok:", error);
        showToast("⚠️ Terjadi kesalahan saat mengambil data bintang pokok.", "danger");
    }
}


const urlParams = new URLSearchParams(window.location.search);
const pertemuanId = urlParams.get("pertemuanId");
function renderBintangPokokTable(bintangList, kelompokId, pertemuanId) {
    const tableContainer = document.getElementById("bintangPokokTable");
    if (!tableContainer) {
        console.error("❌ Element bintangPokokTable tidak ditemukan!");
        return;
    }
    tableContainer.innerHTML = "";

    let tableHTML = `
        <table class="table table-striped table-bordered text-center">
            <thead class="table-dark">
                <tr>
                    <th>Pokok</th>
                    <th>Hlm</th>
                    <th>Keterangan</th>
                    <th>Due</th>
                    <th>DONE</th>
                </tr>
            </thead>
            <tbody>
    `;

    masterPokok.forEach((pokok) => {
        let firstRow = true;

        // 🔥 Cek apakah ada peserta yang sudah memiliki bintang untuk pokok ini
        let isDone = bintangList.some(peserta => 
            peserta.total_jumlah_bintang.detail.some(detail => 
                detail.kategori.toLowerCase() === "pokok" && detail.deskripsi === `Pokok ${pokok.pokok}`
            )
        );
        let peserta = bintangList.find(p => 
            !p.total_jumlah_bintang.detail.some(detail => 
                detail.kategori.toLowerCase() === "pokok" && detail.deskripsi === `Pokok ${pokok.pokok}`
            )
        );

       let pesertaId = peserta ? peserta.peserta_id : 0;

        tableHTML += `
            <tr>
                <td rowspan="${pokok.hlm.length}">${pokok.pokok}</td>
                <td>${pokok.hlm[0]}</td>
                <td rowspan="${pokok.hlm.length}">${pokok.keterangan}</td>
                <td rowspan="${pokok.hlm.length}">${pokok.due}</td>
                <td rowspan="${pokok.hlm.length}">
                    <button class="btn btn-success btn-lg btn-done" 
                        data-pokok="${pokok.pokok}" 
                        data-peserta="${pesertaId}"
                        data-pertemuan="${pertemuanId}" 
                        ${isDone ? "disabled" : ""}>✅</button>
                </td>
            </tr>
        `;

        // 🔥 Loop halaman tanpa membuat row tambahan untuk pokok
        for (let i = 1; i < pokok.hlm.length; i++) {
            tableHTML += `
                <tr>
                    <td>${pokok.hlm[i]}</td>
                </tr>
            `;
        }
    });

    tableHTML += "</tbody></table>";
    tableContainer.innerHTML = tableHTML;

    // 🎯 Tambahkan event listener untuk tombol checklist
    setupChecklistEventListeners();
}

/**
 * Reset form setelah pengiriman bintang berhasil
 */
function resetForm() {
    const kategoriBintang = document.getElementById("kategoriBintang");
    const deskripsiContainer = document.getElementById("deskripsiContainer");
    const jumlahBintangInput = document.getElementById("jumlahBintangInput");

    if (kategoriBintang) kategoriBintang.value = "";
    if (deskripsiContainer) deskripsiContainer.innerHTML = "";
    if (jumlahBintangInput) jumlahBintangInput.value = "";
}

/**
 * Setup event listener untuk tombol checklist
 */
function setupChecklistEventListeners() {
    document.querySelectorAll(".btn-done").forEach(button => {
        button.addEventListener("click", async function () {
            const pokokId = parseInt(this.getAttribute("data-pokok"));
            const pesertaId = this.getAttribute("data-peserta");
            const urlParams = new URLSearchParams(window.location.search);
            const kelompokId = localStorage.getItem("kelompok_id");
            const pertemuanId = urlParams.get("pertemuanId");
            const pendampingId = localStorage.getItem("pendamping_id");

            if (!pendampingId || !pesertaId || !pertemuanId) {
                showToast("❌ Data tidak lengkap, harap refresh halaman!", "danger");
                return;
            }

            // 🔥 Cari due date berdasarkan pokokId
            const pokok = masterPokok.find(p => p.pokok === pokokId);
            if (!pokok) {
                showToast("❌ Pokok tidak ditemukan!", "danger");
                return;
            }

            // 🔥 Hitung jumlah bintang berdasarkan tanggal due
            const jumlahBintang = hitungJumlahBintang(pokok.due);

            const requestData = {
                pendamping_id: parseInt(pendampingId),
                bintang_list: [
                    {
                        pertemuan_id: pertemuanId,
                        peserta_id: pesertaId,
                        jumlah_bintang: jumlahBintang,
                        kategori_bintang: "pokok",
                        deskripsi: `Pokok ${pokokId}`
                    }
                ]
            };

            try {
                showLoadingModal();
                const response = await NetworkHelper.post(ENDPOINTS.BINTANG.CREATE, requestData);

                if (response.statusCode === 201) {
                    showToast(`✅ Bintang berhasil dikirim (${jumlahBintang} bintang)!`, "success");
                    this.setAttribute("disabled", "true"); // Disable button setelah berhasil
                    this.innerHTML = "✔"; // Ubah tampilan tombol
                    fetchBintangPokokTabel(kelompokId, pertemuanId); // Reload table
                    fetchBintangByKelompok(kelompokId, pertemuanId); // Reload bintang
                    resetForm();

                } else {
                    showToast("❌ Gagal mengirim bintang!", "danger");
                }
            } catch (error) {
                console.error("❌ Error saat mengirim bintang:", error);
                showToast("⚠️ Terjadi kesalahan, coba lagi.", "danger");
            } finally {
                hideLoadingModal();
            }
        });
    });
}

/**
 * Fungsi untuk menghitung jumlah bintang berdasarkan due date
 */
function hitungJumlahBintang(dueDate) {
    // Format dueDate dari masterPokok (misal: "22-Feb")
    const today = new Date();
    const [dueDay, dueMonthStr] = dueDate.split("-");
    const monthMap = {
        "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
        "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
    };
    const dueMonth = monthMap[dueMonthStr];
    const dueYear = today.getFullYear(); // Asumsikan tahun sekarang
    const dueDateObj = new Date(dueYear, dueMonth, parseInt(dueDay));

    // Hitung selisih waktu dalam hari
    const timeDiff = today - dueDateObj;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // Aturan jumlah bintang
    let jumlahBintang = 5; // Maksimal bintang saat due date
    if (daysDiff > 7) {
        const weeksLate = Math.floor(daysDiff / 7);
        jumlahBintang -= weeksLate;
    }
    return Math.max(jumlahBintang, 1); // Minimal 1 bintang
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
async function fetchBintangByKelompok(kelompokId, pertemuanId, page = 1, size = 10) {
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
        <h5 class="fw-bold text-center">${bintang.nama_panggilan_peserta}</h5>
        <p class="text-muted text-center">${bintang.nama_peserta}</p>

        <button class="btn btn-sm btn-primary w-100 detail-bintang-btn mb-2"
            data-peserta="${bintang.peserta_id}">
            Detail Bintang
        </button>

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
            resetForm();
            modal.show();
        });
    });

    document.querySelectorAll(".detail-bintang-btn").forEach(button => {
        button.addEventListener("click", function () {
            let pesertaId = this.getAttribute("data-peserta");
    
            // Cari data peserta berdasarkan ID
            let peserta = bintangList.find(p => p.peserta_id == pesertaId);
            if (peserta) {
                tampilkanDetailBintang(peserta);
            } else {
                showToast("❌ Data peserta tidak ditemukan!", "danger");
            }
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
        <input type="hidden" id="deskripsiBintang" value="Misa">
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

    function tampilkanDetailBintang(peserta) {
        let modalContent = document.getElementById("modalDetailContent");
    
        if (!modalContent) {
            console.error("❌ Element modalDetailContent tidak ditemukan!");
            return;
        }
    
        // Mulai dengan header peserta
        let detailHTML = `
            <h5 class="text-center">${peserta.nama_panggilan_peserta}</h5>
            <p class="text-center text-muted">${peserta.nama_peserta}</p>
            <hr>
            <h6>Total Bintang: ${peserta.total_jumlah_bintang.total}</h6>
            <h6>Total Bintang Bonus: ${peserta.total_bintang_bonus.total}</h6>
            <h6>Total Semua: ${peserta.total_semua}</h6>
            <hr>
        `;
    
        // Menampilkan detail bintang per kategori
        if (peserta.total_jumlah_bintang.detail.length > 0) {
            detailHTML += `<h6>Detail Bintang:</h6><ul class="list-group mb-3">`;
            peserta.total_jumlah_bintang.detail.forEach(bintang => {
                detailHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        ${bintang.deskripsi} (${bintang.kategori})
                        <span class="badge bg-primary rounded-pill">${bintang.jumlah}</span>
                    </li>
                `;
            });
            detailHTML += `</ul>`;
        }
    
        // Menampilkan detail bintang bonus
        if (peserta.total_bintang_bonus.detail.length > 0) {
            detailHTML += `<h6>Bintang Bonus:</h6><ul class="list-group mb-3">`;
            peserta.total_bintang_bonus.detail.forEach(bonus => {
                detailHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        ${bonus.deskripsi} (${bonus.kategori})
                        <span class="badge bg-warning rounded-pill">${bonus.jumlah}</span>
                    </li>
                `;
            });
            detailHTML += `</ul>`;
        }
    
        // Masukkan ke dalam modal
        modalContent.innerHTML = detailHTML;
    
        // Tampilkan modal
        let modal = new bootstrap.Modal(document.getElementById("detailBintangModal"));
        modal.show();
    }
    
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
                fetchBintangByKelompok(kelompokId, pertemuanId,pagination.currentPage + 1);
            }
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
    }
}
