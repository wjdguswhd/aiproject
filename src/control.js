import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ControlDesign from './assets/controldesign';

const Control = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('장비 제어');

  const menuItems = [
    { name: '지도', path: '/map' },
    { name: '대시보드', path: '/dashboard' },
    { name: '장비 제어', path: '/control' },
    { name: '알림 관리', path: '/alarm' },
    { name: '데이터 분석', path: '/data' },
    { name: '설정', path: '/settings' },
    { name: '시스템 로그', path: '/system-logs' },
  ];

  const [drainList, setDrainList] = useState([]);
  const [selectedDrain, setSelectedDrain] = useState('');

  useEffect(() => {
    axios.get('http://192.168.0.2:8000/api/accountapp/drains/')
      .then(res => setDrainList(res.data))
      .catch(err => console.error(err));
  }, []);

  const onClickMenu = (menu) => {
    setActiveMenu(menu.name);
    navigate(menu.path);
  };

  // 하드웨어 제어
  const handleManualStart = async () => {
    if (!selectedDrain) return alert('하수구를 선택하세요');
    try {
      await axios.post('http://192.168.0.2:8000/api/control/start/', { drain_name: selectedDrain });
      return { success: true, device: '청소 모터', task: '수동 시작' };
    } catch (err) {
      alert('제어 시작 실패');
      return { success: false, device: '청소 모터', task: '수동 시작' };
    }
  };

  const handleManualStop = async () => {
    if (!selectedDrain) return alert('하수구를 선택하세요');
    try {
      await axios.post('http://192.168.0.2:8000/api/control/stop/', { drain_name: selectedDrain });
      return { success: true, device: '청소 모터', task: '수동 정지' };
    } catch (err) {
      alert('제어 정지 실패');
      return { success: false, device: '청소 모터', task: '수동 정지' };
    }
  };

  // 예약 청소 POST
  const handleScheduleSave = async (startTime, endTime, selectedDays) => {
    if (!selectedDrain) return alert('하수구를 선택하세요');
    try {
      await axios.post('http://192.168.0.2:8000/api/control/schedule/', {
        drain_name: selectedDrain,
        start_time: startTime,
        end_time: endTime,
        days: selectedDays
      });
      alert('스케줄 저장 완료');
      return true;
    } catch (err) {
      alert('스케줄 저장 실패');
      return false;
    }
  };

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      {/* Header */}
      <header style={{
        height: 60, backgroundColor: '#2c3e50', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', fontWeight: 'bold', fontSize: 18,
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      }}>
        <div>스마트 하수구 관리 시스템</div>
        <div style={{ fontSize: 14, fontWeight: 'normal' }}>관리자</div>
      </header>

      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 60, left: 0, width: 200, height: 'calc(100vh - 60px)',
        backgroundColor: '#34495e', padding: '20px 10px', color: 'white',
        boxSizing: 'border-box', overflowY: 'auto', zIndex: 999,
      }}>
        <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 10 }}>메뉴</div>
        {menuItems.map((menu) => (
          <div
            key={menu.name}
            onClick={() => onClickMenu(menu)}
            style={{
              padding: '6px 12px',
              borderRadius: 5,
              backgroundColor: activeMenu === menu.name ? '#3498db' : 'transparent',
              color: activeMenu === menu.name ? 'white' : '#bdc3c7',
              cursor: 'pointer',
              userSelect: 'none',
              marginBottom: 10,
            }}
          >
            {menu.name}
          </div>
        ))}
      </nav>

      {/* Main Content */}
      <main style={{
        marginLeft: 200,
        marginTop: 60,
        height: 'calc(100vh - 60px)',
        overflowY: 'auto',
        backgroundColor: '#ecf0f1',
        padding: 20,
      }}>
        <ControlDesign
          drainList={drainList}
          selectedDrain={selectedDrain}
          onSelectDrain={setSelectedDrain}
          onManualStart={handleManualStart}
          onManualStop={handleManualStop}
          onScheduleSave={handleScheduleSave} // 추가
        />
      </main>
    </div>
  );
};

export default Control;
