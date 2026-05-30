import axios from "axios";

<<<<<<< Updated upstream
const HOST = "http://192.168.88.16:8000"
=======
const HOST = "http://192.168.2.14:8000"
>>>>>>> Stashed changes
export const endpoints = {
    'register': '/users/',
    'login': '/o/token/',
    'current-user': '/users/current-user/',
    'companies': '/companies/',
    'current-company': '/companies/current-company/',
    'categories': '/categories/',
    'skills': '/skills/',
    'jobs': '/jobs/',
    'apply-job': '/applications/',
    'save-job': (jobId) => `/jobs/${jobId}/save/`,
    'delete-job': (jobId) => `/jobs/${jobId}/`,
    'compare-jobs': '/jobs/compare/',
    'company-details': (id) => `/companies/${id}/`, 
    'approve-company': (id) => `/companies/${id}/approve/`,
    'employer-jobs': '/jobs/', 
    'applications': '/applications/',
    'review-application': (id) => `/applications/${id}/review/`,
    'employer-stats': '/stats/employer-stats/',
    'momo-payment': '/payments/create-momo-order/'
};

export const authApis = (token) => {
    return axios.create({
        baseURL: HOST,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export default axios.create({
    baseURL: HOST
})