import React, { useEffect, useRef, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { userTripDetail } from '@/app/provider'; // Ensure this path is correct

function GlobalMap({ coordinates }: { coordinates?: number[] }) {

    //@ts-ignore
    const { tripDetailInfo, setTripDetailInfo } = userTripDetail();

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        const token = process?.env?.NEXT_PUBLIC_MAPBOX_API_KEY;
        if (token) mapboxgl.accessToken = token;

        const map = new mapboxgl.Map({
            container: mapContainerRef?.current ?? '',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-74.5, 40],
            zoom: 1.7,
            projection: { name: 'globe' } as any
        });

        mapRef.current = map;

        // --- Rotation Logic (Keep existing logic) ---
        const secondsPerRevolution = 120;
        const maxSpinZoom = 5;
        const slowSpinZoom = 3;
        let userInteracting = false;
        let spinEnabled = true;

        function spinGlobe() {
            const zoom = map.getZoom();
            if (spinEnabled && !userInteracting && zoom < maxSpinZoom && (!coordinates || coordinates.length === 0)) {
                let distancePerSecond = 360 / secondsPerRevolution;
                if (zoom > slowSpinZoom) {
                    const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
                    distancePerSecond *= zoomDif;
                }
                const center = map.getCenter();
                center.lng -= distancePerSecond;
                map.easeTo({ center, duration: 1000, easing: (n) => n });
            }
        }

        // --- Event Listeners ---
        map.on('mousedown', () => { userInteracting = true; });
        map.on('dragstart', () => { userInteracting = true; });
        map.on('mouseenter', () => { userInteracting = true; });
        map.on('mouseup', () => { userInteracting = false; spinGlobe(); });
        map.on('mouseleave', () => { userInteracting = false; spinGlobe(); });
        map.on('touchend', () => { userInteracting = false; spinGlobe(); });
        map.on('moveend', () => { spinGlobe(); });

        spinGlobe();

        // --- NEW: MARKER LOGIC STARTS HERE ---
        if (coordinates && coordinates.length > 0) {

            // 1. Fly to the destination
            map.flyTo({
                center: [coordinates[0], coordinates[1]],
                zoom: 10,
                essential: true
            })

            // 2. Add Hotel Markers (Red)
            if (tripDetailInfo?.hotels) {
                tripDetailInfo.hotels.forEach((hotel: any) => {
                    new mapboxgl.Marker({ color: '#ff0000' }) // Red Color
                        .setLngLat([hotel.geo_coordinates.longitude, hotel.geo_coordinates.latitude])
                        .setPopup(new mapboxgl.Popup({ offset: 25 }) // Add Popup
                            .setHTML(`
                            <div>
                                <h3 style="font-weight:bold; font-size:14px;">${hotel.hotel_name}</h3>
                                <p style="font-size:12px; color:gray;">Hotel Price: ${hotel.price_per_night}</p>
                            </div>
                        `))
                        .addTo(map);
                });
            }

            // 3. Add Activity Markers (Blue/Cyan)
            if (tripDetailInfo?.itinerary) {
                tripDetailInfo.itinerary.forEach((day: any) => {
                    day.activities.forEach((activity: any) => {
                        new mapboxgl.Marker({ color: '#0088ff', scale: 0.8 }) // Blue, slightly smaller
                            .setLngLat([activity.geo_coordinates.longitude, activity.geo_coordinates.latitude])
                            .setPopup(new mapboxgl.Popup({ offset: 25 })
                                .setHTML(`
                                <div>
                                    <h3 style="font-weight:bold; font-size:14px;">${activity.place_name}</h3>
                                    <p style="font-size:12px; color:gray;">${activity.place_details}</p>
                                </div>
                            `))
                            .addTo(map);
                    });
                });
            }
        }
        // --- MARKER LOGIC ENDS HERE ---

        return () => {
            map.remove();
        }
    }, [coordinates, tripDetailInfo]) // Added tripDetailInfo to dependency array

    return (
        <div>
            <div ref={mapContainerRef}
                style={{
                    width: '95%',
                    height: '85vh',
                    borderRadius: 20
                }}>
            </div>
        </div>
    )
}

export default GlobalMap