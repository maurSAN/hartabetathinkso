import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const RomaniaMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !isTokenSet) return;

    mapboxgl.accessToken = mapboxToken;
    
    // Romania bounds to restrict the map
    const romaniaBounds: mapboxgl.LngLatBoundsLike = [
      [20.2619, 43.6186], // Southwest coordinates
      [29.7155, 48.2659]  // Northeast coordinates
    ];
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [25.0, 45.9],
      zoom: 6.5,
      minZoom: 6,
      maxZoom: 10,
      maxBounds: romaniaBounds,
      pitch: 0,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('load', async () => {
      console.log('Map loaded');
      
      // Load GeoJSON for Romania counties from a public CDN
      try {
        const response = await fetch('https://raw.githubusercontent.com/andrei-gheorghiu/geodata-ro/master/judete-simple.geojson');
        const countiesData = await response.json();
        
        console.log('GeoJSON loaded:', countiesData);

        // Add counties source
        map.current?.addSource('romania-counties', {
          type: 'geojson',
          data: countiesData,
        });

        // Add county fill layer with Romanian colors
        map.current?.addLayer({
          id: 'counties-fill',
          type: 'fill',
          source: 'romania-counties',
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'id'],
              1, 'hsl(210, 70%, 60%)',   // Albastru
              20, 'hsl(350, 70%, 60%)',  // Roșu
              40, 'hsl(48, 80%, 60%)'    // Galben
            ],
            'fill-opacity': 0.3,
          }
        });

        // Add county border layer
        map.current?.addLayer({
          id: 'counties-border',
          type: 'line',
          source: 'romania-counties',
          paint: {
            'line-color': 'hsl(210, 60%, 40%)',
            'line-width': 2,
            'line-opacity': 0.8
          }
        });

        // Add hover effect with highlighted border
        map.current?.addLayer({
          id: 'counties-highlight',
          type: 'line',
          source: 'romania-counties',
          paint: {
            'line-color': 'hsl(210, 90%, 50%)',
            'line-width': 3,
            'line-opacity': 0
          }
        });

        let hoveredCountyId: string | number | null = null;

        map.current?.on('mousemove', 'counties-fill', (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            console.log('Hover on:', feature.properties);
            
            // Reset previous hover
            if (hoveredCountyId !== null) {
              map.current?.setFilter('counties-highlight', ['!=', ['id'], hoveredCountyId]);
            }
            
            hoveredCountyId = feature.id || null;
            
            // Highlight current county
            map.current?.setPaintProperty('counties-fill', 'fill-opacity', [
              'case',
              ['==', ['id'], hoveredCountyId],
              0.7,
              0.3
            ]);
            
            map.current?.setPaintProperty('counties-highlight', 'line-opacity', [
              'case',
              ['==', ['id'], hoveredCountyId],
              1,
              0
            ]);
            
            const countyName = feature.properties?.name || feature.properties?.nume || feature.properties?.NAME || 'Necunoscut';
            setSelectedCounty(countyName);
            
            if (map.current) {
              map.current.getCanvas().style.cursor = 'pointer';
            }
          }
        });

        map.current?.on('mouseleave', 'counties-fill', () => {
          if (hoveredCountyId !== null) {
            map.current?.setPaintProperty('counties-fill', 'fill-opacity', 0.3);
            map.current?.setPaintProperty('counties-highlight', 'line-opacity', 0);
          }
          hoveredCountyId = null;
          setSelectedCounty(null);
          
          if (map.current) {
            map.current.getCanvas().style.cursor = 'default';
          }
        });
        
        console.log('Map setup complete');
      } catch (error) {
        console.error('Error loading GeoJSON:', error);
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [isTokenSet, mapboxToken]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      setIsTokenSet(true);
    }
  };

  if (!isTokenSet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-6 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Configurare Hartă</h2>
            <p className="text-sm text-muted-foreground">
              Pentru a vizualiza harta României cu județele, introdu token-ul tău Mapbox.
            </p>
            <p className="text-xs text-muted-foreground">
              Obține un token gratuit de la{' '}
              <a 
                href="https://account.mapbox.com/access-tokens/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </div>
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="pk.eyJ1IjoieW91ci1..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="w-full"
            />
            <Button type="submit" className="w-full">
              Încarcă Harta
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-background">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {selectedCounty && (
        <Card className="absolute top-4 left-4 p-4 bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg">
          <p className="text-sm font-medium text-card-foreground">
            Județ: <span className="text-primary font-bold">{selectedCounty}</span>
          </p>
        </Card>
      )}

      <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80">
        <Card className="p-4 bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg">
          <h3 className="font-bold text-card-foreground mb-2">Harta României</h3>
          <p className="text-xs text-muted-foreground">
            Trece cu mouse-ul peste județe pentru a vedea numele. 
            Harta este restricționată doar la teritoriul României.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RomaniaMap;
