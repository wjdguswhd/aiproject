import React, { useEffect, useRef, useState } from 'react';

const DashboardDesign = ({
  onMenuClick,
  activeMenu,
  sensorsStatus,
  motorStatus,
  rainfallData,
  sewerData,
  onSewerMarkerClick,
}) => {
  const mapRef = useRef(null);      // 지도 참조
  const markersRef = useRef([]);    // 마커 배열 참조

  const [searchName, setSearchName] = useState('');
  const [inputLat, setInputLat] = useState('');
  const [inputLng, setInputLng] = useState('');

  const toBase64 = (str) => window.btoa(unescape(encodeURIComponent(str)));

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

  // --- 이름 검색 ---
  const handleNameSearch = () => {
    if (!searchName || !mapRef.current) return;
    const target = sewerData.find(s => s.name === searchName);
    if (target) {
      const position = new window.kakao.maps.LatLng(target.lat, target.lng);
      mapRef.current.setCenter(position);
      mapRef.current.setLevel(3);
    }
  };

  // --- 위도/경도 이동 ---
  const handleLatLngSearch = () => {
    if (!mapRef.current) return;
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      const position = new window.kakao.maps.LatLng(lat, lng);
      mapRef.current.setCenter(position);
      mapRef.current.setLevel(3);
    }
  };

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;

    window.kakao.maps.load(() => {
      const container = document.getElementById('kakao-map');
      if (!container) return;

      if (!mapRef.current) {
        mapRef.current = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(37.7132, 126.8900),
          level: 3,
        });
      }

      const map = mapRef.current;

      // 기존 마커 제거
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      if (sewerData && sewerData.length > 0) {
        sewerData.forEach(sewer => {
          let color = '#2ecc71';
          let status = 'normal';
          if (sewer.value !== null && sewer.value !== undefined) {
            if (sewer.value >= 20) {
              color = '#e74c3c';
              status = 'danger';
            } else if (sewer.value >= 6) {
              color = '#f39c12';
              status = 'warning';
            } else if (sewer.value >= 0) {
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
          <h2 style={{ marginTop: 0, fontSize: 14, fontWeight: 'bold' }}>
            실시간 하수구 위치
            {/* 검색 영역 */}
            <span style={{ marginLeft: 10 }}>
              <input
                type="text"
                placeholder="하수구 이름"
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                style={{ padding: 4, fontSize: 12, borderRadius: 5, border: '1px solid #ccc', marginRight: 4 }}
              />
              <button
                onClick={handleNameSearch}
                style={{ padding: '4px 8px', fontSize: 12, cursor: 'pointer', borderRadius: 5, backgroundColor: '#737574ff', color: 'white', border: 'none' }}
              >
                검색
              </button>
              <input
                type="text"
                placeholder="위도"
                value={inputLat}
                onChange={e => setInputLat(e.target.value)}
                style={{ width: 80, padding: 4, fontSize: 12, borderRadius: 5, border: '1px solid #ccc', marginLeft: 10 }}
              />
              <input
                type="text"
                placeholder="경도"
                value={inputLng}
                onChange={e => setInputLng(e.target.value)}
                style={{ width: 80, padding: 4, fontSize: 12, borderRadius: 5, border: '1px solid #ccc', marginLeft: 4 }}
              />
              <button
                onClick={handleLatLngSearch}
                style={{ padding: '4px 8px', fontSize: 12, cursor: 'pointer', borderRadius: 5, backgroundColor: '#737574ff', color: 'white', border: 'none', marginLeft: 4 }}
              >
                이동
              </button>
            </span>
          </h2>
          <div id="kakao-map" style={{ width: '100%', height: 400, borderRadius: 5, position: 'relative' }} />
        </section>

        {/* 센서 상태 */}
        <section style={{ flex: 1.8, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 기존 센서/모터 카드 */}
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
                borderRadius: 5,
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
                borderRadius: 5,
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
            <h2 style={{ marginTop: 0, fontSize: 14, fontWeight: 'bold', color: '#2c3e50' }}>작동 상태</h2>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ backgroundColor: 'white', borderRadius: 5, border: '1px solid #bdc3c7', flex: 1, padding: 10 }}>
                <p style={{ fontWeight: 'bold', fontSize: 12, color: '#2c3e50' }}>청소 모터</p>
                <p style={{ color: '#27ae60', fontSize: 20, fontWeight: 'bold' }}>{motorStatus.cleanMotor.status}</p>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: 5, border: '1px solid #bdc3c7', flex: 1, padding: 10 }}>
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
          {(() => {
            if (!rainfallData || rainfallData.length === 0) return null;

            const svgWidth = 960;
            const svgHeight = 200;
            const paddingX = 20;
            const maxValue = Math.max(...rainfallData.map(p => p.value)) || 1;

            const points = rainfallData.map((p, i) => {
              const x = paddingX + (i / (rainfallData.length - 1)) * (svgWidth - 2 * paddingX);
              const y = svgHeight - (p.value / maxValue) * svgHeight;
              return { x, y, time: p.time, value: p.value };
            });

            return (
              <>
                <polyline
                  fill="none"
                  stroke="#3498db"
                  strokeWidth="2"
                  points={points.map(p => `${p.x},${p.y}`).join(' ')}
                />
                {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4} fill="#3498db" />)}
                {points.map((p, i) => <text
                  key={i}
                  x={p.x}
                  y={195}
                  fontSize={10}
                  fill="#2c3e50"
                  textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
                >
                  {p.time}
                </text>)}
              </>
            );
          })()}
        </svg>
      </section>
    </div>
  );
};

export default DashboardDesign;
