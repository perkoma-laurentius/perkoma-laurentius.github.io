import { NetworkHelper } from '../../config/networkHelper.js';
import { ENDPOINTS } from '../../config/endpoint.js';
import { showToast } from '../../config/toast.js';
import { navigate } from '../main.js'; // Pastikan ini adalah fungsi untuk navigasi

export function init() {
    const container = document.getElementById('jalurOptionsContainer'); // Kontainer untuk menambahkan opsi jalur
    const chooseButton = document.getElementById('chooseButton'); // Tombol "Pilih"

    // Daftar ikon untuk dipilih secara acak
    const icons = ['ti-rocket', 'ti-star', 'ti-briefcase', 'ti-lightbulb', 'ti-heart'];

    // Fungsi untuk memilih ikon secara acak
    function getRandomIcon() {
        const randomIndex = Math.floor(Math.random() * icons.length);
        return icons[randomIndex];
    }

    // Fetch data jalur dari server
    async function getJalur() {
        try {
            const response = await NetworkHelper.get(ENDPOINTS.PPDB_JALUR_PERIODE.GET_LIST); // Fetch data dari endpoint

            if (response && response.status && response.data.items) {
                const jalurItems = response.data.items;
                renderJalurOptions(jalurItems); // Render opsi jalur
            } else {
                showToast('Gagal mengambil data jalur.', 'danger');
            }
        } catch (error) {
            console.error('Error fetching jalur:', error);
            showToast('Terjadi kesalahan saat mengambil data jalur.', 'danger');
        }
    }

    // Render opsi jalur ke halaman
    function renderJalurOptions(jalurItems) {
        container.innerHTML = ''; // Bersihkan konten sebelumnya

        jalurItems.forEach((jalur, index) => {
            const optionHTML = `
                <div class="col-md mb-md-0 mb-5">
                  <div class="form-check custom-option custom-option-icon">
                    <label class="form-check-label custom-option-content" for="customRadioIcon${index}">
                      <span class="custom-option-body">
                        <i class="${getRandomIcon()}"></i>
                        <span class="custom-option-title" style="font-size: 1.25rem; font-weight: bold;">${jalur.nama_jalur}</span>
                        <p>${jalur.deskripsi}</p>
                      </span>
                      <input
                        name="customOptionRadioIcon"
                        class="form-check-input"
                        type="radio"
                        value="${jalur.id}"
                        id="customRadioIcon${index}" />
                    </label>
                  </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', optionHTML);
        });

        // Tambahkan event listener untuk setiap input radio
        document.querySelectorAll('input[name="customOptionRadioIcon"]').forEach((radio) => {
            radio.addEventListener('change', () => {
                chooseButton.style.display = 'block'; // Tampilkan tombol "Pilih"
            });
        });
    }

    // Inisialisasi fungsi getJalur
    getJalur();

    // Event listener untuk tombol "Pilih"
    chooseButton.addEventListener('click', () => {
        const selectedOption = document.querySelector('input[name="customOptionRadioIcon"]:checked');
        if (selectedOption) {
            const selectedJalurId = selectedOption.value;
            // console.log('Jalur ID terpilih:', selectedJalurId);
            localStorage.setItem('selectedJalurId', selectedJalurId);

            // Navigasi ke DASHBOARD_PPDB dengan ID jalur sebagai parameter
            navigate('DASHBOARD_PPDB', { jalurId: selectedJalurId });
        } else {
            showToast('Silakan pilih jalur terlebih dahulu.', 'warning');
        }
    });
}
