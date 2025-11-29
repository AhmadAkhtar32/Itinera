"use client";
import { Button } from '@/components/ui/button';
import { Timeline } from '@/components/ui/timeline';
import { Clock, ExternalLink, Star, Ticket, Wallet } from 'lucide-react';
import React from 'react'


const TRIP_DATA = {

    "destination": "Paris",
    "duration": "5 Days",
    "origin": "Lahore",
    "budget": "Luxury",
    "group_size": "Solo",
    "hotels": [
        {
            "hotel_name": "Shangri-La Hotel, Paris",
            "hotel_address": "10 Avenue d'Iéna, 75116 Paris, France",
            "price_per_night": "$1,200",
            "hotel_image_url": "https://www.shangri-la.com/-/media/Images/Hotels/SHANGRI-LA/hotel-shangri-la-paris-exterior.jpg",
            "geo_coordinates": {
                "latitude": 48.861992,
                "longitude": 2.29806
            },
            "rating": 9.5,
            "description": "A luxurious hotel with stunning views of the Eiffel Tower, offering world-class amenities, a spa, and fine dining."
        },
        {
            "hotel_name": "Hotel Plaza Athénée",
            "hotel_address": "25 Avenue Montaigne, 75008 Paris, France",
            "price_per_night": "$1,000",
            "hotel_image_url": "https://www.dorchestercollection.com/media/1088/plaza-athenee-exterior.jpg",
            "geo_coordinates": {
                "latitude": 48.86544,
                "longitude": 2.3042
            },
            "rating": 9.4,
            "description": "An iconic luxury hotel located on the prestigious Avenue Montaigne, known for its elegance and exceptional service."
        },
        {
            "hotel_name": "Le Meurice",
            "hotel_address": "228 Rue de Rivoli, 75001 Paris, France",
            "price_per_night": "$950",
            "hotel_image_url": "https://www.dorchestercollection.com/media/1083/le-meurice-exterior.jpg",
            "geo_coordinates": {
                "latitude": 48.865064,
                "longitude": 2.32814
            },
            "rating": 9.3,
            "description": "A luxury hotel blending classic French elegance with modern comfort, situated near the Louvre."
        }
    ],
    "itinerary": [
        {
            "day": 1,
            "day_plan": "Arrive in Paris, check into the hotel, and relax.",
            "best_time_to_visit_day": "Morning",
            "activities": [
                {
                    "place_name": "Eiffel Tower",
                    "place_details": "The iconic symbol of Paris offering breathtaking views.",
                    "place_image_url": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Tour_Eiffel_Wikimedia_Commons.jpg",
                    "geo_coordinates": {
                        "latitude": 48.85837,
                        "longitude": 2.294481
                    },
                    "place_address": "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
                    "ticket_pricing": "$30",
                    "time_travel_each_location": "30 min from hotel",
                    "best_time_to_visit": "Late Afternoon"
                }
            ]
        },
        {
            "day": 2,
            "day_plan": "Explore the Louvre Museum and Montmartre.",
            "best_time_to_visit_day": "Morning",
            "activities": [
                {
                    "place_name": "Louvre Museum",
                    "place_details": "The world's largest art museum and a historic monument.",
                    "place_image_url": "https://upload.wikimedia.org/wikipedia/commons/2/2c/Louvre_Museum_%28cropped%29.jpg",
                    "geo_coordinates": {
                        "latitude": 48.860611,
                        "longitude": 2.337644
                    },
                    "place_address": "Rue de Rivoli, 75001 Paris, France",
                    "ticket_pricing": "$17",
                    "time_travel_each_location": "15 min from hotel",
                    "best_time_to_visit": "Morning"
                },
                {
                    "place_name": "Montmartre",
                    "place_details": "A historic district known for its artistic history and the Sacré-Cœur.",
                    "place_image_url": "https://upload.wikimedia.org/wikipedia/commons/5/5d/Montmartre_Basilica.jpg",
                    "geo_coordinates": {
                        "latitude": 48.8867,
                        "longitude": 2.3431
                    },
                    "place_address": "75018 Paris, France",
                    "ticket_pricing": "Free",
                    "time_travel_each_location": "30 min from Louvre",
                    "best_time_to_visit": "Afternoon"
                }
            ]
        },
        {
            "day": 3,
            "day_plan": "Day trip to Disneyland Paris.",
            "best_time_to_visit_day": "All Day",
            "activities": [
                {
                    "place_name": "Disneyland Paris",
                    "place_details": "A magical theme park filled with attractions and entertainment.",
                    "place_image_url": "https://upload.wikimedia.org/wikipedia/commons/0/0f/Disneyland_Paris_Castle.jpg",
                    "geo_coordinates": {
                        "latitude": 48.8671,
                        "longitude": 2.7812
                    },
                    "place_address": "77700 Marne-la-Vallée, France",
                    "ticket_pricing": "$85",
                    "time_travel_each_location": "1 hour from hotel",
                    "best_time_to_visit": "Morning"
                }
            ]
        },
        {
            "day": 4,
            "day_plan": "Visit the Palace of Versailles.",
            "best_time_to_visit_day": "Morning",
            "activities": [
                {
                    "place_name": "Palace of Versailles",
                    "place_details": "A symbol of the absolute monarchy of the Ancien Régime.",
                    "place_image_url": "https://upload.wikimedia.org/wikipedia/commons/5/54/Chateau_de_Versailles%2C_Paris%2C_France_%282%29.jpg",
                    "geo_coordinates": {
                        "latitude": 48.8049,
                        "longitude": 2.1204
                    },
                    "place_address": "Place d'Armes, 78000 Versailles, France",
                    "ticket_pricing": "$30",
                    "time_travel_each_location": "45 min from hotel",
                    "best_time_to_visit": "Morning"
                }
            ]
        },
        {
            "day": 5,
            "day_plan": "Shopping at Champs-Élysées and Departure.",
            "best_time_to_visit_day": "Afternoon",
            "activities": [
                {
                    "place_name": "Champs-Élysées",
                    "place_details": "Famous avenue known for shopping and cafes.",
                    "place_image_url": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Champs-%C3%89lys%C3%A9es%2C_Paris_-_2022.jpg",
                    "geo_coordinates": {
                        "latitude": 48.8698,
                        "longitude": 2.3073
                    },
                    "place_address": "75008 Paris, France",
                    "ticket_pricing": "Free",
                    "time_travel_each_location": "20 min from hotel",
                    "best_time_to_visit": "Afternoon"
                }
            ]
        }
    ]
}


