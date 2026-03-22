import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

// 🔥 THIS FIXES MAP MOVEMENT
function ChangeView({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center[0] && center[1]) {
      map.setView(center, 13);
    }
  }, [center]);

  return null;
}

export default function MapView({ lat, lon, risk }) {
  const position = lat && lon ? [lat, lon] : [28.61, 77.23];

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        {/* 🔥 FORCE UPDATE */}
        <ChangeView center={position} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 🔥 DYNAMIC MARKER */}
        {lat && (
          <Marker position={position}>
            <Popup>
              Risk: {(risk * 100).toFixed(0)}%
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}