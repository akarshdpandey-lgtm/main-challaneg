import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { GoogleMap, useJsApiLoader, Marker as GoogleMarker, InfoWindow, Polyline as GooglePolyline } from '@react-google-maps/api';
import L from 'leaflet';
import { MapPin, AlertTriangle } from 'lucide-react';

interface MarkerData {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: string;
  cost?: string;
  duration?: string;
  whySpecial?: string;
}

interface MapContainerProps {
  markers?: MarkerData[];
  route?: number[][];
  center?: number[];
}

// Custom yellow dot markers matching the mockup
const createLeafletIcon = () => {
  const svgHtml = `
    <div class="flex items-center justify-center">
      <div class="w-4 h-4 rounded-full bg-[#dfb14c] border-2 border-white shadow-[0_0_8px_rgba(223,177,76,0.6)]"></div>
    </div>
  `;
  
  return L.divIcon({
    html: svgHtml,
    className: 'custom-yellow-dot',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
  });
};

// Helper component in Leaflet to auto-recenter the map when center changes
function RecenterMap({ center }: { center: number[] }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center as L.LatLngExpression, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function MapContainer({ markers = [], route = [], center = [0, 0] }: MapContainerProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const hasGoogleKey = !!apiKey;

  // Attempt to load Google Maps JS SDK
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places'] as any
  });

  const [activeGoogleMarker, setActiveGoogleMarker] = useState<MarkerData | null>(null);

  // Normalize center coordinates for Google Maps vs Leaflet
  const googleCenter = useMemo(() => {
    return { lat: parseFloat(center[0].toString()), lng: parseFloat(center[1].toString()) };
  }, [center]);

  const googleRoutePath = useMemo(() => {
    return route.map(coord => ({ lat: parseFloat(coord[0].toString()), lng: parseFloat(coord[1].toString()) }));
  }, [route]);

  // Leaflet fallback route path format
  const leafletRoutePath = useMemo(() => {
    return route.map(coord => [parseFloat(coord[0].toString()), parseFloat(coord[1].toString())]) as L.LatLngExpression[];
  }, [route]);

  // Handle fallback to Leaflet if google maps key is not provided or load fails
  const renderLeafletMap = () => {
    return (
      <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        {!hasGoogleKey && (
          <div className="absolute top-2 right-2 z-[1000] flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-800 text-[11px] text-amber-200 backdrop-blur-md">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Running in open-source Leaflet map fallback (Offline API Mode)</span>
          </div>
        )}
        <LeafletMap center={center as L.LatLngExpression} zoom={13} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {markers.map((marker, idx) => (
            <Marker
              key={idx}
              position={[parseFloat(marker.latitude.toString()), parseFloat(marker.longitude.toString())]}
              icon={createLeafletIcon()}
            >
              <Popup>
                <div className="p-1 font-sans">
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-brand-gold" />
                    {marker.name}
                  </h3>
                  <p className="text-gray-300 text-xs mt-1 leading-relaxed">{marker.description}</p>
                  {marker.cost && (
                    <div className="mt-2 text-[10px] flex items-center justify-between text-gray-400 border-t border-white/5 pt-1.5">
                      <span>Cost: {marker.cost}</span>
                      <span>Duration: {marker.duration || 'N/A'}</span>
                    </div>
                  )}
                  {marker.whySpecial && (
                    <div className="mt-1 bg-pink-500/10 border border-pink-500/25 p-1.5 rounded text-[10px] text-pink-300">
                      <strong>Hidden Gem:</strong> {marker.whySpecial}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          {leafletRoutePath.length > 1 && (
            <Polyline
              positions={leafletRoutePath}
              color="#dfb14c"
              weight={3.5}
              opacity={0.8}
              dashArray="8, 8"
            />
          )}
          <RecenterMap center={center} />
        </LeafletMap>
      </div>
    );
  };

  const renderGoogleMap = () => {
    return (
      <div className="w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <GoogleMap
          mapContainerClassName="w-full h-full"
          center={googleCenter}
          zoom={13}
          options={{
            styles: googleMapDarkStyles,
            disableDefaultUI: false,
            zoomControl: true,
          }}
        >
          {markers.map((marker, idx) => {
            const position = { lat: parseFloat(marker.latitude.toString()), lng: parseFloat(marker.longitude.toString()) };
            return (
              <GoogleMarker
                key={idx}
                position={position}
                onClick={() => setActiveGoogleMarker(marker)}
                title={marker.name}
              />
            );
          })}

          {activeGoogleMarker && (
            <InfoWindow
              position={{ lat: parseFloat(activeGoogleMarker.latitude.toString()), lng: parseFloat(activeGoogleMarker.longitude.toString()) }}
              onCloseClick={() => setActiveGoogleMarker(null)}
            >
              <div className="p-2 max-w-[240px] text-gray-950 font-sans">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand-gold" />
                  {activeGoogleMarker.name}
                </h3>
                <p className="text-gray-700 text-xs mt-1 leading-relaxed">{activeGoogleMarker.description}</p>
                {activeGoogleMarker.whySpecial && (
                  <div className="mt-1 bg-pink-100 border border-pink-200 p-1.5 rounded text-[10px] text-pink-700">
                    <strong>Hidden Gem:</strong> {activeGoogleMarker.whySpecial}
                  </div>
                )}
              </div>
            </InfoWindow>
          )}

          {googleRoutePath.length > 1 && (
            <GooglePolyline
              path={googleRoutePath}
              options={{
                strokeColor: '#dfb14c',
                strokeOpacity: 0.8,
                strokeWeight: 4,
                icons: [{
                  icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 } as any,
                  offset: '0',
                  repeat: '20px'
                }]
              }}
            />
          )}
        </GoogleMap>
      </div>
    );
  };

  if (hasGoogleKey && isLoaded && !loadError) {
    return renderGoogleMap();
  }

  return renderLeafletMap();
}

// Ultra premium dark theme styles for Google Maps
const googleMapDarkStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];
