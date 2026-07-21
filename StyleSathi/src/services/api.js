// Change this from dummy to real backend
const API_URL = 'http://localhost:3000/api';

export const fetchJustForYou = async () => {
    try {
        const response = await fetch(`${API_URL}/products/just-for-you`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, data: [], error: error.message };
    }
};