import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';
import { showToast } from '../config/toast.js';

/**
 * Inisialisasi halaman Peserta
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const paginationContainer = document.createElement("div");
    paginationContainer.className = "d-flex justify-content-between align-items-center p-3";
    document.querySelector(".card-datatable").appendChild(paginationContainer);

    let currentPage = 1;

    /**
     * Fetch peserta dari server dan render ke dalam tabel
     */
    async function fetchPeserta(page = 1) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Token tidak ditemukan. Harap login kembali.', 'danger');
                return;
            }

            const response = await NetworkHelper.get(`${ENDPOINTS.STUDENTS.GET_STUDENTS}?page=${page}&size=10`, {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            if (response.statusCode === 200 && response.data.items) {
                const { items, pagination } = response.data;

                renderTable(items); // Render data ke tabel
                renderPagination(pagination); // Render navigasi pagination
            } else {
                console.error("Gagal mengambil data peserta:", response.message);
                showToast("Gagal mengambil data peserta!", "danger");
            }
        } catch (error) {
            console.error("Error fetching peserta:", error);
            showToast("Terjadi kesalahan saat mengambil data peserta.", "danger");
        }
    }
/**
 * Render data peserta ke dalam tabel
 * @param {Array} data - Data peserta dari API
 */
function renderTable(data) {
    tableBody.innerHTML = "";

    data.forEach((peserta, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${peserta.nama || "Tidak Tersedia"}</td>
                <td>${peserta.nama_panggilan || "Tidak Tersedia"}</td>
                <td>${peserta.sekolah || "Tidak Tersedia"}</td>
                <td>${peserta.kelas || "Tidak Tersedia"}</td>
                <td>${new Date(peserta.tanggal_lahir).toLocaleDateString() || "Tidak Tersedia"}</td>
                <td>${peserta.gender === "P" ? "Perempuan" : "Laki-Laki"}</td>
            </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", row);
    });
}


    /**
     * Render navigasi pagination
     */
    function renderPagination(pagination) {
        paginationContainer.innerHTML = "";

        const prevBtn = document.createElement("button");
        prevBtn.className = "btn btn-sm btn-secondary";
        prevBtn.textContent = "Previous";
        prevBtn.disabled = !pagination.urls.prev;
        prevBtn.addEventListener("click", () => {
            if (pagination.urls.prev) {
                currentPage--;
                fetchPeserta(currentPage);
            }
        });

        const pageInfo = document.createElement("span");
        pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;

        const nextBtn = document.createElement("button");
        nextBtn.className = "btn btn-sm btn-secondary";
        nextBtn.textContent = "Next";
        nextBtn.disabled = !pagination.urls.next;
        nextBtn.addEventListener("click", () => {
            if (pagination.urls.next) {
                currentPage++;
                fetchPeserta(currentPage);
            }
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
    }
    /**
 * Tambah peserta baru
 */
async function createPeserta() {
    const requestBody = {
        nama: document.getElementById("nama").value.trim(),
        nama_panggilan: document.getElementById("nama_panggilan").value.trim(),
        sekolah: document.getElementById("sekolah").value.trim(),
        kelas: document.getElementById("kelas").value.trim(),
        gender: document.getElementById("gender").value.trim(),
        tanggal_lahir: document.getElementById("tanggal_lahir").value.trim(),
    };

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Token tidak ditemukan. Harap login kembali.', 'danger');
            return;
        }

        const response = await NetworkHelper.post(ENDPOINTS.STUDENTS.CREATE_STUDENTS, requestBody, {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        });

        // **Jika peserta berhasil ditambahkan**
        if (response.statusCode === 201 && response.success !== false) {
            showToast("Peserta berhasil ditambahkan!", "success");
            fetchPeserta(); // Refresh data peserta

            // Reset form dan tutup modal
            document.getElementById("editPesertaForm").reset();
            const addPesertaModal = bootstrap.Modal.getInstance(document.getElementById("editPeserta"));
            if (addPesertaModal) addPesertaModal.hide();

        } else {
            console.error("Gagal menambahkan peserta:", response.message);
            showToast(response.message || "Gagal menambahkan peserta!", "danger");
        }
    } catch (error) {
        console.error("Error adding peserta:", error);
        showToast("Terjadi kesalahan saat menambahkan peserta.", "danger");
    }
}
function parseFileContent(file, content) {
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'csv') {
        const rows = content.split('\n').slice(1); // Skip header row
        const parsedData = rows.map((row) => {
            const columns = row.split(',').map((col) => col.trim()); // Trim spaces
            
            if (columns.length < 6) {
                console.warn('Skipping invalid row:', row);
                return null;
            }

            const [nama, nama_panggilan, sekolah, kelas, gender, tanggal_lahir] = columns;

            return {
                nama,
                nama_panggilan,
                sekolah,
                kelas,
                gender: gender.toUpperCase() === 'P' ? 'P' : 'L', // Pastikan tetap 'P' atau 'L'
                tanggal_lahir,
            };
        }).filter(row => row !== null); // Hapus baris kosong atau invalid

        console.log('Parsed CSV Data:', parsedData);
        return parsedData;
    
    } else if (extension === 'xlsx') {
        try {
            const workbook = XLSX.read(content, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

            const parsedData = jsonData.map((row) => {
                const {
                    nama = "",
                    nama_panggilan = "",
                    sekolah = "",
                    kelas = "",
                    gender = "",
                    tanggal_lahir = "",
                } = row;

                return {
                    nama,
                    nama_panggilan,
                    sekolah,
                    kelas,
                    gender: gender.toUpperCase() === 'P' ? 'P' : 'L', // Pastikan tetap 'P' atau 'L'
                    tanggal_lahir,
                };
            });

            console.log('Parsed XLSX Data:', parsedData);
            return parsedData;
        } catch (error) {
            console.error('Error parsing XLSX file:', error);
            showToast('Gagal membaca file XLSX. Pastikan format file valid.', 'danger');
            return [];
        }
    
    } else {
        showToast('Format file tidak didukung. Gunakan file CSV atau XLSX.', 'danger');
        return [];
    }
}

    
/**
 * Baca file sebagai teks
 * @param {File} file - File yang akan dibaca
 * @returns {Promise<string>}
 * @throws {Error} - Jika gagal membaca file
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsText
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FileReader/onload
 * 
    */
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Gagal membaca file'));

        reader.readAsText(file);
    });
}

