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
        GET_STUDENTS: '/api/peserta',
        CREATE_STUDENTS: '/api/peserta',
        GET_BY_KELOMPOK: (kelompok_id) => `/api/peserta/kelompok/${kelompok_id}`,
        BULK: '/api/peserta/bulk',
    },
    PENDAMPING: {
        GET_ALL: '/api/pendamping',
        GET_BY_ID: (id) => `/api/pendamping/${id}`,
        CREATE: '/api/pendamping',
        UPDATE: (id) => `/api/pendamping/${id}`,
        DELETE: (id) => `/api/pendamping/${id}`
    },
    
    PERTEMUAN: {
        GET_ALL: "/api/pertemuan",
        GET_BY_ID: (id) => `/api/pertemuan/${id}`,
        CREATE: "/api/pertemuan",
        UPDATE: (id) => `/api/pertemuan/${id}`,
        DELETE: (id) => `/api/pertemuan/${id}`
    },
    ABSENSI: {
        GET_ALL: "/api/absensi",
        GET_BY_ID: (id) => `/api/absensi/${id}`,
        CREATE: "/api/absensi",
        UPDATE: (id) => `/api/absensi/${id}`,
        DELETE: (id) => `/api/absensi/${id}`,
        GET_BY_KELOMPOK: (kelompok_id, page = 1, size = 5) => 
            `/api/absensi/kelompok/${kelompok_id}?page=${page}&size=${size}`
        
    },
    KELOMPOK: {

        GET_ALL: '/api/kelompok',
        GET_BY_ID: (id) => `/api/kelompok/${id}`,
        CREATE: '/api/kelompok',
        UPDATE: (id) => `/api/kelompok/${id}`,
        DELETE: (id) => `/api/kelompok/${id}`,
        GET_PESERTA_BY_KELOMPOK: (kelompok_id) => `/api/peserta/kelompok/${kelompok_id}`,
        ADD_PESERTA_TO_KELOMPOK: '/api/kelompok/add-peserta',
        REMOVE_PESERTA_FROM_KELOMPOK: (kelompokId, pesertaId) => `/api/kelompok/${kelompokId}/peserta/${pesertaId}`
    },

    BINTANG:{
        GET_ALL: '/api/bintang',
        GET_STAR_FROM_PESERTA : (id) => `/api/bintang/peserta/${id}`,
        CREATE: '/api/bintang',
        DELETE: '/api/bintang',
        GET_BY_KELOMPOK: (kelompok_id) => `/api/bintang/kelompok/${kelompok_id}`,
        BINTANG_TOP15: '/api/bintang/total',


    }
    
 
};
