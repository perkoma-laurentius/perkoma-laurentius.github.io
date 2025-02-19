import { NetworkHelper } from '../../config/networkHelper.js';
import { ENDPOINTS } from '../../config/endpoint.js';
import { showToast } from '../../config/toast.js';
import { navigate } from '../../modules/main.js'; // ✅ Import navigate dari main.js

/**
 * Inisialisasi halaman Pertemuan
 */
export function init() {
    console.log("✅ presensi-dan-bintang.js loaded successfully");

    const pertemuanContainer = document.getElementById("pertemuanContainer");

    /**
     * Fetch data pertemuan dari server dan render ke dalam card
     */
    async function fetchPertemuan() {
        try {
            pertemuanContainer.innerHTML = `<p class="text-center">⏳ Memuat pertemuan...</p>`;

            // Fetch data pertemuan dari API
            const response = await NetworkHelper.get(ENDPOINTS.PERTEMUAN.GET_ALL);

            if (response.statusCode === 200 && response.data?.items) {
                renderPertemuan(response.data.items); // ✅ Gunakan `data.items`
            } else {
                showToast("❌ Gagal mengambil data pertemuan!", "danger");
                pertemuanContainer.innerHTML = `<p class="text-center text-danger">Gagal memuat data pertemuan.</p>`;
            }
        } catch (error) {
            console.error("Error fetching pertemuan:", error);
            showToast("⚠️ Terjadi kesalahan saat mengambil data pertemuan.", "danger");
            pertemuanContainer.innerHTML = `<p class="text-center text-danger">Terjadi kesalahan.</p>`;
        }
    }

    /**
     * Render data pertemuan ke dalam card layout
     */
    function renderPertemuan(pertemuanList) {
        pertemuanContainer.innerHTML = "";

        pertemuanList.forEach((pertemuan, index) => {
            const pertemuanIndex = index + 1; // P1, P2, dst.

            const cardHTML = `
                <div class="col-md-6">
                    <div class="card shadow-sm pertemuan-card">
                        <div class="row g-0">
                            <div class="col-md-4 d-flex align-items-center justify-content-center bg-primary text-white">
                                <h2 class="display-4 fw-bold">P${pertemuanIndex}</h2> <!-- Ikon unik -->
                            </div>
                            <div class="col-md-8">
                                <div class="card-body">
                                    <h5 class="card-title">${pertemuan.nama || "Nama Tidak Tersedia"}</h5>
                                    <p class="card-text"><strong>📆 Tanggal:</strong> ${new Date(pertemuan.tanggal).toLocaleDateString()}</p>
                                    <p class="card-text"><strong>📖 Materi:</strong> ${pertemuan.materi || "Tidak Ada Materi"}</p>
                                   <div class="d-grid gap-2">
    <button class="btn btn-primary btn-presensi w-100" data-id="${pertemuan.id}">
        <i class="fas fa-user-check"></i> Presensi
    </button>
    <button class="btn btn-warning btn-bintang w-100" data-id="${pertemuan.id}">
        <i class="fas fa-star"></i> Bintang
    </button>
</div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            pertemuanContainer.insertAdjacentHTML("beforeend", cardHTML);
        });

        addEventListeners();
    }

    /**
     * Tambahkan event listener ke tombol Presensi & Bintang
     */
    function addEventListeners() {
        document.querySelectorAll(".btn-presensi").forEach(button => {
            button.addEventListener("click", function () {
                let pertemuanId = this.getAttribute("data-id");
                handlePresensi(pertemuanId);
            });
        });

        document.querySelectorAll(".btn-bintang").forEach(button => {
            button.addEventListener("click", function () {
                let pertemuanId = this.getAttribute("data-id");
                handleBintang(pertemuanId);
            });
        });
    }

    /**
     * Handle klik tombol Presensi - Navigasi ke halaman Presensi
     */
    function handlePresensi(pertemuanId) {
        showToast(`🔄 Mengarahkan ke halaman Presensi untuk Pertemuan ${pertemuanId}...`, "info");
        navigate("PRESENSI", { pertemuanId }); // ✅ Navigasi ke halaman Presensi
    }

    /**
     * Handle klik tombol Bintang - Navigasi ke halaman Bintang
     */
    function handleBintang(pertemuanId) {
        showToast(`🔄 Mengarahkan ke halaman Bintang untuk Pertemuan ${pertemuanId}...`, "info");
        navigate("BINTANG", { pertemuanId }); // ✅ Navigasi ke halaman Bintang
    }

    // Panggil fetchPertemuan saat halaman dimuat
    fetchPertemuan();
}
