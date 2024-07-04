import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const RunCode = async (payload) =>{
    try{
        const response = await axios.post('http://localhost:8000/run', payload,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }
    catch(error){
        console.log("Error while running code ", error);
        return error;
    }
};