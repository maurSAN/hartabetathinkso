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
    
    // Romania bounds - strict restriction
    const romaniaBounds: mapboxgl.LngLatBoundsLike = [
      [20.2619, 43.6186], // Southwest coordinates
      [29.7155, 48.2659]  // Northeast coordinates
    ];
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [25.0, 46.0],
      zoom: 6.8,
      minZoom: 6.5,
      maxZoom: 9,
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
      console.log('Map loaded, fetching counties data...');
      
      try {
        // Using geoBoundaries data - reliable source
        const response = await fetch('https://www.geoboundaries.org/api/current/gbOpen/ROU/ADM1/');
        const apiData = await response.json();
        
        // Fetch the actual GeoJSON
        const geoResponse = await fetch(apiData.gjDownloadURL);
        const countiesData = await geoResponse.json();
        
        console.log('GeoJSON loaded successfully:', countiesData);

        // Add source
        map.current?.addSource('romania-counties', {
          type: 'geojson',
          data: countiesData,
        });

        // Add fill layer - light fill
        map.current?.addLayer({
          id: 'counties-fill',
          type: 'fill',
          source: 'romania-counties',
          paint: {
            'fill-color': 'hsl(210, 40%, 85%)',
            'fill-opacity': 0.6,
          }
        });

        // Add internal county borders - subtle
        map.current?.addLayer({
          id: 'counties-border-internal',
          type: 'line',
          source: 'romania-counties',
          paint: {
            'line-color': 'hsl(210, 30%, 50%)',
            'line-width': 1.5,
            'line-opacity': 0.7
          }
        });

        // Add external Romania border - darker and thicker
        map.current?.addLayer({
          id: 'romania-border-outer',
          type: 'line',
          source: 'romania-counties',
          paint: {
            'line-color': 'hsl(210, 60%, 25%)',
            'line-width': 4,
            'line-opacity': 1
          }
        });

        // Add hover highlight layer
        map.current?.addLayer({
          id: 'counties-highlight',
          type: 'fill',
          source: 'romania-counties',
          paint: {
            'fill-color': 'hsl(210, 80%, 60%)',
            'fill-opacity': 0
          }
        });

        let hoveredStateId: string | number | null = null;

        // Mouse move event
        map.current?.on('mousemove', 'counties-fill', (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            
            if (hoveredStateId !== null && hoveredStateId !== feature.id) {
              map.current?.setFeatureState(
                { source: 'romania-counties', id: hoveredStateId },
                { hover: false }
              );
            }
            
            hoveredStateId = feature.id as string | number;
            
            map.current?.setPaintProperty('counties-highlight', 'fill-opacity', [
              'case',
              ['==', ['get', 'shapeName'], feature.properties?.shapeName],
              0.4,
              0
            ]);
            
            const countyName = feature.properties?.shapeName || 'Necunoscut';
            setSelectedCounty(countyName);
            
            if (map.current) {
              map.current.getCanvas().style.cursor = 'pointer';
            }
          }
        });

        // Mouse leave event
        map.current?.on('mouseleave', 'counties-fill', () => {
          if (hoveredStateId !== null) {
            map.current?.setFeatureState(
              { source: 'romania-counties', id: hoveredStateId },
              { hover: false }
            );
          }
          hoveredStateId = null;
          map.current?.setPaintProperty('counties-highlight', 'fill-opacity', 0);
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
