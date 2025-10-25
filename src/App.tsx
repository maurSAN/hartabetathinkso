import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "./App.css";

mapboxgl.accessToken =
  "pk.eyJ1Ijoicmlua2Fkb3NoaSIsImEiOiJjbWd3cnhmaTExMmt5MmlzZWQ0dGF1amZ4In0.9-fSTtTfSYKupbvhPw0HSw";

function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;

    mapInstance.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [26.4, 46.93], // Piatra Neamț 😎
      zoom: 11,
    });

    new mapboxgl.Marker()
      .setLngLat([26.4, 46.93])
      .setPopup(new mapboxgl.Popup().setText("Salut, mauR!"))
      .addTo(mapInstance.current);

    return () => mapInstance.current?.remove();
  }, []);

  return <div ref={mapContainer} className="map-container" />;
}

export default App;
