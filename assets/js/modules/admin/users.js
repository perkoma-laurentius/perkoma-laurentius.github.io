import { NetworkHelper } from '../../config/networkHelper.js';
import { ENDPOINTS } from '../../config/endpoint.js';
import { showToast } from '../../config/toast.js';

/**
 * Inisialisasi halaman Pengguna
 */
export function init() {
    const tableBody = document.getElementById("tableBody");
    const paginationContainer = document.createElement("div");
    paginationContainer.className = "d-flex justify-content-between align-items-center p-3";
    document.querySelector(".card-datatable").appendChild(paginationContainer);

    let currentPage = 1;

    /**
     * Fetch pengguna dari server dan render ke dalam tabel
     */
    async function fetchUsers(page = 1) {
        try {
            const response = await NetworkHelper.get(`${ENDPOINTS.USERS.GET_ALL}?page=${page}&size=10`);

            if (response && response.data && response.data.items) {
                const { items, pagination } = response.data;
                renderTable(items); // Render data ke tabel
                renderPagination(pagination); // Render navigasi pagination
            } else {
                console.error("Failed to fetch users:", response.message);
                showToast("Gagal mengambil data pengguna!", "danger");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            showToast("Terjadi kesalahan saat mengambil data pengguna.", "danger");
        }
    }

    /**
     * Render data pengguna ke dalam tabel
     * @param {Array} data - Data pengguna dari API
     */
    function renderTable(data) {
        tableBody.innerHTML = "";

        data.forEach((user, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${user.email || "Tidak Tersedia"}</td>
                    <td>${user.role_id === 0 ? "User Biasa" : user.role_id === 1 ? "Admin" : "Super Admin"}</td>
                    <td>${user.status ? "Aktif" : "Nonaktif"}</td>
                    <td>${user.emailVerifiedAt ? new Date(user.emailVerifiedAt).toLocaleString() : "Belum Diverifikasi"}</td>
                    <td>
                        <button class="btn btn-sm btn-primary change-password-btn" data-id="${user.id}" data-email="${user.email}">
                            Ganti Kata Sandi
                        </button>
                    </td>
                    <td>${new Date(user.created_at).toLocaleString()}</td>
                    <td>${new Date(user.updated_at).toLocaleString()}</td>
                    <td>${user.verificationCode || "-"}</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });

        document.querySelectorAll(".change-password-btn").forEach((button) => {
            button.addEventListener("click", (event) => {
                const userId = button.getAttribute("data-id");
                const userEmail = button.getAttribute("data-email");
        
                // Isi data ke dalam modal
                document.getElementById("userEmail").value = userEmail;
        
                // Simpan ID pengguna untuk digunakan nanti
                document.getElementById("changePasswordForm").setAttribute("data-id", userId);
        
                // Tampilkan modal
                const changePasswordModal = new bootstrap.Modal(document.getElementById("changePasswordModal"));
                changePasswordModal.show();
            });
        });
        
        
    }
    document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const userId = e.target.getAttribute("data-id");
        const newPassword = document.getElementById("newPassword").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();
        
        // Validasi kecocokan kata sandi baru dan konfirmasi
        if (newPassword !== confirmPassword) {
            showToast("Kata sandi tidak cocok, silakan coba lagi!", "danger");
            return;
        }
        
        try {
            const response = await NetworkHelper.put(`${ENDPOINTS.USERS.CHANGE_PASSWORD(userId)}`, {
                password: newPassword,
            });
            
            if (response.status && response.code === "SUCCESS") {
                showToast("Kata sandi berhasil diperbarui!", "success");
                
                // Reset form setelah berhasil
                document.getElementById("changePasswordForm").reset();
                
                // Tutup modal
                const changePasswordModal = bootstrap.Modal.getInstance(document.getElementById("changePasswordModal"));
                changePasswordModal.hide();
            } else {
                console.error("Failed to change password:", response.message);
                showToast("Gagal mengubah kata sandi, coba lagi.", "danger");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            showToast("Terjadi kesalahan saat mengubah kata sandi.", "danger");
        }
    });
    
    // Tambahkan event listener untuk ikon mata (toggle visibility password)
    document.querySelectorAll(".toggle-password").forEach((icon) => {
        icon.addEventListener("click", () => {
            const input = document.getElementById(icon.getAttribute("data-target"));
            const type = input.getAttribute("type") === "password" ? "text" : "password";
            input.setAttribute("type", type);
            icon.classList.toggle("ti-eye");
            icon.classList.toggle("ti-eye-off");
        });
    });
    
    

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
                fetchUsers(currentPage);
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
                fetchUsers(currentPage);
            }
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
    }

    /**
     * Tambah data pengguna baru
     */
    async function createUser() {
        const requestBody = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value.trim(),
            status: document.getElementById("status").value === "true",
            role_id: parseInt(document.getElementById("role_id").value, 10),
        };

        try {
            const response = await NetworkHelper.post(ENDPOINTS.USER.CREATE_USER, requestBody);

            if (response) {
                showToast("Pengguna berhasil ditambahkan!", "success");
                fetchUsers(); // Refresh data pengguna
                document.getElementById("editUserForm").reset(); // Reset form setelah berhasil
                const addUserModal = bootstrap.Modal.getInstance(document.getElementById("editUser"));
                addUserModal.hide();
            } else {
                console.error("Failed to add user:", response.message);
                showToast("Gagal menambahkan pengguna, coba lagi.", "danger");
            }
        } catch (error) {
            console.error("Error adding user:", error);
            showToast("Terjadi kesalahan saat menambahkan pengguna.", "danger");
        }
    }

    // Tambahkan event listener untuk tombol tambah pengguna
    const addNewRecordBtn = document.getElementById("addNewUserBtn");
    const editUserForm = document.getElementById("editUserForm");

    addNewRecordBtn.addEventListener("click", () => {
        document.getElementById("editUserForm").reset(); // Reset form sebelum digunakan
        const addUserModal = new bootstrap.Modal(document.getElementById("editUser"));
        addUserModal.show();

        editUserForm.onsubmit = async (e) => {
            e.preventDefault();
            await createUser();
        };
    });

    fetchUsers(currentPage); // Fetch data pengguna saat halaman di-load
}