function Itinerary() {
    const data = [
        {
            title: "Recommended Hotels",
            content: (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {TRIP_DATA?.hotels.map((hotel, index) =>
                    (
                        <div key={index} className='flex flex-col gap-1'>
                            <img src={'/assets/images/placeholder.png'} alt='place-image' width={400} height={200}
                                className='rounded-xl shadow object-cover mb-2' />
                            <h2 className='font-semibold text-lg'>{hotel?.hotel_name}</h2>
                            <h2 className='text-gray-500 '>{hotel.hotel_address}</h2>
                            <div className='flex justify-between items-center'>
                                <p className='flex gap-2 text-green-600'> <Wallet /> {hotel.price_per_night} </p>
                                <p className='flex gap-2 text-yellow-500'> <Star /> {hotel.rating} </p>
                            </div>
                            <Button
                                variant="outline"
                                className="border-primary text-primary hover:bg-primary hover:text-white mt-1"
                            >
                                View
                            </Button>
                            {/* <p className='line-clamp-2 text-gray-500'>{hotel?.description}</p> */}
                        </div>
                    ))}
                </div>
            ),
        },
        ...TRIP_DATA?.itinerary.map((dayData) => ({
            title: `Day ${dayData?.day}`,
            content: (
                <div>
                    <p>Best Time :{dayData?.best_time_to_visit_day}</p>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {dayData?.activities.map((activity, index) => (
                            <div key={index}>
                                <img src={'/assets/images/placeholder.png'} width={400} height={200} alt={activity.place_name}
                                    className='object-cover rounded-xl'
                                />
                                <h2 className='font-semibold text-lg'>{activity?.place_name}</h2>
                                <p className='text-gray-500 line-clamp-2'>{activity?.place_details}</p>
                                <h2 className='flex gap-2 text-blue-500 line-clamp-1'>
                                    <Ticket /> {activity?.ticket_pricing}
                                </h2>
                                <p className='flex gap-2 text-orange-400 line-clamp-1'>
                                    <Clock /> {activity?.best_time_to_visit}
                                </p>
                                <Button size={'sm'} variant="outline"
                                    className="border-primary text-primary hover:bg-primary hover:text-white mt-1">
                                    View 🔗<ExternalLink />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }))
    ];
    return (
        <div className="relative w-full h-[80vh] overflow-auto">
            <Timeline data={data} tripData={TRIP_DATA} />
        </div>
    );
}

export default Itinerary