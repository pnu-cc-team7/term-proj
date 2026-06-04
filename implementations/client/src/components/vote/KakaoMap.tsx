import React, { useEffect, useRef, useState } from 'react';
import { loadKakaoMapsSdk } from '../../lib/kakaoMapLoader';

interface KakaoMapProps {
  lat: number;
  lng: number;
  name: string;
}

export const KakaoMap: React.FC<KakaoMapProps> = ({ lat, lng, name }) => {
  const container = useRef<HTMLDivElement>(null);
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  );

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      setMapStatus('loading');
      const result = await loadKakaoMapsSdk();

      if (!isMounted) return;

      if (!result.ok) {
        console.error('--- Kakao Map: Load Failed ---', result.error);
        setMapStatus('error');
        return;
      }

      if (!container.current) return;

      try {
        const { maps } = result;
        const position = new maps.LatLng(lat, lng);
        const map = new maps.Map(container.current, {
          center: position,
          level: 3,
        });
        const marker = new maps.Marker({ position });
        marker.setMap(map);

        const infowindow = new maps.InfoWindow({
          content: `<div style="padding:5px; font-size:12px; min-width:100px; text-align:center;">${name}</div>`,
        });
        infowindow.open(map, marker);
        setMapStatus('ready');
      } catch (error) {
        console.error('--- Kakao Map: Render Error ---', error);
        setMapStatus('error');
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [lat, lng, name]);

  return (
    <div style={{ position: 'relative', marginTop: '20px' }}>
      <div
        ref={container}
        style={{
          width: '100%',
          height: '200px',
          border: '3px solid var(--ink)',
          borderRadius: '8px',
          boxShadow: '4px 4px 0 var(--ink)',
          background: 'var(--paper-tint)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {mapStatus === 'loading' && (
          <p className="scribble-text">Drawing map...</p>
        )}
        {mapStatus === 'error' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p className="scribble-text" style={{ color: 'var(--accent)' }}>
              Map initialization failed
            </p>
            <p style={{ fontSize: '12px', opacity: 0.7 }}>
              Check API key or domain registration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
