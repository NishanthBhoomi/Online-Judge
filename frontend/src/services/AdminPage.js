import axios from 'axios';

const API_URL = "http://localhost:8000";

export const AdminPage=async()=>{
    try {
        const response= await axios.get(`${API_URL}/admin`);
        return response;
    } catch (error) {
        console.log("Error while uploading admin home page",error);
    }
}