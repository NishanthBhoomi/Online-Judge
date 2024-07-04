import axios from 'axios';  

const API_URL = 'http://localhost:8000';

const instance = axios.create({
    baseURL: API_URL,
});

export const getProblems = async() =>{
    try {
        const token = localStorage.getItem('token');
        const response = await instance.get('/problems', {
            headers: {
                Authorization: `Bearer ${token}` 
            }
        });
        return response.data;
    } catch (error) {
        console.log("Error while fetching problems ", error);
    }
};  