import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

export const getDestinationImage = async (query: string) => {
    try {
        const res = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=1`, {
            headers: {
                Authorization: API_KEY
            }
        });
        return res.data.photos[0]?.src?.large || '/assets/images/placeholder.png';
    } catch (error) {
        console.error("Pexels Fetch Error:", error);
        return '/assets/images/placeholder.png';
    }
};