import axios from "axios";

const HOST = "http://192.168.2.21:8000"
export const endpoints = {
    'register': '/users/',
    'login': '/o/token/',
    'current-user': '/users/current-user/',
    'categories': '/categories/',
    'jobs': '/jobs/',
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