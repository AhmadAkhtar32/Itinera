import axios from 'axios';

/**
 * Fetches a high-quality travel image from Pexels
 * @param cityName - The name of the destination (e.g., "Lahore" or "Hunza Valley")
 */
export const getDestinationImage = async (cityName: string) => {
    try {
        const response = await axios.get(`https://api.pexels.com/v1/search`, {
            params: {
                query: `${cityName} landscape`, // 'landscape' helps get better travel shots
                per_page: 1,
            },
            headers: {
                Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY as string,
            },
        });

        // Pexels returns a 'photos' array. We'll take the 'large' or 'landscape' URL.
        const imageUrl = response.data.photos[0]?.src?.large || '/fallback-travel.jpg';
        return imageUrl;
    } catch (error) {
        console.error("Pexels API Error:", error);
        return '/fallback-travel.jpg'; // Path to a default image in your public folder
    }
};