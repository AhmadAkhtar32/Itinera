import React, { useEffect, useRef, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';

// We accept a 'coordinates' prop to check if a trip exists.
// If coordinates are null/empty, we assume no trip is generated.
function GlobalMap({ coordinates }: { coordinates?: number[] }) {

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        // Access token setup
        const token = process?.env?.NEXT_PUBLIC_MAPBOX_API_KEY;
        if (token) mapboxgl.accessToken = token;

        const map = new mapboxgl.Map({
            container: mapContainerRef?.current ?? '', 
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-74.5, 40], 
            zoom: 1.7, 
            projection: { name: 'globe' } as any // Ensure globe projection is enabled
        });

        mapRef.current = map;

        // --- Rotation Logic ---
        const secondsPerRevolution = 120; // Time for one full rotation
        const maxSpinZoom = 5; // Stop spinning if zoomed in too far
        const slowSpinZoom = 3; // Slow down spinning when zooming in

        let userInteracting = false; 
        let spinEnabled = true;

        function spinGlobe() {
            const zoom = map.getZoom();
            
            // STOP spinning if:
            // 1. A trip is generated (coordinates exist)
            // 2. User is interacting/hovering
            // 3. Zoom level is too high
            if (spinEnabled && !userInteracting && zoom < maxSpinZoom && (!coordinates || coordinates.length === 0)) {
                
                let distancePerSecond = 360 / secondsPerRevolution;
                if (zoom > slowSpinZoom) {
                    const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
                    distancePerSecond *= zoomDif;
                }
                
                const center = map.getCenter();
                center.lng -= distancePerSecond; // Rotate
                
                // Smoothly animate to new center
                map.easeTo({ center, duration: 1000, easing: (n) => n });
            }
        }

        // --- Event Listeners to handle "No Hover" requirement ---
        
        // Pause rotation on interaction
        map.on('mousedown', () => { userInteracting = true; });
        map.on('dragstart', () => { userInteracting = true; });

        // Pause rotation on Hover
        map.on('mouseenter', () => { userInteracting = true; });

        // Resume rotation when Mouse Leaves or Interaction ends
        map.on('mouseup', () => { userInteracting = false; spinGlobe(); });
        map.on('mouseleave', () => { userInteracting = false; spinGlobe(); });
        map.on('touchend', () => { userInteracting = false; spinGlobe(); });

        // Loop the animation
        map.on('moveend', () => {
            spinGlobe();
        });

        // Initial trigger
        spinGlobe();

        // If coordinates exist (Trip Generated), fly to them immediately
        if(coordinates && coordinates.length > 0) {
           map.flyTo({
               center: [coordinates[0], coordinates[1]],
               zoom: 10,
               essential: true
           })
        }

        return () => {
             map.remove(); // Cleanup to prevent memory leaks
        }
    }, [coordinates]) // Re-run effect if coordinates change

    return (
        <div>
            <div ref={mapContainerRef}
                style={{
                    width: '95%', // FIXED: Typo 'widows' -> 'width'
                    height: '85vh',
                    borderRadius: 20
                }}>
            </div>
        </div>
    )
}

export default GlobalMap