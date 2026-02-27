"use client";

import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

export function PopularCityList() {
    const cards = data.map((card, index) => (
        <Card key={card.src} card={card} index={index} />
    ));

    return (
        <div className="w-full h-full py-20">
            <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-3xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
                Popular Destinations To Visit ✈️
            </h2>
            <Carousel items={cards} />
        </div>
    );
}

// 1. Created a dynamic component to replace DummyContent
const CityContent = ({ 
    description, 
    highlights, 
    imageSrc 
}: { 
    description: string, 
    highlights: string[], 
    imageSrc: string 
}) => {
    return (
        <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
            <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto mb-6">
                <span className="font-bold text-neutral-700 dark:text-neutral-200">
                    {description}
                </span>
            </p>
            
            <div className="max-w-3xl mx-auto mb-8">
                <h3 className="font-bold text-neutral-700 dark:text-neutral-200 text-lg mb-2">Top Things To Do:</h3>
                <ul className="list-disc list-inside text-neutral-600 dark:text-neutral-400 text-base md:text-lg">
                    {highlights.map((item, index) => (
                        <li key={index} className="mb-1">{item}</li>
                    ))}
                </ul>
            </div>

            <img
                src={imageSrc}
                alt="City Highlight"
                height="500"
                width="500"
                className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-cover rounded-xl shadow-md"
            />
        </div>
    );
};

// 2. Filled the data array with real travel content
const data = [
    {
        category: "Paris, France",
        title: "Explore the City of Lights – Eiffel Tower, Louvre & more",
        src: "/paris.jpg",
        content: <CityContent 
            description="Experience the romance and art of Paris. From world-class museums to charming street cafes, the French capital is an unforgettable masterpiece."
            highlights={["Marvel at the iconic Eiffel Tower", "See the Mona Lisa at the Louvre", "Stroll along the Seine River", "Enjoy fresh croissants at a local patisserie"]}
            imageSrc="/paris.jpg"
        />,
    },
    {
        category: "New York, USA",
        title: "Experience NYC – Times Square, Central Park, Broadway",
        src: "/newyork.jpg",
        content: <CityContent 
            description="The city that never sleeps offers boundless energy. Explore diverse neighborhoods, iconic skylines, and world-renowned entertainment."
            highlights={["Catch a breathtaking view from the Empire State Building", "Walk the High Line", "Watch a Broadway musical", "Relax in Central Park"]}
            imageSrc="/newyork.jpg"
        />,
    },
    {
        category: "Tokyo, Japan",
        title: "Discover Tokyo – Shibuya, Cherry Blossoms, Temples",
        src: "/tokyo.jpg",
        content: <CityContent 
            description="A mesmerizing blend of neon-lit modernism and ancient traditions. Tokyo offers incredible street food, serene gardens, and cutting-edge technology."
            highlights={["Cross the famous Shibuya Scramble", "Visit the historic Senso-ji Temple", "Experience the nightlife in Shinjuku", "Eat authentic sushi at Tsukiji Outer Market"]}
            imageSrc="/tokyo.jpg"
        />,
    },
    {
        category: "Rome, Italy",
        title: "Walk through History – Colosseum, Vatican, Roman Forum",
        src: "/rome.jpg",
        content: <CityContent 
            description="Step back in time in the Eternal City. Rome is a sprawling museum of ancient ruins, Renaissance art, and incredible culinary delights."
            highlights={["Tour the ancient Colosseum", "Toss a coin into the Trevi Fountain", "Marvel at the Sistine Chapel in Vatican City", "Indulge in authentic gelato and pasta"]}
            imageSrc="/rome.jpg"
        />,
    },
    {
        category: "Dubai, UAE",
        title: "Luxury and Innovation – Burj Khalifa, Desert Safari",
        src: "/uae.jpg",
        content: <CityContent 
            description="A futuristic oasis rising from the desert. Dubai is known for its ultra-modern architecture, luxury shopping, and thrilling adventures."
            highlights={["Look down from the Burj Khalifa", "Shop at the massive Dubai Mall", "Go dune bashing on a desert safari", "Visit the artificial Palm Jumeirah"]}
            imageSrc="/uae.jpg"
        />,
    },
    {
        category: "Lahore, Pakistan",
        title: "Badshahi Mosque – A Symbol of Mughal Grandeur in Lahore",
        src: "/badshahi.jpg", 
        content: <CityContent 
            description="The cultural heart of Pakistan. Lahore is famous for its rich Mughal history, vibrant festivals, and arguably the best food in the country."
            highlights={["Explore the magnificent Badshahi Mosque", "Walk through the historic Lahore Fort", "Experience the electric atmosphere of Food Street", "Watch the Wagah Border flag ceremony"]}
            imageSrc="/badshahi.jpg"
        />,
    },
];