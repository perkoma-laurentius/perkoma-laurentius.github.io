import { NetworkHelper } from '../../config/networkHelper.js';
import { ENDPOINTS } from '../../config/endpoint.js';
import { showToast } from '../../config/toast.js';

/**
 * Inisialisasi halaman Rekapitulasi Bintang berdasarkan id_kelompok
 */
export function init() {
    console.log("✅ rekap-bintang.js loaded via GETBINTANG_BY_KELOMPOK");

    const container = document.getElementById("pertemuanContainer");
    const kelompokId = localStorage.getItem("kelompok_id");
    const page = 1;
    const size = 100;

    if (!kelompokId) {
        showToast("⚠️ ID Kelompok tidak ditemukan di localStorage!", "warning");
        container.innerHTML = `<p class="text-center text-danger">Kelompok belum dipilih.</p>`;
        return;
    }

    async function fetchRekapBintang() {
        try {
            container.innerHTML = `
                <div class="text-center py-5 w-100">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>`;

            const endpoint = ENDPOINTS.BINTANG.GETBINTANG_BY_KELOMPOK(kelompokId, page, size);
            const response = await NetworkHelper.get(endpoint);

            if (response.statusCode === 200 && response.data?.items?.peserta) {
                renderTable(response.data.items.peserta, response.data.items.nama_kelompok);
            } else {
                showToast("❌ Gagal mengambil data rekap!", "danger");
                container.innerHTML = `<p class="text-center text-danger">Gagal memuat data rekap.</p>`;
            }
        } catch (err) {
            console.error(err);
            showToast("⚠️ Gagal mengambil data dari server.", "danger");
            container.innerHTML = `<p class="text-center text-danger">Terjadi kesalahan saat mengambil data.</p>`;
        }
    }

    function renderTable(pesertaList, namaKelompok) {
        const headerHTML = `
            <div class="card shadow-sm">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">🌟 Nama Kelompok :                        <span class="text-muted me-3"> <strong>${namaKelompok}</strong></span>
</h5>
                    <div>
                        <button class="btn btn-sm btn-outline-primary" id="exportExcelBtn">
                            <i class="ti ti-download"></i> Export Excel
                        </button>
                    </div>
                </div>
                <div class="card-body table-responsive">
                    <table class="table table-bordered table-striped table-hover">
                        <thead class="table-primary text-center">
                            <tr>
                                <th>No</th>
                                <th>Nama Peserta</th>
                                <th>Nama Panggilan</th>
                                <th>Total Utama</th>
                                <th>Total Bonus</th>
                                <th>Total Semua</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        const bodyHTML = pesertaList.map((peserta, index) => `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${peserta.nama_peserta}</td>
                <td>${peserta.nama_panggilan_peserta}</td>
                <td class="text-center">${peserta.total_jumlah_bintang?.total || "0"}</td>
                <td class="text-center">${peserta.total_bintang_bonus?.total || "0"}</td>
                <td class="text-center fw-bold">${peserta.total_semua || "0"}</td>
            </tr>
        `).join("");

        const footerHTML = `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        container.innerHTML = headerHTML + bodyHTML + footerHTML;

        document.getElementById("exportExcelBtn")?.addEventListener("click", () => {
            const table = container.querySelector("table");
            const wb = XLSX.utils.table_to_book(table, { sheet: "Rekap Bintang" });
            XLSX.writeFile(wb, `rekap-bintang-kelompok-${kelompokId}.xlsx`);
        });
    }

    fetchRekapBintang();
}
