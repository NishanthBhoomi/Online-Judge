import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const getAllUsers = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/all`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;       
    } catch (error) {
        console.log("Error loading admin page ", error);
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/delete/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;       
    } catch (error) {
        console.log("Error deleting user ", error);
    }
};

export const updateUser = async (id, data) => {
    try{
        const response = await axios.put(`${API_URL}/update/${id}`, data,
            {
            headers:{
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }
    catch(error){
        console.log("Error updating user ", error);
    }
};