async function bulkUploadPeserta() {
    const fileInput = document.getElementById("fileUpload");
    const file = fileInput.files[0];

    if (!file) {
        showToast("File tidak ditemukan. Harap unggah file terlebih dahulu.", "danger");
        return;
    }

    try {
        const fileContent = await readFileAsText(file);
        const pesertaData = parseFileContent(file, fileContent);

        if (pesertaData.length === 0) {
            showToast("Data peserta kosong atau tidak valid.", "danger");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            showToast("Token tidak ditemukan. Harap login kembali.", "danger");
            return;
        }

        const response = await NetworkHelper.post(ENDPOINTS.STUDENTS.BULK, { peserta: pesertaData }, {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        });

        if (response.statusCode === 201) {
            const { successCount, failedCount, successfulInsertions, failedInsertions } = response;
        
            // Handle successful insertions
            if (successCount > 0) {
                showToast(`${successCount} peserta berhasil ditambahkan.`, "success");
                console.log("Successful Insertions:", successfulInsertions);
            }
        
            // Handle failed insertions
            if (failedCount > 0) {
                showToast(`${failedCount} peserta gagal ditambahkan.`, "warning");
                failedInsertions.forEach((failure) => {
                    console.warn(`Gagal: ${failure.student.nama} - Alasan: ${failure.reason}`);
                    showToast(`Gagal: ${failure.student.nama} - ${failure.reason}`, "danger");
                });
            }
        
            // Close the modal if at least one insertion was successful
            if (successCount > 0) {
                const bulkUpdateModal = bootstrap.Modal.getInstance(document.getElementById("bulkUpdateModal"));
                bulkUpdateModal.hide();
            }
        } else {
            showToast("Gagal mengunggah peserta.", "danger");
        }
        
    } catch (error) {
        console.error("Error bulk uploading peserta:", error);
        showToast("Terjadi kesalahan saat melakukan bulk upload peserta.", "danger");
    }
}



/**
 * Fungsi untuk membuat file template bulk update
 */
function generateBulkUpdateTemplate() {
    const data = [
        ['nama', 'email', 'no_hp', 'alamat', 'gender', 'tanggal_lahir'], // Header
        ['Siti Aisyah', 'siti@example.com', '081234567890', 'Jl. Merdeka No. 123', 'P', '1995-02-15'],
        ['Joko Susanto', 'joko@example.com', '081298765432', 'Jl. Sudirman No. 45', 'L', '1990-05-20'],
        ['Luna Maya', 'luna@example.com', '085285982722', 'Jl. Mangga No. 3', 'P', '1988-10-10']
    ];

    // Buat worksheet dari data
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Buat workbook baru
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bulk Update Template');

    // Buat file Excel dan trigger unduhan
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

    // Konversi ke Blob untuk unduhan
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    // Trigger unduhan
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-bulk-update.xlsx';
    a.click();

    // Bersihkan URL Blob
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Konversi string ke ArrayBuffer
 * @param {string} s - String
 * @returns {ArrayBuffer}
 */
function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
}

// Tambahkan event listener ke tombol
document.getElementById('downloadTemplateBtn').addEventListener('click', () => {
    generateBulkUpdateTemplate();
});

// Tambahkan event listener untuk bulk upload
document.getElementById("bulkUpdateForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    await bulkUploadPeserta();
});

    // Tambahkan event listener untuk tombol tambah peserta
    const addNewRecordBtn = document.getElementById("addNewPesertaBtn");
    const editPesertaForm = document.getElementById("editPesertaForm");

    addNewRecordBtn.addEventListener("click", () => {
        document.getElementById("editPesertaForm").reset(); // Reset form sebelum digunakan
        const addPesertaModal = new bootstrap.Modal(document.getElementById("editPeserta"));
        addPesertaModal.show();

        editPesertaForm.onsubmit = async (e) => {
            e.preventDefault();
            await createPeserta();
        };
    });

    fetchPeserta(currentPage); // Fetch data peserta saat halaman di-load
}
