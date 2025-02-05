const { jsPDF } = window.jspdf;

/**
 * Generates and downloads a PDF formatted like a registration form for students.
 * @param {object} data - The student details data fetched from the API.
 */
export function generatePDF(data) {
    const { student, parents, grades } = data;

    // Initialize jsPDF
    const doc = new jsPDF('p', 'mm', 'a4');

    // Header
    doc.setFillColor(0, 122, 204); // Header background color
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Formulir Pendaftaran Siswa Baru', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(220, 220, 220);

    // Section: Data Siswa
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 122, 204);
    doc.text('Data Siswa', 10, 40);

    // Data Siswa Table
    const studentDetails = [
        ['Nama Lengkap', student.nama_lengkap],
        ['NIS', student.nis],
        ['NIK', student.nik],
        ['Jenis Kelamin', student.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'],
        ['Tempat/Tanggal Lahir', `${student.tempat_lahir}, ${student.tanggal_lahir}`],
        ['Agama', student.agama],
        ['Golongan Darah', student.golongan_darah],
        ['Tinggi Badan', `${student.tinggi_badan || '-'} cm`],
        ['Berat Badan', `${student.berat_badan || '-'} kg`],
        ['Status Keluarga', student.status_keluarga],
        ['Anak Ke', `${student.anak_ke} dari ${student.jumlah_saudara || 0} bersaudara`],
        ['Riwayat Penyakit', student.riwayat_penyakit || 'Tidak ada'],
        ['Hobi', student.hobi || '-'],
        ['Prestasi', student.prestasi || '-'],
        ['Alamat Lengkap', student.alamat_lengkap],
        ['Dusun', student.dusun || '-'],
        ['RT/RW', `${student.rt || '-'} / ${student.rw || '-'}`],
        ['Desa', student.desa || '-'],
        ['Kecamatan', student.kecamatan],
        ['Kabupaten', student.kabupaten],
        ['Provinsi', student.provinsi],
        ['Mode Transportasi', student.mode_transportasi],
        ['Status Pendaftaran', student.status_pendaftaran]
    ];

    let y = 45;
    studentDetails.forEach(([key, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text(key, 10, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(value || '-', 80, y);
        y += 8;
        if (y > 270) {
            doc.addPage();
            y = 10;
        }
    });

    // Section: Data Orang Tua/Wali
    doc.addPage();
    y = 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 122, 204);
    doc.text('Data Orang Tua/Wali', 10, y);

    // Orang Tua Table
    const parentDetails = [
        ['Nama Ayah', parents[0]?.nama_ayah || '-'],
        ['NIK Ayah', parents[0]?.nik_ayah || '-'],
        ['Pekerjaan Ayah', parents[0]?.pekerjaan_ayah || '-'],
        ['Penghasilan Ayah', parents[0]?.penghasilan_ayah || '-'],
        ['Nama Ibu', parents[0]?.nama_ibu || '-'],
        ['NIK Ibu', parents[0]?.nik_ibu || '-'],
        ['Pekerjaan Ibu', parents[0]?.pekerjaan_ibu || '-'],
        ['Penghasilan Ibu', parents[0]?.penghasilan_ibu || '-'],
        ['Nama Wali', parents[0]?.nama_wali || '-'],
        ['NIK Wali', parents[0]?.nik_wali || '-'],
        ['Pekerjaan Wali', parents[0]?.pekerjaan_wali || '-'],
        ['Penghasilan Wali', parents[0]?.penghasilan_wali || '-']
    ];

    y = 20;
    parentDetails.forEach(([key, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text(key, 10, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(value || '-', 80, y);
        y += 8;
        if (y > 270) {
            doc.addPage();
            y = 10;
        }
    });

    // Section: Data Nilai
    doc.addPage();
    y = 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 122, 204);
    doc.text('Data Nilai', 10, y);

    // Data Nilai Table
    y = 20;
    grades.forEach((grade, index) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text(`${index + 1}. ${grade.subject_name}:`, 10, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`${grade.score}`, 80, y);
        y += 8;
        if (y > 270) {
            doc.addPage();
            y = 10;
        }
    });

    // Footer with Page Number
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Halaman ${i} dari ${pageCount}`, 105, 290, { align: 'center' });
    }

    // Save PDF
    const pdfFileName = `Formulir_Pendaftaran_Siswa_${student.nama_lengkap}.pdf`;
    doc.save(pdfFileName);
}
