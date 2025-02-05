import { NetworkHelper } from '../config/networkHelper.js';
import { ENDPOINTS } from '../config/endpoint.js';

/**
 * Inisialisasi halaman Roles
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const addRoleModal = new bootstrap.Modal(document.getElementById("editUser"));
    const addNewRecordBtn = document.getElementById("addNewRecordBtn");
    const editUserForm = document.getElementById("editUserForm");

    const paginationContainer = document.createElement("div");
    paginationContainer.className = "d-flex justify-content-between align-items-center p-3";
    document.querySelector(".card-datatable").appendChild(paginationContainer);

    let currentPage = 1; // Halaman saat ini

    /**
     * Fetch roles dari server dan render ke dalam tabel
     */
    async function fetchRoles(page = 1) {
        try {
            const requestBody = {
                paging: true,
                page: page, // Halaman saat ini
                size: 10,   // Jumlah data per halaman
                startDate: "",
                endDate: "",
                term: ""
            };

            const response = await NetworkHelper.post(ENDPOINTS.ROLES.GET_ROLES, requestBody);

            if (response.status === "success") {
                const { items, pagination } = response.data;

                renderTable(items); // Render data ke tabel
                renderPagination(pagination); // Render navigasi pagination
            } else {
                console.error("Failed to fetch roles:", response.message);
                showToast("Gagal mengambil data roles!", "danger");
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
            showToast("Terjadi kesalahan saat mengambil data roles.", "danger");
        }
    }

    /**
     * Render data roles ke dalam tabel
     * @param {Array} data - Data roles dari API
     */
    function renderTable(data) {
        tableBody.innerHTML = ""; // Kosongkan tabel sebelum merender ulang

        data.forEach((role, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${role.id}</td>
                    <td>${role.rolename}</td>
                    <td>${role.desc}</td>
                    <td>
                        <span class="badge bg-label-${role.status ? "success" : "danger"}">
                            ${role.status ? "Active" : "Inactive"}
                        </span>
                    </td>
                    <td>${new Date(role.updated_at).toLocaleDateString()}</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });
    }

    /**
     * Render navigasi pagination
     * @param {Object} pagination - Data pagination dari API
     */
    function renderPagination(pagination) {
        paginationContainer.innerHTML = ""; // Kosongkan pagination sebelum merender ulang

        // Tombol Previous
        const prevBtn = document.createElement("button");
        prevBtn.className = "btn btn-sm btn-secondary";
        prevBtn.textContent = "Previous";
        prevBtn.disabled = !pagination.urls.prev;
        prevBtn.addEventListener("click", () => {
            if (pagination.urls.prev) {
                currentPage--;
                fetchRoles(currentPage);
            }
        });

        // Info Halaman
        const pageInfo = document.createElement("span");
        pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;

        // Tombol Next
        const nextBtn = document.createElement("button");
        nextBtn.className = "btn btn-sm btn-secondary";
        nextBtn.textContent = "Next";
        nextBtn.disabled = !pagination.urls.next;
        nextBtn.addEventListener("click", () => {
            if (pagination.urls.next) {
                currentPage++;
                fetchRoles(currentPage);
            }
        });

        // Append semua elemen ke pagination container
        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
    }

    /**
     * Reset form input modal
     */
    function resetForm() {
        document.getElementById("modalRoleName").value = "";
        document.getElementById("modalRoleDesc").value = "";
        document.getElementById("modalRoleStatus").value = ""; // Default status
    }

    /**
     * Tambah role baru melalui modal
     */
    async function handleAddRole(e) {
        e.preventDefault();
        const roleName = document.getElementById("modalRoleName").value.trim();
        const roleDesc = document.getElementById("modalRoleDesc").value.trim();
        const roleStatus = document.getElementById("modalRoleStatus").value.trim();
        if (!roleName) {
          showToast("Role Name tidak boleh kosong!", "danger");
          return;
      }
      if (!roleStatus) {
          showToast("Status tidak boleh kosong!", "danger");
          return;
      }
        const requestBody = {
            rolename: roleName,
            desc: roleDesc,
            status: roleStatus,
        };

        try {
            const response = await NetworkHelper.post(ENDPOINTS.ROLES.ADD_ROLES, requestBody);

            if (response.message === "Role created successfully") {
                showToast("Role added successfully!", "success");
                addRoleModal.hide();
                fetchRoles(currentPage); // Refresh tabel pada halaman saat ini
            } else {
                console.error("Failed to add role:", response.message);
                showToast("Gagal menambahkan role, coba lagi.", "danger");
            }
        } catch (error) {
            console.error("Error adding role:", error);
            showToast("Terjadi kesalahan saat menambahkan role.", "danger");
        }
    }

    /**
     * Fungsi untuk menampilkan toast notifikasi
     * @param {string} message - Pesan yang akan ditampilkan
     * @param {string} type - Jenis toast: success, danger, warning
     */
    function showToast(message, type) {
        const toastEl = document.getElementById("toastSuccess");
        const toastBody = document.getElementById("toastMessage");

        if (!toastEl || !toastBody) {
            console.error("Toast elements are not found.");
            return;
        }

        toastEl.classList.remove("text-bg-success", "text-bg-danger", "text-bg-warning");
        toastEl.classList.add(`text-bg-${type}`);
        toastBody.textContent = message;

        const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
        toast.show();
    }

    // Event listeners
    addNewRecordBtn.addEventListener("click", () => {
        resetForm();
        addRoleModal.show();
    });

    editUserForm.addEventListener("submit", handleAddRole);

    // Fetch roles saat init dipanggil
    fetchRoles(currentPage);
}
