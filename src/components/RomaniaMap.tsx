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
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !isTokenSet) return;

    mapboxgl.accessToken = mapboxToken;
    
    // Romania bounds
    const romaniaBounds: mapboxgl.LngLatBoundsLike = [
      [20.2619, 43.6186],
      [29.7155, 48.2659]
    ];
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [25.0, 46.0],
      zoom: 6.5,
      minZoom: 6,
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
        map.current?.addLayer({
          id: 'county-labels',
          type: 'symbol',
          source: 'romania-counties',
          layout: {
            'text-field': ['get', 'shapeISO'],
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
            
            setSelectedCounty(countyName);
            
            map.current?.setPaintProperty('counties-selected', 'fill-opacity', [
              'case',
              ['==', ['get', 'shapeName'], countyName],
              0.5,
              0
            ]);
          }
        });

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
              Pentru a vizualiza harta României, introdu token-ul tău Mapbox.
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
      
      {/* Hover tooltip */}
      {hoveredCounty && !selectedCounty && (
        <Card className="absolute top-4 left-4 p-3 bg-card/95 backdrop-blur-sm shadow-lg">
          <p className="text-sm font-medium">
            Județ: <span className="font-bold text-primary">{hoveredCounty}</span>
          </p>
        </Card>
      )}

      {/* Selected county panel */}
      {selectedCounty && (
        <Card className="absolute top-4 left-4 right-4 md:right-auto md:w-96 p-6 bg-card/95 backdrop-blur-sm shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-bold">Județul {selectedCounty}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCounty(null);
                map.current?.setPaintProperty('counties-selected', 'fill-opacity', 0);
              }}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              ✕
            </Button>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Informații detaliate despre județul {selectedCounty} vor fi adăugate aici.
            </p>
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground italic">
                Click pe hartă pentru alte județe
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Info panel */}
      <div className="absolute bottom-4 right-4 w-80 hidden md:block">
        <Card className="p-4 bg-card/95 backdrop-blur-sm shadow-lg">
          <h3 className="font-bold mb-2">Harta României</h3>
          <p className="text-xs text-muted-foreground">
            Treci cu mouse-ul pentru hover. Click pe județ pentru detalii.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RomaniaMap;
