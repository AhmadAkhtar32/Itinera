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
                Popular Destinations To Visit✈️
            </h2>
            <Carousel items={cards} />
        </div>
    );
}

const DummyContent = () => {
    return (
        <>
            {[...new Array(3).fill(1)].map((_, index) => {
                return (
                    <div
                        key={"dummy-content" + index}
                        className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4"
                    >
                        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
                            <span className="font-bold text-neutral-700 dark:text-neutral-200">
                                The first rule of Apple club is that you boast about Apple club.
                            </span>{" "}
                            Keep a journal, quickly jot down a grocery list, and take amazing
                            class notes. Want to convert those notes to text? No problem.
                            Langotiya jeetu ka mara hua yaar is ready to capture every
                            thought.
                        </p>
                        <img
                            src="https://assets.aceternity.com/macbook.png"
                            alt="Macbook mockup from Aceternity UI"
                            height="500"
                            width="500"
                            className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
                        />
                    </div>
                );
            })}
        </>
    );
};

const data = [
    {
        category: "Paris, France",
        title: "Explore the City of Lights – Eiffel Tower, Louvre & more",
        src: "/paris.jpg",
        content: <DummyContent />,
    },
    {
        category: "New York, USA",
        title: "Experience NYC – Times Square, Central Park, Broadway",
        src: "/newyork.jpg",
        content: <DummyContent />,
    },
    {
        category: "Tokyo, Japan",
        title: "Discover Tokyo – Shibuya, Cherry Blossoms, Temples",
        src: "/tokyo.jpg",
        content: <DummyContent />,
    },
    {
        category: "Rome, Italy",
        title: "Walk through History – Colosseum, Vatican, Roman Forum",
        src: "/rome.jpg",
        content: <DummyContent />,
    },
    {
        category: "Dubai, UAE",
        title: "Luxury and Innovation – Burj Khalifa, Desert Safari",
        src: "/uae.jpg",
        content: <DummyContent />,
    },
    {
        category: "Lahore, Pakistan",
        title: "Badshahi Mosque – A Symbol of Mughal Grandeur in Lahore",
        src: "/badshahi.jpg", // Using local image from public folder
        content: <DummyContent />, // Custom content for Badshahi Mosque
    },
];
