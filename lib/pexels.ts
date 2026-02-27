import axios from 'axios';

export const getDestinationImage = async (placeName: string) => {
    try {
        const response = await axios.get(`https://api.pexels.com/v1/search?query=${placeName}&per_page=1`, {
            headers: {
                Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY
            }
        });
        return response.data.photos[0]?.src?.large || null;
    } catch (error) {
        console.error("Pexels Error:", error);
        return null;
    }
};