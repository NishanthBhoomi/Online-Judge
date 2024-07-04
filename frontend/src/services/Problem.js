import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const ProblemById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/problem/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;       
    } catch (error) {
        console.log("Error while fetching problem by id ", error);
    }
};