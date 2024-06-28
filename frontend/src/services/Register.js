import axios from "axios";

const API_URL = "http://localhost:8000";

export const regData = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/register`, data);
    return response.data;
  } catch (error) {
    console.log("Error while uploading register data ", error);
    return { success: false, message: error.message };
  }
};
