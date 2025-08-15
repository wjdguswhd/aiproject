// datadesign.js
import React from 'react';

const DataDesign = ({
  activeMenu,
  menuItems,
  onMenuClick,
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
}) => {
  const layout = {
    container: {
      width: '100%',
      height: '100vh',
      backgroundColor: '#ecf0f1',
      position: 'relative',
      fontFamily: 'Arial, sans-serif',
    },
    header: {
      height: 60,
      backgroundColor: '#2c3e50',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      fontWeight: 'bold',
      fontSize: 18,
    },
    nav: {
      position: 'absolute',
      top: 60,
      left: 0,
      width: 200,
      height: 'calc(100% - 60px)',
      backgroundColor: '#34495e',
      color: 'white',
      padding: 20,
      boxSizing: 'border-box',
    },
    menuItem: (isActive) => ({
      padding: '8px 12px',
      borderRadius: 5,
      backgroundColor: isActive ? '#3498db' : 'transparent',
      color: isActive ? 'white' : '#bdc3c7',
      marginBottom: 8,
      cursor: 'pointer',
    }),
    content: {
      position: 'absolute',
      top: 60,
      left: 200,
      right: 0,
      bottom: 0,
      padding: 20,
      overflowY: 'auto',
      boxSizing: 'border-box',
    },
    section: {
      backgroundColor: '#ecf0f1',
      borderRadius: 10,
      padding: 20,
      marginBottom: 20,
      boxShadow: '0 0 4px rgba(0,0,0,0.1)',
      border: '1px solid #bdc3c7',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#2c3e50',
    },
    input: {
      padding: 6,
      marginRight: 10,
      borderRadius: 4,
      border: '1px solid #bdc3c7',
    },
    button: {
      padding: '6px 12px',
      borderRadius: 4,
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
    },
  };

  return (
    <div style={layout.container}>
      {/* Header */}
      <header style={layout.header}>
        <div>스마트 하수구 관리 시스템</div>
        <div style={{ fontSize: 14, fontWeight: 'normal' }}>관리자님 환영합니다</div>
      </header>

      {/* Navigation */}
      <nav style={layout.nav}>
        <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 10 }}>메뉴</div>
        {menuItems.map((menu) => (
          <div
            key={menu}
            style={layout.menuItem(activeMenu === menu)}
            onClick={() => onMenuClick(menu)}
          >
            {menu}
          </div>
        ))}
      </nav>

      {/* Content */}
      <div style={layout.content}>
        {/* 기간 필터 */}
        <div style={layout.section}>
          <div style={layout.sectionTitle}>분석 기간 설정</div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChangeStartDate(e.target.value)}
            style={layout.input}
          />
          ~
          <input
            type="date"
            value={endDate}
            onChange={(e) => onChangeEndDate(e.target.value)}
            style={layout.input}
          />
          <button style={layout.button}>조회</button>
        </div>

        {/* 쓰레기 적재량 추이 그래프 */}
        <div style={layout.section}>
          <div style={layout.sectionTitle}>📈 쓰레기 적재량 추이</div>
          <div style={{ height: 250, backgroundColor: 'white', borderRadius: 6 }}>[그래프 영역]</div>
        </div>

        {/* 강우 예측 vs 실제 */}
        <div style={layout.section}>
          <div style={layout.sectionTitle}>🌧 강우 예측 vs 실제</div>
          <div style={{ height: 250, backgroundColor: 'white', borderRadius: 6 }}>[바 차트 영역]</div>
        </div>

        {/* 캘린더 */}
        <div style={layout.section}>
          <div style={layout.sectionTitle}>📅 위험 시점 예측 캘린더</div>
          <div style={{ height: 140, backgroundColor: 'white', borderRadius: 6 }}>[캘린더 컴포넌트]</div>
        </div>

        {/* 통계 요약 */}
        <div style={layout.section}>
          <div style={layout.sectionTitle}>📊 통계 요약</div>
          <div style={{ padding: 10, backgroundColor: 'white', borderRadius: 6 }}>
            <div>• 평균 적재량: 67.3%</div>
            <div>• 최대 적재량: 89.1%</div>
            <div>• 청소 횟수: 3회</div>
            <div>• 강우 일수: 2일</div>
            <br />
            <div><strong>예측 정확도</strong></div>
            <div>• 적재량 예측: 87.3%</div>
            <div>• 강우 예측: 92.1%</div>
            <div>• 위험도 예측: 84.7%</div>
            <br />
            <div><strong>권장 사항</strong></div>
            <div>• 수요일 오전 청소 권장</div>
            <div>• 강우 예보 시 사전 청소</div>
            <div>• 센서 캘리브레이션 필요</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDesign;
