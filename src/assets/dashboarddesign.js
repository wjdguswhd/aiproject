import React, { useEffect, useRef } from 'react';

const DashboardDesign = ({
  onMenuClick,
  activeMenu,
  emergencyAlert,
  sensorsStatus,
  motorStatus,
  rainfallData,
  sewerData,
  onSewerMarkerClick,
}) => {
  const mapRef = useRef(null);      // 지도 참조
  const markersRef = useRef([]);    // 마커 배열 참조

  // SVG를 Base64로 변환
  const toBase64 = (str) => window.btoa(unescape(encodeURIComponent(str)));

  // map.js와 동일한 마커 이미지 생성
  const createMarkerImage = (color, status) => {
    const symbol = status === 'danger' ? '!' : status === 'warning' ? '?' : 'V';
    const svg = `
      <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="12" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="15" cy="15" r="6" fill="white"/>
        <text x="15" y="19" text-anchor="middle" font-size="8" fill="${color}" font-weight="bold">${symbol}</text>
      </svg>`;
    return new window.kakao.maps.MarkerImage(
      `data:image/svg+xml;base64,${toBase64(svg)}`,
      new window.kakao.maps.Size(30, 30),
      { offset: new window.kakao.maps.Point(15, 30) }
    );
  };

  // 카카오맵 초기화 및 하수구 마커 표시
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;

    window.kakao.maps.load(() => {
      const container = document.getElementById('kakao-map');
      if (!container) return;

      if (!mapRef.current) {
        mapRef.current = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 3,
        });
      }

      const map = mapRef.current;

      // 기존 마커 제거
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // 새 마커 생성
      if (sewerData && sewerData.length > 0) {
        sewerData.forEach(sewer => {
          // Map.js 조건 반영: value/status 기반 색상 재계산
          let color = '#2ecc71'; // 기본 green
          let status = 'normal';
          if (sewer.value !== null && sewer.value !== undefined) {
            if (sewer.value >= 67) {
              color = '#e74c3c';
              status = 'danger';
            } else if (sewer.value >= 34) {
              color = '#f39c12';
              status = 'warning';
            } else if (sewer.value >= 1) {
              color = '#2ecc71';
              status = 'normal';
            } else {
              color = '#95a5a6';
              status = 'unknown';
            }
          }

          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(sewer.lat, sewer.lng),
            image: createMarkerImage(color, status),
            map: map,
          });

          window.kakao.maps.event.addListener(marker, 'click', () => {
            if (onSewerMarkerClick) onSewerMarkerClick(sewer);
          });

          markersRef.current.push(marker);
        });
      }
    });
  }, [sewerData, onSewerMarkerClick]);

  return (
    <div>
      {/* 긴급 알림 배너 */}
      {emergencyAlert && (
        <div style={{
          backgroundColor: '#e74c3c',
          borderRadius: 5,
          color: 'white',
          padding: '10px 20px',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
          fontSize: 16,
        }}>
          <span>⚠️ 긴급 알림: {emergencyAlert.message}</span>
          <button onClick={emergencyAlert.onConfirm} style={{
            backgroundColor: '#c0392b',
            border: 'none',
            borderRadius: 3,
            color: 'white',
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: 12,
          }}>확인</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        {/* 지도 영역 */}
        <section style={{
          backgroundColor: '#2c3e50',
          borderRadius: 5,
          color: 'white',
          flex: 2,
          padding: 20,
          minHeight: 380,
          boxSizing: 'border-box',
        }}>
          <h2 style={{ marginTop: 0, fontSize: 14, fontWeight: 'bold' }}>실시간 하수구 위치</h2>
          <div id="kakao-map" style={{ width: '100%', height: 400, borderRadius: 3, position: 'relative' }} />
        </section>

        {/* 센서 상태 */}
        <section style={{ flex: 1.8, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            backgroundColor: '#ecf0f1',
            borderRadius: 5,
            padding: 15,
            border: '1px solid #bdc3c7',
            boxSizing: 'border-box',
          }}>
            <h2 style={{ marginTop: 0, fontSize: 14, fontWeight: 'bold', color: '#2c3e50' }}>하수구 환경</h2>
            <div style={{ display: 'flex', gap: 15 }}>
              {/* 수거함 현황 */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: 3,
                border: '1px solid #bdc3c7',
                flex: 1,
                padding: 10,
                textAlign: 'left'
              }}>
                <p style={{ fontWeight: 'bold', fontSize: 12, color: '#2c3e50' }}>수거함 현황</p>
                <p style={{ color: sensorsStatus.collectionBoxColor, fontSize: 24, fontWeight: 'bold' }}>
                  {sensorsStatus.collectionBox !== null ? `${sensorsStatus.collectionBox}%` : '데이터 없음'}
                </p>
                <p style={{ color: sensorsStatus.collectionBoxColor, fontSize: 12 }}>
                  {sensorsStatus.collectionBoxStatus}
                </p>
                <div style={{ width: 30, height: 30, backgroundColor: sensorsStatus.collectionBoxColor, borderRadius: '50%', marginTop: 5 }} />
              </div>

              {/* 강우 */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: 3,
                border: '1px solid #bdc3c7',
                flex: 1,
                padding: 10,
                textAlign: 'left'
              }}>
                <p style={{ fontWeight: 'bold', fontSize: 12, color: '#2c3e50' }}>강우</p>
                <p style={{ color: sensorsStatus.rainfallColor, fontSize: 24, fontWeight: 'bold' }}>
                  {sensorsStatus.rainfallStatus === '강우 중' ? `${rainfallData[rainfallData.length - 1]?.value}%` : '강수량 없음'}
                </p>
                <p style={{ color: sensorsStatus.rainfallColor, fontSize: 12 }}>
                  {sensorsStatus.rainfallStatus}
                </p>
                <div style={{ width: 30, height: 30, backgroundColor: sensorsStatus.rainfallColor, borderRadius: '50%', marginTop: 5 }} />
              </div>
            </div>
          </div>

          {/* 모터 상태 */}
          <div style={{
            backgroundColor: '#ecf0f1',
            borderRadius: 5,
            padding: 15,
            flex: 1,
            border: '1px solid #bdc3c7',
            boxSizing: 'border-box',
          }}>
            <h2 style={{ marginTop: 0, fontSize: 14, fontWeight: 'bold', color: '#2c3e50' }}>모터 작동 상태</h2>
            <div style={{ display: 'flex', gap: 20 }}>
              {/* 청소 모터 */}
              <div style={{ backgroundColor: 'white', borderRadius: 3, border: '1px solid #bdc3c7', flex: 1, padding: 10 }}>
                <p style={{ fontWeight: 'bold', fontSize: 12, color: '#2c3e50' }}>청소 모터</p>
                <p style={{ color: '#27ae60', fontSize: 20, fontWeight: 'bold' }}>{motorStatus.cleanMotor.status}</p>
                <p style={{ fontSize: 12, color: '#2c3e50' }}>속도: {motorStatus.cleanMotor.speed}%</p>
                <div style={{ width: '100%', height: 10, backgroundColor: '#ecf0f1', borderRadius: 5, marginTop: 10 }}>
                  <div style={{ width: `${motorStatus.cleanMotor.speed}%`, height: '100%', backgroundColor: '#27ae60', borderRadius: 5 }} />
                </div>
              </div>

              {/* 비 감지 센서 */}
              <div style={{ backgroundColor: 'white', borderRadius: 3, border: '1px solid #bdc3c7', flex: 1, padding: 10 }}>
                <p style={{ fontWeight: 'bold', fontSize: 12, color: '#2c3e50' }}>비 감지 센서</p>
                <p style={{ color: '#27ae60', fontSize: 20, fontWeight: 'bold' }}>{motorStatus.rainSensor.status}</p>
                <p style={{ fontSize: 12, color: '#2c3e50' }}>{motorStatus.rainSensor.mode}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 강수량 그래프 */}
      <section style={{
        backgroundColor: '#ecf0f1',
        borderRadius: 5,
        padding: 20,
        minHeight: 250,
        border: '1px solid #bdc3c7',
        boxSizing: 'border-box',
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 'bold', color: '#2c3e50', marginTop: 0, marginBottom: 20 }}>시간별 강수량 그래프</h2>
        <svg width="960" height="200" viewBox="0 0 960 200" style={{ width: '100%', height: 'auto' }}>
          <polyline fill="none" stroke="#3498db" strokeWidth="2"
            points={rainfallData.map((point, i) => `${i * 60 + 10},${200 - point.value * 2}`).join(' ')} />
          {rainfallData.map((point, i) => <circle key={i} cx={i * 60 + 10} cy={200 - point.value * 2} r={4} fill="#3498db" />)}
          {rainfallData.map((point, i) => <text key={i} x={i * 60 + 10} y={195} fontSize={10} fill="#2c3e50" textAnchor="middle">{point.time}</text>)}
        </svg>
      </section>
    </div>
  );
};

export default DashboardDesign;
