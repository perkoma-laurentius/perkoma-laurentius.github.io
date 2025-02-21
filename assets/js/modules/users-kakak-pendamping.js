import { NetworkHelper } from "../config/networkHelper.js";
import { ENDPOINTS } from "../config/endpoint.js";
import { showToast } from "../config/toast.js";
let storedData = [];
/**
 * Inisialisasi halaman Pendamping
 */
export function init() {
  const tableBody = document.getElementById("tableBody");
  const paginationContainer = document.createElement("div");
  paginationContainer.className =
    "d-flex justify-content-between align-items-center p-3";
  document.querySelector(".card-datatable").appendChild(paginationContainer);

  let currentPage = 1;

  /**
   * Fetch pendamping dari server dan render ke dalam tabel
   */
  async function fetchPendamping(page = 1) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Token tidak ditemukan. Harap login kembali.", "danger");
        return;
      }

      const response = await NetworkHelper.get(
        `${ENDPOINTS.PENDAMPING.GET_ALL}?page=${page}&size=10`,
        {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.statusCode === 200 && response.data.items) {
        const { pagination } = response.data;
        storedData = response.data.items; // 🔹 Simpan data agar bisa digunakan di openEditModal()
        renderTable(storedData);

        renderPagination(pagination); // Render navigasi pagination
      } else {
        console.error("Gagal mengambil data pendamping:", response.message);
        showToast("Gagal mengambil data pendamping!", "danger");
      }
    } catch (error) {
      console.error("Error fetching pendamping:", error);
      showToast("Terjadi kesalahan saat mengambil data pendamping.", "danger");
    }
  }

  document.getElementById("downloadTemplateBtn").addEventListener("click", generateBulkUpdateTemplate);

  function generateBulkUpdateTemplate() {
    const data = [
        ['Nama Lengkap', 'Email', 'No. Telepon', 'Alamat', 'Jenis Kelamin (L/P)', 'Tanggal Lahir (YYYY-MM-DD)'], // Header
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

    // Konversi string ke array buffer
    function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
    }

    // Konversi ke Blob untuk unduhan
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    // Trigger unduhan
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-bulk-update.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Bersihkan URL Blob
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

  /**
   * Perbarui data pendamping
   */
  async function updatePendamping(pendampingId) {
    const requestBody = {
      nama: document.getElementById("nama").value.trim(),
      no_hp: document.getElementById("no_hp").value.trim(),
      email: document.getElementById("email").value.trim(),
      alamat: document.getElementById("alamat").value.trim(),
      gender: document.getElementById("gender").value.trim(),
      tanggal_lahir: document.getElementById("tanggal_lahir").value.trim(),
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Token tidak ditemukan. Harap login kembali.", "danger");
        return;
      }

      const response = await NetworkHelper.put(
        ENDPOINTS.PENDAMPING.UPDATE(pendampingId),
        requestBody,
        {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.statusCode === 200) {
        showToast("Pendamping berhasil diperbarui!", "success");
        fetchPendamping(); // Refresh data pendamping
        const editPendampingModal = bootstrap.Modal.getInstance(
          document.getElementById("editPendamping")
        );
        editPendampingModal.hide();
      } else {
        console.error("Gagal memperbarui pendamping:", response.message);
        showToast(
          response.message || "Gagal memperbarui pendamping!",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error updating pendamping:", error);
      showToast("Terjadi kesalahan saat memperbarui pendamping.", "danger");
    }
  }

  /**
   * Hapus pendamping
   */
  async function deletePendamping(pendampingId) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Token tidak ditemukan. Harap login kembali.", "danger");
        return;
      }

      const response = await NetworkHelper.delete(
        ENDPOINTS.PENDAMPING.DELETE(pendampingId),
        {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.statusCode === 200) {
        showToast("Pendamping berhasil dihapus!", "success");
        fetchPendamping(); // Refresh data pendamping
      } else {
        console.error("Gagal menghapus pendamping:", response.message);
        showToast(response.message || "Gagal menghapus pendamping!", "danger");
      }
    } catch (error) {
      console.error("Error deleting pendamping:", error);
      showToast("Terjadi kesalahan saat menghapus pendamping.", "danger");
    }
  }

  function renderTable(data) {
    tableBody.innerHTML = "";

    data.forEach((pendamping, index) => {
      const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${pendamping.nama || "Tidak Tersedia"}</td>
                    <td>${pendamping.alamat || "Tidak Tersedia"}</td>
                    <td>${pendamping.tanggal_lahir || "Tidak Tersedia"}</td>
                                        <td>${
                                          pendamping.gender === "P"
                                            ? "Perempuan"
                                            : "Laki-Laki"
                                        }</td>

                    <td>${pendamping.no_hp || "Tidak Tersedia"}</td>
                                        <td>${
                                          pendamping.email || "Tidak Tersedia"
                                        }</td>

                    
                    <td>
                        <button class="btn btn-sm btn-primary me-2 edit-btn" data-id="${
                          pendamping.id
                        }">Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${
                          pendamping.id
                        }">Hapus</button>
                    </td>
                </tr>
            `;
      tableBody.insertAdjacentHTML("beforeend", row);
    });

    // Tambahkan event listener untuk tombol edit dan delete
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const pendampingId = e.target.getAttribute("data-id");
        openEditModal(pendampingId);
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const pendampingId = e.target.getAttribute("data-id");
        deletePendamping(pendampingId);
      });
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
        fetchPendamping(currentPage);
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
        fetchPendamping(currentPage);
      }
    });

    paginationContainer.appendChild(prevBtn);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextBtn);
  }

  /**
   * Tambah pendamping baru
   */
  async function createPendamping() {
    const requestBody = {
      nama: document.getElementById("nama").value.trim(),
      no_hp: document.getElementById("no_hp").value.trim(),
      email: document.getElementById("email").value.trim(),
      alamat: document.getElementById("alamat").value.trim(),
      gender: document.getElementById("gender").value.trim(),
      tanggal_lahir: document.getElementById("tanggal_lahir").value.trim(),
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Token tidak ditemukan. Harap login kembali.", "danger");
        return;
      }

      const response = await NetworkHelper.post(
        ENDPOINTS.PENDAMPING.CREATE,
        requestBody,
        {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.statusCode === 201) {
        showToast("Pendamping berhasil ditambahkan!", "success");
        fetchPendamping(); // Refresh data pendamping
        document.getElementById("editPendampingForm").reset(); // Reset form
        const addPendampingModal = bootstrap.Modal.getInstance(
          document.getElementById("editPendamping")
        );
        addPendampingModal.hide();
      } else {
        console.error("Gagal menambahkan pendamping:", response.message);
        showToast(
          response.message || "Gagal menambahkan pendamping!",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error adding pendamping:", error);
      showToast("Terjadi kesalahan saat menambahkan pendamping.", "danger");
    }
  }

  function openEditModal(pendampingId) {
    const pendamping = storedData.find((item) => item.id == pendampingId); // 🔹 Cari data dari storedData

    if (!pendamping) {
      showToast("Data tidak ditemukan!", "danger");
      return;
    }

    // Isi form dengan data pendamping yang ditemukan
    document.getElementById("nama").value = pendamping.nama || "";
    document.getElementById("no_hp").value = pendamping.no_hp || "";
    document.getElementById("email").value = pendamping.email || "";
    document.getElementById("alamat").value = pendamping.alamat || "";
    document.getElementById("gender").value = pendamping.gender || "";
    document.getElementById("tanggal_lahir").value =
      pendamping.tanggal_lahir || "";

    const editPendampingModal = new bootstrap.Modal(
      document.getElementById("editPendamping")
    );
    editPendampingModal.show();

    // Ubah fungsi submit form
    const editPendampingForm = document.getElementById("editPendampingForm");
    editPendampingForm.onsubmit = async (e) => {
      e.preventDefault();
      await updatePendamping(pendampingId);
    };
  }

  // Tambahkan event listener untuk tombol tambah pendamping
  const addNewRecordBtn = document.getElementById("addNewPendampingBtn");
  const editPendampingForm = document.getElementById("editPendampingForm");

  addNewRecordBtn.addEventListener("click", () => {
    document.getElementById("editPendampingForm").reset(); // Reset form sebelum digunakan
    const addPendampingModal = new bootstrap.Modal(
      document.getElementById("editPendamping")
    );
    addPendampingModal.show();

    editPendampingForm.onsubmit = async (e) => {
      e.preventDefault();
      await createPendamping();
    };
  });

  fetchPendamping(currentPage); // Fetch data pendamping saat halaman di-load
}
