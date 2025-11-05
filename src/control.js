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
    { name: '스케줄링', path: '/alarm' },
    { name: '경로 안내', path: '/data' }
  ];

  const [drainList, setDrainList] = useState([]);
  const [selectedDrain, setSelectedDrain] = useState('');
  const [scheduleInterval, setScheduleInterval] = useState(null); // 수정: interval 상태 추가

  useEffect(() => {
    axios.get('http://192.168.79.45:8000/api/accountapp/drains/')
      .then(res => setDrainList(res.data))
      .catch(err => console.error(err));
  }, []);

  const onClickMenu = (menu) => {
    setActiveMenu(menu.name);
    navigate(menu.path);
  };

  // 하드웨어 제어
  const handleManualStart = async () => {
    try {
      await axios.post('http://192.168.122.196:5001/motor', { command: 'forward' });
      console.log('✅ 수동 모터 시작 POST 성공');
      return { success: true, device: '청소 모터', task: '수동 시작' };
    } catch (err) {
      console.error('❌ 수동 모터 시작 POST 실패', err);
      alert('제어 시작 실패');
      return { success: false, device: '청소 모터', task: '수동 시작' };
    }
  };

  const handleManualStop = async () => {
    try {
      await axios.post('http://192.168.122.196:5001/motor', { command: 'stop' });
      console.log('✅ 수동 모터 정지 POST 성공');
      return { success: true, device: '청소 모터', task: '수동 정지' };
    } catch (err) {
      console.error('❌ 수동 모터 정지 POST 실패', err);
      alert('제어 정지 실패');
      return { success: false, device: '청소 모터', task: '수동 정지' };
    }
  };

  // 예약 청소 프론트 처리 (요일 + 시간 체크, 초 단위 정확 실행)
  const handleScheduleSaveFront = (startTime, endTime, selectedDays) => {
    const drainName = selectedDrain || '기본 하수구';
    console.log(`📅 예약 저장 요청: 하수구=${drainName}, 시작=${startTime}, 종료=${endTime}, 요일=${selectedDays}`);

    const parseTime = (timeStr) => {
      let [h, m, s, period] = timeStr.split(/[: ]/);
      h = Number(h);
      m = Number(m);
      s = Number(s);
      if (period === '오후' && h < 12) h += 12;
      if (period === '오전' && h === 12) h = 0;
      return h * 60 + m + s / 60;
    };

    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);

    const dayMap = { '일':0, '월':1, '화':2, '수':3, '목':4, '금':5, '토':6 };
    const selectedDayNums = selectedDays.map(d => dayMap[d]);

    let alreadyStarted = false;
    let alreadyStopped = false;

    if (scheduleInterval) clearInterval(scheduleInterval); // 이전 interval 제거

    const intervalId = setInterval(async () => {
      const now = new Date();
      const todayDay = now.getDay();
      if (!selectedDayNums.includes(todayDay)) return;

      const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

      if (currentMinutes >= startMinutes && currentMinutes < startMinutes + 1/60 && !alreadyStarted) {
        console.log('🚀 예약 시간 도달, 모터 실행 시작');
        alreadyStarted = true;
        alreadyStopped = false;
        await handleManualStart();
      }

      if (currentMinutes >= endMinutes && currentMinutes < endMinutes + 1/60 && !alreadyStopped) {
        console.log('🛑 예약 종료, 모터 정지');
        alreadyStopped = true;
        alreadyStarted = false;
        await handleManualStop();
      }
    }, 1000);

    setScheduleInterval(intervalId);

    return Promise.resolve(true); // 저장 성공 Promise 반환
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
          onScheduleSave={handleScheduleSaveFront} // 프론트 예약 적용
        />
      </main>
    </div>
  );
};

export default Control;
