// alarmdesign.js
import React from 'react';

const AlarmDesign = ({ activeMenu, menuItems, onMenuClick, alerts }) => {
  // 스타일 정의 (생략 없이)
  const containerStyle = {
    width: '100%',
    height: '100vh',
    backgroundColor: '#ecf0f1',
    fontFamily: 'Arial, sans-serif',
    overflow: 'hidden',
    position: 'relative',
  };

  const headerStyle = {
    height: 60,
    backgroundColor: '#2c3e50',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    fontSize: 18,
    fontWeight: 'bold',
  };

  const navStyle = {
    position: 'absolute',
    top: 60,
    left: 0,
    width: 200,
    height: 'calc(100% - 60px)',
    backgroundColor: '#34495e',
    padding: '20px 10px',
    color: 'white',
    boxSizing: 'border-box',
  };

  const menuItemStyle = (isActive) => ({
    padding: '6px 12px',
    borderRadius: 5,
    backgroundColor: isActive ? '#3498db' : 'transparent',
    color: isActive ? 'white' : '#bdc3c7',
    cursor: 'pointer',
    marginBottom: 10,
  });

  const contentStyle = {
    position: 'absolute',
    left: 220,
    top: 60,
    right: 0,
    bottom: 0,
    padding: 20,
    boxSizing: 'border-box',
    overflowY: 'auto',
  };

  const sectionTitle = {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  };

  const cardRowStyle = {
    display: 'flex',
    gap: 20,
    marginBottom: 10,
  };

  const cardStyle = (borderColor) => ({
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    border: `2px solid ${borderColor}`,
  });

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#ecf0f1',
    borderRadius: 5,
    overflow: 'hidden',
  };

  const thStyle = {
    backgroundColor: '#34495e',
    color: 'white',
    padding: '8px 12px',
    fontSize: 12,
  };

  const tdStyle = {
    backgroundColor: 'white',
    padding: '8px 12px',
    fontSize: 12,
    color: '#2c3e50',
    borderBottom: '1px solid #ccc',
  };

  const badgeStyle = (bgColor) => ({
    backgroundColor: bgColor,
    color: 'white',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 10,
  });

  const getStatusColor = (status) => {
    switch (status) {
      case '긴급': return '#e74c3c';
      case '경고': return '#e67e22';
      case '정보': return '#3498db';
      case '완료': return '#27ae60';
      default: return '#7f8c8d';
    }
  };

  const grayBoxStyle = {
    backgroundColor: '#dfe6e9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  };

  const largeGrayBoxStyle = {
    ...grayBoxStyle,
    minHeight: 300,
    padding: 24,
  };

  const searchBoxStyle = {
    marginTop: 12,
    display: 'flex',
    gap: 8,
  };

  const searchInputStyle = {
    flex: 1,
    padding: 6,
    borderRadius: 4,
    border: '1px solid #bdc3c7',
    fontSize: 12,
  };

  const searchBtnStyle = {
    width: 36,
    backgroundColor: '#3498db',
    border: 'none',
    borderRadius: 4,
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  };

  const paginationStyle = {
    marginTop: 12,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 12,
    color: '#2c3e50',
  };

  const pageBtnStyle = {
    width: 40,
    height: 24,
    backgroundColor: '#3498db',
    border: 'none',
    borderRadius: 4,
    color: 'white',
    cursor: 'pointer',
  };

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

      <main style={contentStyle}>
        {/* 알림 현황 */}
        <div style={sectionTitle}>🔔 알림 현황</div>
        <div style={grayBoxStyle}>
          <div style={cardRowStyle}>
            <div style={cardStyle('#e74c3c')}>
              <div style={{ fontSize: 12, color: '#e74c3c' }}>긴급 알림</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#e74c3c' }}>
                {alerts.filter(a => a.level === '긴급').length}건
              </div>
            </div>
            <div style={cardStyle('#e67e22')}>
              <div style={{ fontSize: 12, color: '#e67e22' }}>경고 알림</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#e67e22' }}>
                {alerts.filter(a => a.level === '경고').length}건
              </div>
            </div>
            <div style={cardStyle('#3498db')}>
              <div style={{ fontSize: 12, color: '#3498db' }}>정보 알림</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#3498db' }}>
                {alerts.filter(a => a.level === '정보').length}건
              </div>
            </div>
            <div style={cardStyle('#27ae60')}>
              <div style={{ fontSize: 12, color: '#27ae60' }}>처리 완료</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#27ae60' }}>
                {alerts.filter(a => a.status === '완료').length}건
              </div>
            </div>
          </div>

          <div style={searchBoxStyle}>
            <input type="text" placeholder="알림 검색..." style={searchInputStyle} />
            <button style={searchBtnStyle}>🔍</button>
          </div>
        </div>

        {/* 최근 알림 이력 */}
        <div style={sectionTitle}>📋 최근 알림 이력</div>
        <div style={largeGrayBoxStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>시간</th>
                <th style={thStyle}>유형</th>
                <th style={thStyle}>내용</th>
                <th style={thStyle}>상태</th>
                <th style={thStyle}>조치</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f8f9fa' }}>
                  <td style={tdStyle}>{alert.timestamp}</td>
                  <td style={tdStyle}>
                    <span style={badgeStyle(getStatusColor(alert.level))}>{alert.level}</span>
                  </td>
                  <td style={tdStyle}>{alert.message}</td>
                  <td style={tdStyle}>
                    <span style={badgeStyle(getStatusColor(alert.status))}>{alert.status}</span>
                  </td>
                  <td style={tdStyle}>{alert.action || '확인'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={paginationStyle}>
            <div>총 {alerts.length}건 (1/1 페이지)</div>
            <div>
              <button style={pageBtnStyle}>이전</button>
              <button style={{ ...pageBtnStyle, marginLeft: 8 }}>다음</button>
            </div>
          </div>
        </div>

        {/* 설정 및 수신자 */}
        <div style={sectionTitle}>⚙️ 알림 설정</div>
        <div style={grayBoxStyle}>
          <div>✅ 알림 기준값 설정, 시간대별 알림 제어, 특정 이벤트 활성화 여부 등을 설정할 수 있습니다.</div>
        </div>

        <div style={sectionTitle}>👥 수신자 관리</div>
        <div style={grayBoxStyle}>
          <div>📧 알림을 받을 담당자 목록을 관리하고, 이메일/SMS 수신 여부를 설정할 수 있습니다.</div>
        </div>
      </main>
    </div>
  );
};

export default AlarmDesign;
