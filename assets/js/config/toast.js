/**
 * Fungsi untuk menampilkan Toast
 * @param {string} message - Pesan yang akan ditampilkan
 * @param {string} type - Jenis toast: success, danger, warning
 */
export function showToast(message, type) {
    const toastEl = document.getElementById('toastSuccess');
    const toastBody = document.getElementById('toastMessage');

    // Validasi elemen toast
    if (!toastEl || !toastBody) {
        console.error('Toast elements are not found in the DOM.');
        return;
    }

    // Atur tipe warna toast
    toastEl.classList.remove('text-bg-success', 'text-bg-danger', 'text-bg-warning', 'text-bg-info');
    toastEl.classList.add(`text-bg-${type}`);

    // Atur pesan toast
    toastBody.textContent = message;

    // Tampilkan toast
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}
