// ✅ mapdesign.js 전체 코드 (하수구 SVG 포함)

import React from 'react';

const MapDesign = ({
  sewerData,
  selectedSewer,
  activeMenu,
  menuItems,
  onMenuClick,
  onCloseModal,
  getStatusText,
  onDeleteSewer
}) => {
  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#ecf0f1',
    overflow: 'hidden',
  };

  const headerStyle = {
    height: 60,
    backgroundColor: '#2c3e50',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    fontWeight: 'bold',
    fontSize: 18,
    justifyContent: 'space-between',
  };

  const navStyle = {
    position: 'absolute',
    top: 60,
    left: 0,
    width: 200,
    height: 'calc(100% - 60px)',
    backgroundColor: '#34495e',
    padding: '20px 10px',
    boxSizing: 'border-box',
    color: 'white',
  };

  const menuItemStyle = (isActive) => ({
    padding: '6px 12px',
    borderRadius: 5,
    backgroundColor: isActive ? '#3498db' : 'transparent',
    color: isActive ? 'white' : '#bdc3c7',
    cursor: 'pointer',
    userSelect: 'none',
    marginBottom: 10,
  });

  const mainAreaStyle = {
    position: 'absolute',
    top: 80,
    left: 220,
    right: 20,
    bottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    boxShadow: '0 0 4px rgba(0,0,0,.15)',
    border: '2px solid #95a5a6',
    padding: 20,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  };

  const mapTitleStyle = {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const legendStyle = {
    marginTop: 'auto',
    display: 'flex',
    gap: 20,
    paddingTop: 10,
    borderTop: '1px solid #95a5a6',
  };

  const legendItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#2c3e50',
  };

  const circleStyle = (color) => ({
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: color,
  });

  const mapAreaStyle = {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    border: '2px solid #3498db',
    boxShadow: '0 0 4px rgba(0,0,0,.15)',
  };

  const waterLevel = typeof selectedSewer?.waterLevel === 'number' ? selectedSewer.waterLevel : 0;
  const temperature = typeof selectedSewer?.temperature === 'number' ? selectedSewer.temperature : 0;

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>스마트 하수구 관리 시스템</div>
        <div style={{ fontSize: 14, fontWeight: 'normal' }}>관리자님 환영합니다</div>
      </header>

      <nav style={navStyle}>
        <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 10 }}>메뉴</div>
        {menuItems.map((menu) => (
          <div
            key={menu}
            style={menuItemStyle(activeMenu === menu)}
            onClick={() => onMenuClick(menu)}
          >
            {menu}
          </div>
        ))}
      </nav>

      <main style={mainAreaStyle}>
        <div style={mapTitleStyle}>
          {/* 하수구 SVG 아이콘 */}
          <svg width="24" height="24" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" fill="#4a4a4a" stroke="#333" strokeWidth="4"/>
            <g stroke="#666" strokeWidth="2" fill="none">
              <line x1="40" y1="40" x2="40" y2="160"/>
              <line x1="70" y1="30" x2="70" y2="170"/>
              <line x1="100" y1="25" x2="100" y2="175"/>
              <line x1="130" y1="30" x2="130" y2="170"/>
              <line x1="160" y1="40" x2="160" y2="160"/>
              <line x1="40" y1="40" x2="160" y2="40"/>
              <line x1="30" y1="70" x2="170" y2="70"/>
              <line x1="25" y1="100" x2="175" y2="100"/>
              <line x1="30" y1="130" x2="170" y2="130"/>
              <line x1="40" y1="160" x2="160" y2="160"/>
            </g>
            <circle cx="100" cy="100" r="15" fill="#222"/>
            <circle cx="100" cy="100" r="90" fill="none" stroke="#777" strokeWidth="1" opacity="0.5"/>
          </svg>
          <span>하수구 위치</span>
        </div>

        <div id="kakao-map" style={mapAreaStyle} />

        <div style={legendStyle}>
          <div style={legendItemStyle}>
            <div style={circleStyle('#e74c3c')} />
            <span>
              위험 (적재량 80% 이상, {sewerData.filter(s => s.status === 'danger').length}개)
            </span>
          </div>
          <div style={legendItemStyle}>
            <div style={circleStyle('#f39c12')} />
            <span>
              주의 (적재량 60‑80%, {sewerData.filter(s => s.status === 'warning').length}개)
            </span>
          </div>
          <div style={legendItemStyle}>
            <div style={circleStyle('#2ecc71')} />
            <span>
              정상 (적재량 60% 미만, {sewerData.filter(s => s.status === 'normal').length}개)
            </span>
          </div>
        </div>
      </main>

      {selectedSewer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={onCloseModal}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 10,
              padding: 20,
              width: '90%',
              maxWidth: 400,
              boxShadow: '0 10px 30px rgba(0,0,0,.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #eee',
                marginBottom: 15,
              }}
            >
              <h3 style={{ margin: 0, color: '#2c3e50' }}>{selectedSewer.name} 상세 정보</h3>
              <button
                onClick={onCloseModal}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 15 }}>
              <div style={{ padding: 8, background: '#f8f9fa', borderRadius: 5 }}>
                <strong>상태:</strong><br />
                <span style={{ color: selectedSewer.color }}>{getStatusText(selectedSewer.status)}</span>
              </div>
              <div style={{ padding: 8, background: '#f8f9fa', borderRadius: 5 }}>
                <strong>수위:</strong><br />
                {waterLevel.toFixed(1)}%
              </div>
              <div style={{ padding: 8, background: '#f8f9fa', borderRadius: 5 }}>
                <strong>온도:</strong><br />
                {temperature.toFixed(1)}°C
              </div>
              <div style={{ padding: 8, background: '#f8f9fa', borderRadius: 5 }}>
                <strong>최종 업데이트:</strong><br />
                {selectedSewer.lastUpdate || '정보 없음'}
              </div>
              <div style={{ padding: 8, background: '#f8f9fa', borderRadius: 5 }}>
                <strong>위치:</strong><br />
                위도: {selectedSewer.lat}<br />
                경도: {selectedSewer.lng}
              </div>
              <div style={{ padding: 8, background: '#f8f9fa', borderRadius: 5 }}>
                <strong>관리 구역:</strong><br />
                서울시 중구
              </div>
            </div>

            <h4 style={{ margin: '15px 0 10px', color: '#2c3e50' }}>수위 게이지</h4>
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 40,
                backgroundColor: '#ecf0f1',
                borderRadius: 10,
                overflow: 'hidden',
                border: '2px solid #bdc3c7',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: `${waterLevel}%`,
                  height: '100%',
                  backgroundColor: selectedSewer.color,
                  transition: 'width 0.5s ease',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontWeight: 'bold',
                  fontSize: 14,
                  color: '#2c3e50',
                }}
              >
                {waterLevel.toFixed(1)}%
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
              <button
                style={{
                  flex: 1,
                  padding: 10,
                  background: '#e74c3c',
                  color: '#fff',
                  borderRadius: 5,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
                onClick={() => {
                  if (window.confirm('정말로 삭제하시겠습니까?')) {
                    onDeleteSewer(selectedSewer.id);
                  }
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapDesign;
