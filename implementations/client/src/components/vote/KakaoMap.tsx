import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  lat: number;
  lng: number;
  name: string;
}

export const KakaoMap: React.FC<KakaoMapProps> = ({ lat, lng, name }) => {
  const container = useRef<HTMLDivElement>(null);
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const scriptId = 'kakao-maps-sdk';
    const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;

    const initMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          if (!container.current) return;
          try {
            const options = {
              center: new window.kakao.maps.LatLng(lat, lng),
              level: 3,
            };
            const map = new window.kakao.maps.Map(container.current, options);
            const marker = new window.kakao.maps.Marker({ 
              position: new window.kakao.maps.LatLng(lat, lng) 
            });
            marker.setMap(map);
            
            const infowindow = new window.kakao.maps.InfoWindow({
              content: `<div style="padding:5px; font-size:12px; font-family:var(--hand); min-width:100px; text-align:center;">${name}</div>`,
            });
            infowindow.open(map, marker);
            setMapStatus('ready');
          } catch (e) {
            console.error('--- Kakao Map: Render Error ---', e);
            setMapStatus('error');
          }
        });
      }
    };

    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      if (!apiKey) {
        setMapStatus('error');
        return;
      }

      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services,clusterer&autoload=false`;
      script.onload = () => initMap();
      script.onerror = () => {
        console.error('--- Kakao Map: Load Failed (Network/403) ---');
        setMapStatus('error');
      };
      document.head.appendChild(script);
    } else {
      if (window.kakao && window.kakao.maps) {
        initMap();
      } else {
        // 이미 로드 중일 수 있으므로 다시 onload를 걸어줌
        const oldOnload = script.onload;
        script.onload = (e) => {
          if (oldOnload) (oldOnload as Function)(e);
          initMap();
        };
      }
    }
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
          overflow: 'hidden'
        }} 
      >
        {mapStatus === 'loading' && <p className="scribble-text">Drawing map...</p>}
        {mapStatus === 'error' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p className="scribble-text" style={{ color: 'var(--accent)' }}>🗺️ Map initialization failed</p>
            <p style={{ fontSize: '12px', opacity: 0.7 }}>Check API Key or Domain (Port) registration</p>
          </div>
        )}
      </div>
    </div>
  );
};
