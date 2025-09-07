import React from 'react';

const AlarmDesign = ({ activeMenu, menuItems, schedules, onMenuClick, onStatusChange, onCreateSchedule, statusFilter, onStatusFilterChange }) => {

  // --- 공통 스타일 ---
  const containerStyle = { 
    width: '100%', 
    height: '100vh', 
    backgroundColor: '#ecf0f1', 
    fontFamily: 'Arial, sans-serif', 
    overflow: 'hidden', 
    position: 'relative' 
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
    fontWeight: 'bold' 
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
    boxSizing: 'border-box' 
  };
  const menuItemStyle = (isActive) => ({ 
    padding: '6px 12px', 
    borderRadius: 5, 
    backgroundColor: isActive ? '#3498db' : 'transparent', 
    color: isActive ? 'white' : '#bdc3c7', 
    cursor: 'pointer', 
    marginBottom: 10 
  });
  const contentStyle = { 
    position: 'absolute', 
    left: 220, 
    top: 60, 
    right: 0, 
    bottom: 0, 
    padding: 20, 
    boxSizing: 'border-box', 
    overflowY: 'scroll' 
  };
  const titleStyle = { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 };
  const statsContainerStyle = { display: 'flex', gap: 15, marginBottom: 25, flexWrap: 'wrap' };
  const statCardStyle = { backgroundColor: 'white', padding: '15px 20px', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: '1 1 180px', textAlign: 'center' };
  const statNumberStyle = { fontSize: 24, fontWeight: 'bold', marginBottom: 5 };
  const statLabelStyle = { fontSize: 12, color: '#7f8c8d', fontWeight: '500' };
  const tableContainerStyle = { backgroundColor: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
  const tableHeaderStyle = { backgroundColor: '#34495e', color: 'white', padding: '15px 20px', fontSize: 16, fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }; // fixed layout 추가
  const thStyle = { backgroundColor: '#2c3e50', color: 'white', padding: '12px 15px', fontSize: 13, fontWeight: '600', textAlign: 'left' };
  const tdStyle = { backgroundColor: 'white', padding: '12px 15px', fontSize: 13, color: '#2c3e50', borderBottom: '1px solid #ecf0f1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

  const statusBadgeStyle = (status) => {
    const colors = {
      'scheduled': { bg: '#3498db', text: '예정됨' },
      'done': { bg: '#27ae60', text: '완료됨' },
      'cancelled': { bg: '#e74c3c', text: '취소됨' }
    };
    const style = colors[status] || colors['scheduled'];
    return { backgroundColor: style.bg, color: 'white', padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: '600', display: 'inline-block', minWidth: 48, textAlign: 'center' };
  };

  const riskBadgeStyle = (risk) => {
    let bgColor;
    if (risk >= 80) { bgColor = '#e74c3c'; }
    else if (risk >= 60) { bgColor = '#f39c12'; }
    else if (risk >= 40) { bgColor = '#f1c40f'; }
    else { bgColor = '#27ae60'; }
    return { backgroundColor: bgColor, color: 'white', padding: '3px 6px', borderRadius: 10, fontSize: 11, fontWeight: '600', display: 'inline-block' };
  };

  const formatRisk = (risk) => Number.isInteger(risk) ? risk : risk.toFixed(1);
  const getStatusText = (status) => ({ 'scheduled': '예정됨', 'done': '완료됨', 'cancelled': '취소됨' }[status] || status);
  const formatUTCDate = (datetime) => new Date(datetime).toISOString().slice(0,10);
  const formatUTCTime = (datetime) => new Date(datetime).toISOString().slice(11,16);

  const totalSchedules = schedules.length;
  const scheduledCount = schedules.filter(s => s.status === 'scheduled').length;
  const completedCount = schedules.filter(s => s.status === 'done').length;
  const highRiskCount = schedules.filter(s => s.risk_score >= 80).length;

  const filteredSchedules = statusFilter === "all" ? schedules : schedules.filter(s => s.status === statusFilter);

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>스마트 하수구 관리 시스템</div>
        <div style={{ fontSize: 14, fontWeight: 'normal' }}>관리자</div>
      </header>

      <nav style={navStyle}>
        <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 10 }}>메뉴</div>
        {menuItems.map(menu => (
          <div key={menu} style={menuItemStyle(activeMenu === menu)} onClick={() => onMenuClick(menu)}>{menu}</div>
        ))}
      </nav>

      <main style={contentStyle}>
        <div style={titleStyle}>AI 스케줄링</div>

        <div style={statsContainerStyle}>
          <div style={statCardStyle}><div style={{...statNumberStyle, color: '#3498db'}}>{totalSchedules}</div><div style={statLabelStyle}>전체 스케줄</div></div>
          <div style={statCardStyle}><div style={{...statNumberStyle, color: '#f39c12'}}>{scheduledCount}</div><div style={statLabelStyle}>예정된 작업</div></div>
          <div style={statCardStyle}><div style={{...statNumberStyle, color: '#2ecc71'}}>{completedCount}</div><div style={statLabelStyle}>완료된 작업</div></div>
          <div style={statCardStyle}><div style={{...statNumberStyle, color: '#e74c3c'}}>{highRiskCount}</div><div style={statLabelStyle}>위험 지역</div></div>
        </div>

        <div style={tableContainerStyle}>
          <div style={tableHeaderStyle}>
            <span>스케줄 목록 ({filteredSchedules.length}개)</span>
            <button 
              onClick={onCreateSchedule}
              style={{ fontSize: 12, padding: '8px 8px', borderRadius: 4, border: 'none', backgroundColor: '#3498db', color: 'white', cursor: 'pointer' }}
            >
              스케줄 만들기
            </button>
          </div>

          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>팀</th>
                <th style={thStyle}>하수구 ID</th>
                <th style={thStyle}>위치 좌표</th>
                <th style={thStyle}>예정 시작</th>
                <th style={thStyle}>예정 종료</th>
                <th style={thStyle}>소요시간</th>
                <th style={thStyle}>위험도</th>
                <th style={thStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 120 }}>
                    상태
                    <select
                      value={statusFilter}
                      onChange={(e) => onStatusFilterChange(e.target.value)}
                      style={{ fontSize: 11, padding: '2px 4px', borderRadius: 4, border: '1px solid #bdc3c7', backgroundColor: 'white', color: '#2c3e50' }}
                    >
                      <option value="all">전체</option>
                      <option value="scheduled">예정</option>
                      <option value="done">완료</option>
                    </select>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((s, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f8f9fa' }}>
                  <td style={tdStyle}><span style={{ backgroundColor: '#ecf0f1', color: '#2c3e50', padding: '3px 6px', borderRadius: 4, fontSize: 11, fontWeight: '600' }}> {s.assigned_crew}</span></td>
                  <td style={tdStyle}><span style={{ fontWeight: '600', color: '#2c3e50' }}>#{s.drain}</span></td>
                  <td style={tdStyle}><div style={{ fontSize: 11, color: '#7f8c8d' }}>{s.lat.toFixed(5)}<br/>{s.lng.toFixed(5)}</div></td>
                  <td style={tdStyle}><div style={{ fontSize: 12, fontWeight: '500' }}>{formatUTCDate(s.scheduled_start)}</div><div style={{ fontSize: 11, color: '#7f8c8d' }}>{formatUTCTime(s.scheduled_start)}</div></td>
                  <td style={tdStyle}><div style={{ fontSize: 12, fontWeight: '500' }}>{formatUTCDate(s.scheduled_end)}</div><div style={{ fontSize: 11, color: '#7f8c8d' }}>{formatUTCTime(s.scheduled_end)}</div></td>
                  <td style={tdStyle}><span style={{ backgroundColor: '#ecf0f1', color: '#2c3e50', padding: '3px 6px', borderRadius: 4, fontSize: 11, fontWeight: '600' }}>{s.estimated_duration_min}분</span></td>
                  <td style={tdStyle}><span style={riskBadgeStyle(s.risk_score)}>{formatRisk(s.risk_score)}</span></td>
                  <td style={tdStyle}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 22, minWidth: 64 }}>
    <span style={statusBadgeStyle(s.status)}>{getStatusText(s.status)}</span>
    {s.status !== 'done' && (
      <select
        defaultValue="select"
        onChange={(e) => { if (e.target.value !== "select") onStatusChange(s.id, e.target.value); }}
        style={{
          fontSize: 11,
          padding: '2px 4px',
          borderRadius: 4,
          border: '1px solid #bdc3c7',
          backgroundColor: 'white',
          color: '#2c3e50',
          minWidth: 64,
          height: 22,
          lineHeight: '22px'
        }}
      >
        <option value="select" disabled>선택</option>
        <option value="done">완료</option>
      </select>
    )}
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AlarmDesign;
