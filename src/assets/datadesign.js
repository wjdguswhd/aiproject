import React from 'react';

const DataDesign = ({ activeMenu, menuItems, onMenuClick, kakaoMap, teams, selectedTeam, onSelectTeam, onStartNavigationToTask }) => {
  const containerStyle = { position: 'relative', width: '100%', height: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#ecf0f1', overflow: 'hidden' };
  const headerStyle = { height: 60, backgroundColor: '#2c3e50', color: 'white', display: 'flex', alignItems: 'center', padding: '0 20px', fontWeight: 'bold', fontSize: 18, justifyContent: 'space-between' };
  const navStyle = { position: 'absolute', top: 60, left: 0, width: 200, height: 'calc(100% - 60px)', backgroundColor: '#34495e', padding: '20px 10px', boxSizing: 'border-box', color: 'white', overflowY: 'auto' };
  const menuItemStyle = (isActive) => ({ padding: '6px 12px', borderRadius: 5, backgroundColor: isActive ? '#3498db' : 'transparent', color: isActive ? 'white' : '#bdc3c7', cursor: 'pointer', userSelect: 'none', marginBottom: 10 });
  const mainAreaStyle = { position: 'absolute', top: 80, left: 220, right: 20, bottom: 20, backgroundColor: 'white', borderRadius: 10, boxShadow: '0 0 4px rgba(0,0,0,.15)', border: '2px solid #95a5a6', padding: 20, boxSizing: 'border-box', display: 'flex', flexDirection: 'row', gap: 20 };
  const mapAreaStyle = { flex: 3, borderRadius: 5, overflow: 'hidden', border: '2px solid #3498db', boxShadow: '0 0 4px rgba(0,0,0,.15)' };
  const sidePanelStyle = { flex: 1.2, display: 'flex', flexDirection: 'column', border: '1px solid #bdc3c7', borderRadius: 8, padding: 10, backgroundColor: '#f8f9fa', overflowY: 'auto' };
  const teamCardStyle = (isActive) => ({
    border: `2px solid ${isActive ? '#3498db' : '#ccc'}`,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: isActive ? '#ecf6fd' : 'white',
    cursor: 'pointer'
  });

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>스마트 하수구 관리 시스템</div>
        <div style={{ fontSize: 14, fontWeight: 'normal' }}>관리자</div>
      </header>

      <nav style={navStyle}>
        <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 10 }}>메뉴</div>
        {menuItems.map(menu => (
          <div key={menu} style={menuItemStyle(activeMenu === menu)} onClick={() => onMenuClick(menu)}>
            {menu}
          </div>
        ))}
      </nav>

      <main style={mainAreaStyle}>
        <div id="kakao-map" style={mapAreaStyle} />

        <div style={sidePanelStyle}>
          <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>팀별 작업 안내</div>
          {teams.map(team => (
            <div
              key={team.team_id}
              style={teamCardStyle(selectedTeam && selectedTeam.team_id === team.team_id)}
              onClick={() => onSelectTeam(team)}
            >
              <div style={{ fontWeight: 'bold', marginBottom: 5 }}>{team.team_name}</div>
              <div style={{ fontSize: 12, color: '#555' }}>작업 수: {team.tasks.length}</div>

              {/* 각 task별 단일 길 안내 버튼 */}
              <ul style={{ marginTop: 5, paddingLeft: 15, fontSize: 12 }}>
                {team.tasks.map((task, idx) => (
                  <li key={idx} style={{ marginBottom: 5 }}>
                    <div>{task.location_name}</div>
                    <div style={{ fontSize: 11, color: '#555' }}>예정시작: {task.scheduled_start}</div>
                    <div style={{ fontSize: 11, color: '#555' }}>예정종료: {task.scheduled_end}</div>
                    <div style={{ fontSize: 11, color: '#555' }}>예상 소요: {task.estimated_duration_min}분</div>
                    <button
                      style={{
                        marginTop: 2,
                        fontSize: 11,
                        padding: '2px 4px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: 2,
                        cursor: 'pointer'
                      }}
                      onClick={() => onStartNavigationToTask(task, team)}
                    >
                      길 안내
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DataDesign;
