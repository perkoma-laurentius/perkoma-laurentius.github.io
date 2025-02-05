import { NetworkHelper } from '../../config/networkHelper.js';
import { ENDPOINTS } from '../../config/endpoint.js';
import { showToast } from '../../config/toast.js';

export function init() {
    const tableBody = document.getElementById("tableBody");
    const jalurPeriodeId = localStorage.getItem("selectedJalurId"); // Ambil jalur_periode_id dari localStorage
    let currentPage = 1;

    if (!jalurPeriodeId) {
        showToast("Jalur Periode ID tidak ditemukan!", "danger");
        return;
    }

    /**
     * Fetch data siswa berdasarkan jalur
     */
    async function fetchStudentsByJalur(page = 1) {
        try {
            const response = await NetworkHelper.get(
                `${ENDPOINTS.STUDENT_REGISTRATIONS.GET_BY_JALUR(jalurPeriodeId)}?page=${page}&size=10`
            );

            if (response && response.data) {
                const { items, pagination } = response.data;
                renderTable(items);
                renderPagination(pagination);
            } else {
                console.error("Failed to fetch students:", response.message);
                showToast("Gagal mengambil data siswa!", "danger");
            }
        } catch (error) {
            console.error("Error fetching students by jalur:", error);
            showToast("Terjadi kesalahan saat mengambil data siswa.", "danger");
        }
    }

    /**
     * Render data siswa ke tabel
     */
    function renderTable(data) {
        tableBody.innerHTML = "";
    
        data.forEach((student, index) => {
            let statusClass = "";
            let statusLabel = student.status_pendaftaran;
            let actionButtonLabel = "";
        let actionButtonClass = "btn-warning";
        
        // Tentukan kelas warna berdasarkan status_pendaftaran
         switch (statusLabel) {
            case "Terdaftar":
                statusClass = "btn-primary";
                actionButtonLabel = "Validasi";
                break;
            case "Validasi":
                statusClass = "btn-info";
                actionButtonLabel = "Wawancara";
                break;
            case "Wawancara":
                statusClass = "btn-warning";
                actionButtonLabel = "Daftar Ulang";
                break;
            case "Daftar Ulang":
                statusClass = "btn-success";
                actionButtonLabel = "Diterima";
                break;
            case "Diterima":
                statusClass = "btn-success";
                actionButtonLabel = "Print";
                actionButtonClass = "btn-primary"; // Ganti warna tombol Print jika diperlukan
                break;
            default:
                statusClass = "btn-secondary";
                actionButtonLabel = "Tidak Tersedia";
        }

    
            // Tentukan kelas warna berdasarkan status_pendaftaran
            switch (statusLabel) {
                case "Terdaftar":
                    statusClass = "btn-primary";
                    break;
                case "Validasi":
                    statusClass = "btn-info";
                    break;
                case "Wawancara":
                    statusClass = "btn-warning";
                    break;
                case "Daftar Ulang":
                    statusClass = "btn-success";
                    break;
                case "Diterima":
                        statusClass = "btn-success";
                        break;
                default:
                    statusClass = "btn-secondary";
            }
    
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${student.nis || '-'}</td>
                    <td>${student.nama_lengkap}</td>
                    <td>${student.jenis_kelamin}</td>
                    <td>${student.tanggal_lahir}</td>
                    <td>${student.alamat_lengkap}</td>
                    <td>
                        <button class="btn btn-sm ${statusClass}" disabled>${statusLabel}</button>
                    </td>
                    <td>${student.nama_jalur}</td>
                    <td>${student.periode_mulai}</td>
                    <td>${student.periode_selesai}</td>
                      <td>
                        <button class="btn btn-sm btn-primary action-btn" data-id="${student.student_id}" data-action="view"> lihat </button>
                    </td>
                    <td>
                        <button class="btn btn-sm ${actionButtonClass} action-btn" data-id="${student.student_id}" data-action="${actionButtonLabel.toLowerCase()}">
                            ${actionButtonLabel}
                        </button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });
        document.querySelectorAll(".action-btn").forEach((button) => {
            button.addEventListener("click", (event) => {
                const studentId = event.target.getAttribute("data-id");
                const action = event.target.getAttribute("data-action");
                handleAction(studentId, action);
            });
        });
    }
    
    /**
 * Fungsi untuk menangani klik pada tombol action
 * @param {number} studentId - ID siswa
 */
async function handleAction(studentId,action) {
    try {
        if (action === "print") {
            // Arahkan ke endpoint cetak tanpa mengubah status
            const printUrl = `/api/students/print/${studentId}`;
            window.open(printUrl, "_blank"); // Membuka halaman cetak di tab baru
            return;
        }
        const response = await NetworkHelper.put(
            ENDPOINTS.STUDENT_REGISTRATIONS.UPDATE_STATUS(studentId)
        );

        if (response.status && response.code === "SUCCESS") {
            showToast("Status berhasil diperbarui!", "success");
            fetchStudentsByJalur(currentPage); // Reload data setelah update
        } else {
            showToast("Gagal memperbarui status!", "danger");
        }
    } catch (error) {
        console.error("Error updating status:", error);
        showToast("Terjadi kesalahan saat memperbarui status.", "danger");
    }
}
/**
 * Render navigasi pagination
 * @param {object} pagination - Objek pagination dari API
 */
function renderPagination(pagination) {
    paginationContainer.innerHTML = ""; // Kosongkan container pagination

    // Tombol Previous
    const prevBtn = document.createElement("button");
    prevBtn.className = "btn btn-sm btn-secondary";
    prevBtn.textContent = "Previous";
    prevBtn.disabled = pagination.currentPage === 1; // Disabled jika di halaman pertama
    prevBtn.addEventListener("click", () => {
        if (pagination.currentPage > 1) {
            currentPage--;
            fetchStudentsByJalur(currentPage); // Fungsi untuk mengambil data berdasarkan halaman
        }
    });

    // Informasi halaman
    const pageInfo = document.createElement("span");
    pageInfo.className = "mx-2"; // Beri jarak horizontal
    pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;

    // Tombol Next
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn btn-sm btn-secondary";
    nextBtn.textContent = "Next";
    nextBtn.disabled = pagination.currentPage === pagination.totalPages; // Disabled jika di halaman terakhir
    nextBtn.addEventListener("click", () => {
        if (pagination.currentPage < pagination.totalPages) {
            currentPage++;
            fetchStudentsByJalur(currentPage); // Fungsi untuk mengambil data berdasarkan halaman
        }
    });

    // Tambahkan tombol dan info ke container
    paginationContainer.appendChild(prevBtn);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextBtn);
}

    fetchStudentsByJalur(currentPage);
}
