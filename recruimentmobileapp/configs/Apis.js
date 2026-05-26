import axios from "axios";

const HOST = "http://192.168.2.21:8000"
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
    'save-job': (jobId) => `/jobs/${jobId}/save/`
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