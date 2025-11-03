import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { countyDetails, type City } from '@/data/county-data';
import { ScrollArea } from '@/components/ui/scroll-area';

// IMPORTANT: Înlocuiește cu token-ul tău Mapbox public de la https://account.mapbox.com/access-tokens/
const MAPBOX_TOKEN = 'pk.eyJ1Ijoicmlua2Fkb3NoaSIsImEiOiJjbWd3cnhmaTExMmt5MmlzZWQ0dGF1amZ4In0.9-fSTtTfSYKupbvhPw0HSw';

const RomaniaMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const cityMarkersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    // Romania bounds
    const romaniaBounds: mapboxgl.LngLatBoundsLike = [
      [20.2619, 43.6186],
      [29.7155, 48.2659]
    ];
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [25.0, 46.0],
      zoom: 5.5,
      minZoom: 4,
      maxZoom: 10,
      maxBounds: romaniaBounds,
      pitch: 0,
      dragRotate: false,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        showCompass: false,
        visualizePitch: false,
      }),
      'top-right'
    );

    map.current.on('load', async () => {
      try {
        // Load local GeoJSON
        const response = await fetch('/romania-counties.geojson');
        const countiesData = await response.json();

        // Add source
        map.current?.addSource('romania-counties', {
          type: 'geojson',
          data: countiesData,
        });

        // Fill layer - light blue
        map.current?.addLayer({
          id: 'counties-fill',
          type: 'fill',
          source: 'romania-counties',
          paint: {
            'fill-color': '#E3F2FD',
            'fill-opacity': 0.7,
          }
        });

        // Internal county borders - subtle
        map.current?.addLayer({
          id: 'counties-border-internal',
          type: 'line',
          source: 'romania-counties',
          paint: {
            'line-color': '#1976D2',
            'line-width': 1,
            'line-opacity': 0.6
          }
        });

        // External Romania border - thick and dark
        map.current?.addLayer({
          id: 'romania-border-outer',
          type: 'line',
          source: 'romania-counties',
          paint: {
            'line-color': '#0D47A1',
            'line-width': 8,
            'line-opacity': 1
          }
        });

        // Hover highlight layer
        map.current?.addLayer({
          id: 'counties-hover',
          type: 'fill',
          source: 'romania-counties',
          paint: {
            'fill-color': '#2196F3',
            'fill-opacity': 0
          }
        });

        // Selected county layer
        map.current?.addLayer({
          id: 'counties-selected',
          type: 'fill',
          source: 'romania-counties',
          paint: {
            'fill-color': '#1976D2',
            'fill-opacity': 0
          }
        });

        // County labels with abbreviations
        // MODIFICĂ AICI pentru a schimba ce se afișează pe hartă:
        // Opțiunea 1: Afișează numele complet al județului - ['get', 'shapeName']
        // Opțiunea 2 (CURENT): Afișează doar ultimele 2-3 caractere din ISO (fără RO-)
        map.current?.addLayer({
          id: 'county-labels',
          type: 'symbol',
          source: 'romania-counties',
          layout: {
            // Scoate 'RO-' din început (ex: RO-AB → AB)
            'text-field': [
              'slice',
              ['get', 'shapeISO'],
              3  // Începe de la caracterul 3 (după "RO-")
            ],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-transform': 'uppercase',
            'text-letter-spacing': 0.05
          },
          paint: {
            'text-color': '#0D47A1',
            'text-halo-color': '#FFFFFF',
            'text-halo-width': 2,
            'text-halo-blur': 1
          }
        });

        // Hover events
        map.current?.on('mousemove', 'counties-fill', (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const countyName = feature.properties?.shapeName || 'Necunoscut';
            
            setHoveredCounty(countyName);
            
            map.current?.setPaintProperty('counties-hover', 'fill-opacity', [
              'case',
              ['==', ['get', 'shapeName'], countyName],
              0.3,
              0
            ]);
            
            if (map.current) {
              map.current.getCanvas().style.cursor = 'pointer';
            }
          }
        });

        map.current?.on('mouseleave', 'counties-fill', () => {
          setHoveredCounty(null);
          map.current?.setPaintProperty('counties-hover', 'fill-opacity', 0);
          
          if (map.current) {
            map.current.getCanvas().style.cursor = 'default';
          }
        });

        // Click events
        map.current?.on('click', 'counties-fill', (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const countyName = feature.properties?.shapeName || 'Necunoscut';
            
            console.log('County clicked:', countyName);
            
            // Elimină markerii anteriori
            cityMarkersRef.current.forEach(marker => marker.remove());
            cityMarkersRef.current = [];
            
            setSelectedCounty(countyName);
            setSelectedCity(null);
            
            map.current?.setPaintProperty('counties-selected', 'fill-opacity', [
              'case',
              ['==', ['get', 'shapeName'], countyName],
              0.5,
              0
            ]);
            
            // Face zoom pe județ și afișează orașele
            // Normalizează numele pentru lookup (convertește la majuscule)
            const countyKey = countyName.toUpperCase();
            const county = countyDetails[countyKey];
            if (county && map.current) {
              map.current.flyTo({
                center: county.center,
                zoom: 8.5,
                duration: 1500
              });
              
              // Adaugă markere pentru orașe după ce s-a terminat zoom-ul
              setTimeout(() => {
                county.cities.forEach(city => {
                  const el = document.createElement('div');
                  el.className = 'city-marker';
                  el.style.cssText = `
                    background: #1976D2;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    cursor: pointer;
                    transition: all 0.2s;
                  `;
                  
                  el.addEventListener('mouseenter', () => {
                    el.style.width = '16px';
                    el.style.height = '16px';
                    el.style.background = '#2196F3';
                  });
                  
                  el.addEventListener('mouseleave', () => {
                    el.style.width = '12px';
                    el.style.height = '12px';
                    el.style.background = '#1976D2';
                  });
                  
                  const marker = new mapboxgl.Marker(el)
                    .setLngLat(city.coordinates)
                    .setPopup(
                      new mapboxgl.Popup({ offset: 15 })
                        .setHTML(`<div style="padding: 4px 8px; font-weight: 600;">${city.name}</div>`)
                    )
                    .addTo(map.current!);
                  
                  el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    setSelectedCity(city);
                  });
                  
                  cityMarkersRef.current.push(marker);
                });
              }, 1500);
            }
          }
        });

      } catch (error) {
        console.error('Error loading GeoJSON:', error);
      }
    });

    return () => {
      cityMarkersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, []);
  
  const handleBackToCounty = () => {
    setSelectedCity(null);
  };
  
  const handleBackToMap = () => {
    setSelectedCounty(null);
    setSelectedCity(null);
    
    // Elimină markerii orașelor
    cityMarkersRef.current.forEach(marker => marker.remove());
    cityMarkersRef.current = [];
    
    // Resetează zoom-ul
    if (map.current) {
      map.current.flyTo({
        center: [25.0, 46.0],
        zoom: 5.5,
        duration: 1500
      });
      
      map.current.setPaintProperty('counties-selected', 'fill-opacity', 0);
    }
  };

  return (
    <div className="relative w-full h-screen bg-background">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Hover tooltip */}
      {hoveredCounty && !selectedCounty && (
        <Card className="absolute top-4 left-4 p-3 bg-card/95 backdrop-blur-sm shadow-lg">
          <p className="text-sm font-medium">
            Județ: <span className="font-bold text-primary">{hoveredCounty}</span>
          </p>
        </Card>
      )}

      {/* Panel pentru oraș selectat */}
      {selectedCity && (
        <Card className="absolute top-4 left-4 right-4 md:right-auto md:w-[450px] md:max-h-[85vh] bg-card shadow-2xl border-2">
          <div className="flex items-start justify-between p-6 pb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold text-primary">{selectedCity.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Județul {selectedCounty}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToCounty}
                className="h-8 px-2 hover:bg-muted"
              >
                ← Înapoi
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToMap}
                className="h-8 w-8 p-0 hover:bg-muted shrink-0"
              >
                ✕
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-[calc(85vh-120px)] md:h-auto">
            <div className="p-6 space-y-4">
              {selectedCity.properties.length > 0 ? (
                <>
                  <h3 className="font-semibold text-lg">Proprietăți disponibile</h3>
                  <div className="space-y-4">
                    {selectedCity.properties.map((property, index) => (
                      <Card key={index} className="p-4 bg-muted/50 border">
                        <h4 className="font-bold text-base mb-2">{property.name}</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Locație:</span> {property.location}</p>
                          <p><span className="font-medium">Suprafață:</span> {property.area}</p>
                          <p><span className="font-medium">Preț:</span> {property.price}</p>
                          <p className="text-muted-foreground mt-2">{property.description}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nu există proprietăți pentru acest oraș.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      )}
      
      {/* Panel pentru județ selectat (când nu e selectat niciun oraș) */}
      {selectedCounty && !selectedCity && (
        <Card className="absolute top-4 left-4 right-4 md:right-auto md:w-[450px] md:max-h-[85vh] bg-card shadow-2xl border-2">
          <div className="flex items-start justify-between p-6 pb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold text-primary">Județul {selectedCounty}</h2>
              {countyDetails[selectedCounty.toUpperCase()] && (
                <p className="text-sm text-muted-foreground mt-1">
                  {countyDetails[selectedCounty.toUpperCase()].description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToMap}
              className="h-8 w-8 p-0 hover:bg-muted shrink-0"
            >
              ✕
            </Button>
          </div>
          
          <ScrollArea className="h-[calc(85vh-120px)] md:h-auto">
            <div className="p-6 space-y-4">
              {countyDetails[selectedCounty.toUpperCase()]?.cities && countyDetails[selectedCounty.toUpperCase()].cities.length > 0 ? (
                <>
                  <h3 className="font-semibold text-lg">Orașe disponibile</h3>
                  <p className="text-sm text-muted-foreground">
                    Click pe un marker albastru de pe hartă pentru a vedea proprietățile din acel oraș.
                  </p>
                  <div className="space-y-2">
                    {countyDetails[selectedCounty.toUpperCase()].cities.map((city, index) => (
                      <Card 
                        key={index} 
                        className="p-3 bg-muted/50 border cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => setSelectedCity(city)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-base">{city.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {city.properties.length} {city.properties.length === 1 ? 'proprietate' : 'proprietăți'}
                            </p>
                          </div>
                          <span className="text-primary">→</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nu există încă orașe adăugate pentru acest județ.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Info panel */}
      <div className="absolute bottom-4 right-4 w-80 hidden md:block">
        <Card className="p-4 bg-card/95 backdrop-blur-sm shadow-lg">
          <h3 className="font-bold mb-2">Harta României</h3>
          <p className="text-xs text-muted-foreground">
            {!selectedCounty 
              ? "Treci cu mouse-ul pentru hover. Click pe județ pentru orașe."
              : !selectedCity
              ? "Click pe markerele albastre pentru a vedea proprietățile."
              : "Vizualizezi proprietățile disponibile."}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RomaniaMap;
