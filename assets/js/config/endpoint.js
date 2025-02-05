// assets/js/endpoints.js
export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        SEND_VERIFICATION_EMAIL: '/api/auth/send-verification-email',
        VERIFY_EMAIL_CODE: '/api/auth/verify-email-code',
        RESET_PASSWORD: '/api/auth/reset-password',
    },
    USER: {
        PROFILE: '/api/user/profile',
        CREATE_USER: '/api/users',
        UPDATE_PROFILE: '/api/user/update-profile',
        GET_ALL_USERS: '/api/user/all'
    },
    METRICS: {
        GET_ALL: '/api/metrics',  
    },
    MENU: {
        GET_ALL: '/api/menus' 
    },
    ROLES: {
        GET_ROLES: '/api/roles', 
        ADD_ROLES: '/api/roles-add', 
        GET_ALLMENUS: '/api/roles/getAllRoleMenus'
    },

    KELAS: {
            GET_KELAS: "/api/kelas",
            ADD_KELAS: "/api/kelas",
            UPDATE_KELAS: (id) => `/api/kelas/${id}`,
            DELETE_KELAS: (id) => `/api/kelas/${id}`,
    },
    

    MATA_PELAJARAN: {
        GET_MATA_PELAJARAN: "/api/mataPelajaran",
        ADD_MATA_PELAJARAN: "/api/mataPelajaran",
        UPDATE_MATA_PELAJARAN: (id) => `/api/mataPelajaran/${id}`,
        DELETE_MATA_PELAJARAN: (id) => `/api/mataPelajaran/${id}`,
    },
    TEACHERS: {
        GET_TEACHERS: '/api/teachers',
        GET_WALI_KELAS: '/api/wali-kelas',

        GET_TEACHERS_BYID: (id) => `/api/teachers/${id}`,
        UPDATE_TEACHERS: (id) => `/api/teachers/${id}`,
        DELETE_TEACHERS: (id) => `/api/teachers/${id}`,
    },
    USERS: {
        GET_ALL: '/api/users',
        CREATE: '/api/users',
        CHANGE_PASSWORD: (id) => `/api/users/password/${id}`,
    },
    STUDENTS: {
        GET_STUDENTS: '/api/students',
        CREATE_STUDENTS: '/api/students'
    },
    
  

    SEMESTER: {
            LIST: '/api/semester/list',
            ADD: '/api/semester',
            GET_BY_ID: '/api/semester',
            UPDATE: (id) => `/api/semester/${id}`,
            DELETE: (id) => `/api/semester/${id}`,
    },

    JADWAL_PELAJARAN: {
        ADD: '/api/jadwalPelajaran',
        GET_LIST: '/api/jadwalPelajaran',
        GET_BY_ID: (id) => `/api/jadwalPelajaran/${id}`,
        UPDATE: (id) => `/api/jadwalPelajaran/${id}`,
        DELETE: (id) => `/api/jadwalPelajaran/${id}`,
    },


    KEHADIRAN: {
        ADD: '/api/kehadiran',
        GET_LIST: '/api/kehadiran',
        GET_BY_ID: (id) => `/api/kehadiran/${id}`,
        UPDATE: (id) => `/api/kehadiran/${id}`,
        DELETE: (id) => `/api/kehadiran/${id}`,
    },
    STUDENT_CLASSES: {
        CREATE: '/api/student-classes',
        GET_BY_CLASS: '/api/student-classes',
        REMOVE: '/api/student-classes',
        BULK: '/api/student-classes/bulk',
        ATTENDANCE: '/api/absensi',
        GET_BY_CLASS_TEACHERS: '/api/student-classes-teachers',

    },
    SCHOOL_ANNOUNCEMENTS: {
        GET_ALL: '/api/announcements', // Mendapatkan semua pengumuman
        CREATE: '/api/announcements', // Membuat pengumuman baru
        GET_BY_ID: (id) => `/api/announcements/${id}`, // Mendapatkan pengumuman berdasarkan ID
        UPDATE: (id) => `/api/announcements/${id}`, // Memperbarui pengumuman berdasarkan ID
        DELETE: (id) => `/api/announcements/${id}`, // Menghapus pengumuman berdasarkan ID
    },


    // GURU
    JADWAL_PELAJARAN_GURU: {
        GET_LIST: '/api/jadwalPelajaranGuru',
        GET_BY_ID: (id) => `/api/jadwalPelajaran/${id}`,
        UPDATE: (id) => `/api/jadwalPelajaran/${id}`,
        DELETE: (id) => `/api/jadwalPelajaran/${id}`,
    },

    STUDENT_CLASSES_GURU: {
        CREATE: '/api/student-classes',
        GET_BY_CLASS: '/api/student-classes',
        REMOVE: '/api/student-classes',
        BULK: '/api/student-classes/bulk'
    },

    PPDB_JALUR_PERIODE: {
        GET_LIST: '/api/ppdb-jalur-periode', // Mendapatkan semua data jalur periode dengan pagination
        CREATE: '/api/ppdb-jalur-periode', // Membuat jalur periode baru
        GET_BY_ID: (id) => `/api/ppdb-jalur-periode/${id}`,
        UPDATE: (id) => `/api/ppdb-jalur-periode/${id}`,
        DELETE: (id) => `/api/ppdb-jalur-periode/${id}`,

    },

    PERSYARATAN_NILAI: {
        GET_LIST: '/api/grade-requirements', // Mendapatkan semua persyaratan nilai
        CREATE: '/api/grade-requirements', // Membuat persyaratan nilai baru
        GET_BY_ID: (id) => `/api/grade-requirements/${id}`, // Mendapatkan persyaratan nilai berdasarkan ID
        UPDATE: (id) => `/api/grade-requirements/${id}`, // Memperbarui persyaratan nilai berdasarkan ID
        DELETE: (id) => `/api/grade-requirements/${id}`, // Menghapus persyaratan nilai berdasarkan ID
    },

    STUDENT_REGISTRATIONS: {
        GET_BY_JALUR: (jalurPeriodeId) => `/api/students-registrations/jalur/${jalurPeriodeId}`,
        CREATE: '/api/student-registrations',
        UPDATE_STATUS: (id) => `/api/student-registrations/status/${id}`,
        GET_BY_ID : (id) => `/api/student-registrations/${id}`,
        UPDATE: (id) => `/api/student-registrations/${id}`,
    },
    
    FORM_STATUS: {
        GET_BY_STUDENT_ID : (studentRegistrationId) => `/api/form-status/student/${studentRegistrationId}`,
        GET_BY_STUDENT_DETAILS_ID : (studentRegistrationId) => `/api/form-status/student/details/${studentRegistrationId}`,

    },

    STUDENT_PARENTS: {
        GET_BY_STUDENT_ID : (studentRegistrationId) => `/api/student-parents/student/${studentRegistrationId}`,
        CREATE: '/api/student-parents',
        UPDATE_BY_ID: (id) => `/api/student-parents/${id}`,
        UPDATE_BY_STUDENT_ID : (studentRegistrationId) => `/api/student-parents/student/${studentRegistrationId}`,

        NEWCREATE: '/api/student-parents',

    },
    GRADE_REQUIREMENTS:{
        GET_BY_JALUR_ID : (jalurId) => `/api/grade-requirements/jalur/${jalurId}`,
    },
    STUDENT_GRADES: {
        CREATE: '/api/student-grades', // Untuk membuat nilai baru
        GET_ALL: '/api/student-grades', // Mendapatkan semua nilai
        GET_BY_ID: (id) => `/api/student-grades/${id}`, // Mendapatkan nilai berdasarkan ID
        UPDATE_BY_ID: (id) => `/api/student-grades/${id}`, // Memperbarui nilai berdasarkan ID
        DELETE_BY_ID: (id) => `/api/student-grades/${id}`, // Menghapus nilai berdasarkan ID
        GET_BY_STUDENT_REGISTRATION_ID: (studentRegistrationId) => `/api/student-grades/student/${studentRegistrationId}`, // Mendapatkan nilai berdasarkan student_registration_id
        UPSERT_BY_STUDENT_REGISTRATION_ID: (studentRegistrationId) => `/api/student-grades/student/${studentRegistrationId}`, // Upsert nilai berdasarkan student_registration_id
    },

 
};
