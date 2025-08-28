import axios from 'axios';

// const API = axios.create({baseURL: 'http://localhost:8080/api'});
const API = axios.create({baseURL: 'https://e-commerce-app-tqs1.onrender.com/api'});

// Attach token to the request
API.interceptors.request.use((req)=>{
    const token = localStorage.getItem('token');
    if(token)
        req.headers.Authorization = `Bearer ${token}`;

    return req;
})

export default API;

