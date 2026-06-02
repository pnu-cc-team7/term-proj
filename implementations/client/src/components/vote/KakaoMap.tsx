import React, { useEffect, useRef } from 'react';

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
  const [sdkStatus, setSdkStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const initMap = () => {
      if (window.kakao && window.kakao.maps) {
        setSdkStatus('ready');
        const options = {
          center: new window.kakao.maps.LatLng(lat, lng),
          level: 3,
        };

        const map = new window.kakao.maps.Map(container.current, options);
        const markerPosition = new window.kakao.maps.LatLng(lat, lng);
        const marker = new window.kakao.maps.Marker({ position: markerPosition });
        marker.setMap(map);

        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px; font-size:12px; font-family:var(--hand);">${name}</div>`,
        });
        infowindow.open(map, marker);
      } else {
        setSdkStatus('error');
      }
    };

    // SDK 로드 완료까지 잠시 대기 후 실행
    const timer = setTimeout(initMap, 500);
    return () => clearTimeout(timer);
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
          justifyContent: 'center'
        }} 
      >
        {sdkStatus === 'loading' && <p className="scribble-text">Loading Map...</p>}
        {sdkStatus === 'error' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p className="scribble-text" style={{ color: 'var(--accent)' }}>🗺️ Map SDK not found</p>
            <p style={{ fontSize: '12px', opacity: 0.7 }}>Please check your Kakao API Key</p>
          </div>
        )}
      </div>
    </div>
  );
};
