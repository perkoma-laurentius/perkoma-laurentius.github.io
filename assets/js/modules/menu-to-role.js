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
                page: page, // Halaman saat ini
                size: 10    // Jumlah data per halaman
            };
    
            const response = await NetworkHelper.post(ENDPOINTS.ROLES.GET_ALLMENUS, requestBody);
    
            // Periksa respons dari API
            if (response && response.pagination && response.items) {
                const { items, pagination } = response;
    
                renderTable(items); // Render data ke tabel
                renderPagination(pagination); // Render navigasi pagination
            } else {
                console.error("Invalid response structure:", response);
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
                    <td>${role.role_id}</td>
                    <td>${role.menu_id}</td>
                    <td>${role.parent_id}</td>
                    <td>
                        <span class="badge bg-label-${role.status === 1 ? "success" : "danger"}">
                            ${role.status === 1 ? "Active" : "Inactive"}
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

    
    // Fetch roles saat init dipanggil
    fetchRoles(currentPage);



    
}
