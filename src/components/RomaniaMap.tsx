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
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [25.0, 45.9],
      zoom: 6.2,
      pitch: 0,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      // Add Romania counties boundaries
      map.current?.addSource('romania-counties', {
        type: 'vector',
        url: 'mapbox://mapbox.boundaries-adm2-v3'
      });

      // Add county fill layer
      map.current?.addLayer({
        id: 'counties-fill',
        type: 'fill',
        source: 'romania-counties',
        'source-layer': 'boundaries_admin_2',
        filter: ['==', ['get', 'iso_3166_1'], 'RO'],
        paint: {
          'fill-color': 'hsl(210, 80%, 45%)',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.3,
            0.1
          ]
        }
      });

      // Add county border layer
      map.current?.addLayer({
        id: 'counties-border',
        type: 'line',
        source: 'romania-counties',
        'source-layer': 'boundaries_admin_2',
        filter: ['==', ['get', 'iso_3166_1'], 'RO'],
        paint: {
          'line-color': 'hsl(210, 80%, 35%)',
          'line-width': 1.5,
          'line-opacity': 0.8
        }
      });

      // Add hover effect
      let hoveredCountyId: string | number | null = null;

      map.current?.on('mousemove', 'counties-fill', (e) => {
        if (e.features && e.features.length > 0) {
          if (hoveredCountyId !== null) {
            map.current?.setFeatureState(
              { source: 'romania-counties', sourceLayer: 'boundaries_admin_2', id: hoveredCountyId },
              { hover: false }
            );
          }
          hoveredCountyId = e.features[0].id;
          map.current?.setFeatureState(
            { source: 'romania-counties', sourceLayer: 'boundaries_admin_2', id: hoveredCountyId },
            { hover: true }
          );
          
          const countyName = e.features[0].properties?.name || 'Necunoscut';
          setSelectedCounty(countyName);
        }
      });

      map.current?.on('mouseleave', 'counties-fill', () => {
        if (hoveredCountyId !== null) {
          map.current?.setFeatureState(
            { source: 'romania-counties', sourceLayer: 'boundaries_admin_2', id: hoveredCountyId },
            { hover: false }
          );
        }
        hoveredCountyId = null;
        setSelectedCounty(null);
      });

      map.current!.getCanvas().style.cursor = 'default';
      map.current?.on('mouseenter', 'counties-fill', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });
      map.current?.on('mouseleave', 'counties-fill', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'default';
        }
      });
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
        <Card className="absolute top-4 left-4 p-4 bg-card/95 backdrop-blur-sm border-primary/20">
          <p className="text-sm font-medium text-card-foreground">
            Județ: <span className="text-primary font-bold">{selectedCounty}</span>
          </p>
        </Card>
      )}

      <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80">
        <Card className="p-4 bg-card/95 backdrop-blur-sm border-primary/20">
          <h3 className="font-bold text-card-foreground mb-2">Harta României</h3>
          <p className="text-xs text-muted-foreground">
            Trece cu mouse-ul peste județe pentru a vedea numele. 
            Folosește controalele din dreapta sus pentru zoom și rotație.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RomaniaMap;
