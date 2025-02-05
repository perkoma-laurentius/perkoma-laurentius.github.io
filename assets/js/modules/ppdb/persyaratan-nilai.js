import { NetworkHelper } from '../../config/networkHelper.js';
import { ENDPOINTS } from '../../config/endpoint.js';
import { showToast } from '../../config/toast.js';

/**
 * Inisialisasi halaman Persyaratan Nilai
 */
export function init() {
  const tableBody = document.getElementById("tableBody");
  const addGradeRequirementModal = new bootstrap.Modal(document.getElementById("editGradeRequirement"));
  const addNewRecordBtn = document.getElementById("addNewRecordBtn");
  const editGradeRequirementForm = document.getElementById("editGradeRequirementForm");

  const paginationContainer = document.createElement("div");
  paginationContainer.className = "d-flex justify-content-between align-items-center p-3";
  document.querySelector(".card-datatable").appendChild(paginationContainer);

  let currentPage = 1;
  fetchAllJalur();

  /**
   * Fetch data persyaratan nilai dari server dan render ke tabel
   */
  async function fetchGradeRequirements(page = 1) {
    try {
        // Lakukan request ke endpoint dengan query parameter pagination
        const response = await NetworkHelper.get(`${ENDPOINTS.PERSYARATAN_NILAI.GET_LIST}?page=${page}&size=10`);
      
        if (response && response.data) {
            const { items, pagination } = response.data;
            renderTable(items); // Render tabel dengan data items
            renderPagination(pagination); // Render pagination dengan metadata pagination
        } else {
            console.error("Failed to fetch grade requirements:", result.message);
            showToast("Gagal mengambil data persyaratan nilai!", "danger");
        }
    } catch (error) {
        console.error("Error fetching grade requirements:", error);
        showToast("Terjadi kesalahan saat mengambil data persyaratan nilai.", "danger");
    }
}

/**
 * Fetch all Jalur untuk mengisi dropdown pilihan jalur
 */
async function fetchAllJalur() {
  const jalurSelect = document.getElementById("jalurId"); // Pastikan jalurId adalah ID dari elemen select
  try {
    const response = await NetworkHelper.get(ENDPOINTS.PPDB_JALUR_PERIODE.GET_LIST);

    if (response && response.data) {
      const { items } = response.data;

      // Kosongkan dropdown sebelum diisi ulang
      jalurSelect.innerHTML = '<option value="">Pilih Jalur</option>';

      // Tambahkan setiap jalur ke dalam dropdown
      items.forEach((jalur) => {
        const option = document.createElement("option");
        option.value = jalur.id;
        option.textContent = `${jalur.nama_jalur} (${jalur.periode_mulai} - ${jalur.periode_selesai})`;
        jalurSelect.appendChild(option);
      });
    } else {
      console.error("Failed to fetch jalur:", response.message);
      showToast("Gagal mengambil data jalur!", "danger");
    }
  } catch (error) {
    console.error("Error fetching jalur:", error);
    showToast("Terjadi kesalahan saat mengambil data jalur.", "danger");
  }
}


  /**
   * Render data persyaratan nilai ke dalam tabel
   */
  function renderTable(data) {
    tableBody.innerHTML = "";

    data.forEach((requirement, index) => {
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${requirement.jalur_id}</td>
          <td>${requirement.subject_name}</td>
          <td>${requirement.minimum_score}</td>
          <td>${requirement.description || '-'}</td>
          <td>
            <button class="btn btn-sm btn-primary me-2 edit-btn" data-id="${requirement.id}">
              <i class="ti ti-pencil"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${requirement.id}">
              <i class="ti ti-trash"></i> Delete
            </button>
          </td>
        </tr>
      `;
      tableBody.insertAdjacentHTML("beforeend", row);
    });

    // Event listener untuk tombol Edit
    document.querySelectorAll(".edit-btn").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-id");
        handleEditGradeRequirement(id);
      });
    });

    // Event listener untuk tombol Delete
    document.querySelectorAll(".delete-btn").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-id");
        handleDeleteGradeRequirement(id);
      });
    });
  }

  /**
   * Handle Edit Persyaratan Nilai
   */
  async function handleEditGradeRequirement(requirementId) {
    try {
      const response = await NetworkHelper.get(ENDPOINTS.PERSYARATAN_NILAI.GET_BY_ID(requirementId));
      if (response && response.data) {
        resetForm("edit", response.data);
        addGradeRequirementModal.show();

        // Submit form untuk update
        editGradeRequirementForm.onsubmit = async (e) => {
          e.preventDefault();
          await handleUpdateGradeRequirement(requirementId);
        };
      } else {
        showToast("Gagal memuat data persyaratan nilai!", "danger");
      }
    } catch (error) {
      console.error("Error fetching grade requirement:", error);
      showToast("Terjadi kesalahan saat memuat data persyaratan nilai.", "danger");
    }
  }

  /**
   * Handle Update Persyaratan Nilai
   */
  async function handleUpdateGradeRequirement(requirementId) {
    const jalurId = document.getElementById("jalurId").value.trim();
    const subjectName = document.getElementById("subjectName").value.trim();
    const minimumScore = document.getElementById("minimumScore").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!jalurId || !subjectName || !minimumScore) {
      showToast("Semua field wajib diisi!", "danger");
      return;
    }

    const requestBody = {
      jalur_id: parseInt(jalurId, 10),
      subject_name: subjectName,
      minimum_score: parseFloat(minimumScore),
      description: description,
    };

    try {
      const response = await NetworkHelper.put(ENDPOINTS.PERSYARATAN_NILAI.UPDATE(requirementId), requestBody);

      if (response.status && response.code === "SUCCESS") {
        showToast("Persyaratan nilai updated successfully!", "success");
        addGradeRequirementModal.hide();
        fetchGradeRequirements(currentPage);
      } else {
        console.error("Failed to update grade requirement:", response.message);
        showToast("Gagal memperbarui persyaratan nilai, coba lagi.", "danger");
      }
    } catch (error) {
      console.error("Error updating grade requirement:", error);
      showToast("Terjadi kesalahan saat memperbarui persyaratan nilai.", "danger");
    }
  }

  /**
   * Tambah Persyaratan Nilai
   */
  async function handleAddGradeRequirement() {
    const jalurId = document.getElementById("jalurId").value.trim();
    const subjectName = document.getElementById("subjectName").value.trim();
    const minimumScore = document.getElementById("minimumScore").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!jalurId || !subjectName || !minimumScore) {
      showToast("Semua field wajib diisi!", "danger");
      return;
    }

    const requestBody = {
      jalur_id: parseInt(jalurId, 10),
      subject_name: subjectName,
      minimum_score: parseFloat(minimumScore),
      description: description,
    };

    try {
      const response = await NetworkHelper.post(ENDPOINTS.PERSYARATAN_NILAI.CREATE, requestBody);

      if (response.status && response.code === "SUCCESS") {
        showToast("Persyaratan nilai added successfully!", "success");
        addGradeRequirementModal.hide();
        fetchGradeRequirements(currentPage);
      } else {
        console.error("Failed to add grade requirement:", response.message);
        showToast("Gagal menambahkan persyaratan nilai, coba lagi.", "danger");
      }
    } catch (error) {
      console.error("Error adding grade requirement:", error);
      showToast("Terjadi kesalahan saat menambahkan persyaratan nilai.", "danger");
    }
  }

  /**
   * Handle Delete Persyaratan Nilai
   */
  async function handleDeleteGradeRequirement(requirementId) {
    const userConfirmed = confirm("Apakah Anda yakin ingin menghapus persyaratan nilai ini? Data yang dihapus tidak dapat dikembalikan!");

    if (userConfirmed) {
      try {
        const response = await NetworkHelper.delete(ENDPOINTS.PERSYARATAN_NILAI.DELETE(requirementId));

        if (response.status && response.code === "SUCCESS") {
          showToast(response.message, "success");
          fetchGradeRequirements(currentPage);
        } else {
          console.error("Failed to delete grade requirement:", response.message);
          showToast("Gagal menghapus persyaratan nilai, coba lagi.", "danger");
        }
      } catch (error) {
        console.error("Error deleting grade requirement:", error);
        showToast("Terjadi kesalahan saat menghapus persyaratan nilai.", "danger");
      }
    }
  }

  /**
   * Reset form input modal
   */
  function resetForm(mode, requirementData = null) {
    document.getElementById("editGradeRequirement").setAttribute("data-mode", mode);
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");

    if (mode === "add") {
      modalTitle.textContent = "Tambah Persyaratan Nilai";
      modalDescription.textContent = "Isi form di bawah ini untuk menambahkan persyaratan nilai baru.";
      editGradeRequirementForm.reset();
    } else if (mode === "edit" && requirementData) {
      modalTitle.textContent = "Edit Persyaratan Nilai";
      modalDescription.textContent = "Ubah informasi persyaratan nilai di bawah ini.";
      document.getElementById("jalurId").value = requirementData.jalur_id || "";
      document.getElementById("subjectName").value = requirementData.subject_name || "";
      document.getElementById("minimumScore").value = requirementData.minimum_score || "";
      document.getElementById("description").value = requirementData.description || "";
    }
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
        fetchGradeRequirements(currentPage);
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
        fetchGradeRequirements(currentPage);
      }
    });

    paginationContainer.appendChild(prevBtn);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextBtn);
  }

  addNewRecordBtn.addEventListener("click", () => {
    resetForm("add");
    addGradeRequirementModal.show();

    // Tambahkan event listener untuk submit form pada mode tambah
    editGradeRequirementForm.onsubmit = async (e) => {
      e.preventDefault();
      await handleAddGradeRequirement();
    };
  });

  fetchGradeRequirements(currentPage);
}
