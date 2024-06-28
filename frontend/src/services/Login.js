import axios from "axios";

const API_URL = "http://localhost:8000";

export const loginData = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/login`, data);
    return response.data;
  } catch (error) {
    console.log("Error while sending login data ", error);
    return { success: false, message: error.message };
  }
};
