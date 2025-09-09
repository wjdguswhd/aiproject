// src/dashboard.js
import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardDesign from './assets/dashboarddesign';

// ✅ fetchRainfallData 수정: lat/lng 파라미터 추가
const fetchRainfallData = async (lat = 37.5665, lng = 126.978) => {
  const convertToGrid = (lat, lng) => {
    const nx = Math.floor(lng);
    const ny = Math.floor(lat);
    return { nx, ny };
  };

  const { nx, ny } = convertToGrid(lat, lng);
  const serviceKey = 'UoGmzVA0AHL%2BoigVPaUAZ9TKIrAXeIti%2FO9MY2K9mJBV9%2B1ZUmnNQnvSlofZgma8ZWHYMO0rGXWslkOvP45kdg%3D%3D';
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const baseDate = `${yyyy}${mm}${dd}`;

  let hour = now.getHours();
  let minute = now.getMinutes();
  let baseTime;
  if (minute < 30) {
    hour = hour - 1;
    if (hour < 0) hour = 23;
    baseTime = `${String(hour).padStart(2, '0')}30`;
  } else {
    baseTime = `${String(hour).padStart(2, '0')}00`;
  }

  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey=${serviceKey}&pageNo=1&numOfRows=60&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    let result;
    try { result = JSON.parse(text); } catch { return []; }
    const items = result?.response?.body?.items?.item || [];
    const rainfallItems = items.filter(item => item.category === 'RN1');
    return rainfallItems.map(item => {
      const hour = item.fcstTime?.slice(0, 2) || '';
      const min = item.fcstTime?.slice(2, 4) || '';
      return { time: `${hour}:${min}`, value: parseFloat(item.fcstValue) || 0 };
    });
  } catch (error) {
    console.error('기상청 API 호출 오류:', error);
    return [];
  }
};

// ------------------- Dashboard 컴포넌트 -------------------
const Dashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('대시보드');

  const [sensorsStatus, setSensorsStatus] = useState({
    trashLevel: null,
    trashLevelStatus: '데이터 없음',
    trashLevelColor: '#95a5a6',
    collectionBox: null,
    collectionBoxStatus: '데이터 없음',
    collectionBoxColor: '#95a5a6',
    rainfallStatus: '강수량 없음',
    rainfallColor: '#95a5a6',
  });

  const [motorStatus, setMotorStatus] = useState({
    cleanMotor: { status: '대기' },
    rainSensor: { status: '대기'},
  });

  const [rainfallData, setRainfallData] = useState([]);
  const [sewerData, setSewerData] = useState([]);
  const prevRainfallValue = useRef(null);

  const [emergencyAlert, setEmergencyAlert] = useState({
    message: '3번 하수구 적재량 90% 초과 - 즉시 청소 필요',
    onConfirm: () => {
      alert('알림 확인 처리 완료');
      setEmergencyAlert(null);
    },
  });

  const menuItems = [
    { name: '지도', path: '/map' },
    { name: '대시보드', path: '/dashboard' },
    { name: '장비 제어', path: '/control' },
    { name: '알림 관리', path: '/alarm' },
    { name: '데이터 분석', path: '/data' },
    { name: '설정', path: '/settings' },
    { name: '시스템 로그', path: '/system-logs' },
  ];

  const onClickMenu = (menu) => {
    setActiveMenu(menu.name);
    navigate(menu.path);
  };

  // ✅ 페이지 로딩 시 백엔드에서 하수구 데이터 GET
  useEffect(() => {
    const fetchSewerData = async () => {
  try {
    const res = await axios.get('http://192.168.0.2:8000/api/accountapp/drains/');
    const formattedData = await Promise.all(
      res.data.map(async (item) => {
        let value = 0;
        try {
          const sensorRes = await axios.post(
            'http://192.168.0.2:8000/api/accountapp/sensorvalue/',
            {
              region: item.region || '경기도',
              sub_region: item.sub_region || '고양시',
              name: item.name
            },
            { headers: { 'Content-Type': 'application/json' } }
          );
          if (sensorRes.data && sensorRes.data.length > 0) {
            value = sensorRes.data[0].value;
          }
        } catch (err) {
          console.error(`Sensor value 가져오기 실패 (하수구 ${item.name}):`, err);
        }

        // value 기준 상태 계산
        const getStatusAndColor = (val) => {
          if (val === null || val === undefined) return { status: 'normal', color: '#2ecc71' };
          if (val >= 20) return { status: 'danger', color: '#e74c3c' };
          if (val >= 15) return { status: 'warning', color: '#f39c12' };
          return { status: 'normal', color: '#2ecc71' };
        };

        const { status, color } = getStatusAndColor(value);

        return {
          id: item.id,
          name: item.name || item.location || `하수구-${item.id}`,
          lat: item.latitude || item.lat || 37.5665,
          lng: item.longitude || item.lng || 126.9780,
          value,
          status,
          color,
          waterLevel: item.waterLevel || 0,
          temperature: item.temperature || 0,
          lastUpdate: item.last_updated || item.lastUpdate || '',
        };
      })
    );
    setSewerData(formattedData);
  } catch (error) {
    console.error('하수구 목록 불러오기 실패:', error);
  }
};


    fetchSewerData();
  }, []);

  // ✅ 하수구 클릭 시 POST 방식으로 sensor value 조회
  const handleSewerMarkerClick = async (sewer) => {
    try {
      const postData = {
        region: sewer.region || "경기도",
        sub_region: sewer.sub_region || "고양시",
        name: sewer.name
      };

      const response = await axios.post(
        "http://192.168.0.2:8000/api/accountapp/sensorvalue/",
        postData,
        { headers: { "Content-Type": "application/json" } }
      );

      const value = response.data && response.data.length > 0 ? response.data[0].value : null;

      const calcStatus = (val) => {
        if (val === null || val === undefined) return { status: "데이터 없음", color: "#95a5a6" };
        if (val >= 20) return { status: "danger", color: "#e74c3c" };
        if (val >= 15) return { status: "warning", color: "#f39c12" };
        return { status: "normal", color: "#2ecc71" };
      };

      const collectionBoxStatus = calcStatus(value);

      setSensorsStatus((prev) => ({
        ...prev,
        collectionBox: value,
        collectionBoxStatus: collectionBoxStatus.status === 'danger' ? '경고' :
                              collectionBoxStatus.status === 'warning' ? '주의' :
                              collectionBoxStatus.status === 'normal' ? '안정' : '데이터 없음',
        collectionBoxColor: collectionBoxStatus.color,
      }));

      setSewerData((prev) =>
        prev.map((s) =>
          s.id === sewer.id
            ? { ...s, color: collectionBoxStatus.color, status: collectionBoxStatus.status }
            : s
        )
      );

      const rainData = await fetchRainfallData(sewer.lat, sewer.lng);
      const latestRainValue = rainData.length > 0 ? rainData[rainData.length - 1].value : 0;

      setSensorsStatus((prev) => ({
        ...prev,
        rainfallStatus: latestRainValue > 0 ? '강우 중' : '강수량 없음',
        rainfallColor: latestRainValue > 0 ? '#3498db' : '#95a5a6',
      }));

      setRainfallData(rainData);

    } catch (error) {
      if (error.response) {
        console.error("서버 응답 데이터:", error.response.data);
      } else {
        console.error("하수구 클릭 POST/강수량 호출 실패:", error);
      }
    }
  };

  // ------------------- 렌더링 -------------------
  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      {/* 헤더 */}
      <header style={{
        height: 60, backgroundColor: '#2c3e50', color: 'white',
        display: 'flex', alignItems: 'center', padding: '0 20px',
        fontWeight: 'bold', fontSize: 18, justifyContent: 'space-between',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000
      }}>
        <div>스마트 하수구 관리 시스템</div>
        <div style={{ fontSize: 14, fontWeight: 'normal' }}>관리자</div>
      </header>

      {/* 네비게이션 */}
      <nav style={{
        position: 'fixed', top: 60, left: 0, width: 200,
        height: 'calc(100vh - 60px)', backgroundColor: '#34495e',
        padding: '20px 10px', color: 'white', boxSizing: 'border-box',
        overflowY: 'auto', zIndex: 999
      }}>
        <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 10 }}>메뉴</div>
        {menuItems.map((menu) => (
          <div key={menu.name} onClick={() => onClickMenu(menu)}
            style={{
              padding: '6px 12px',
              borderRadius: 5,
              backgroundColor: activeMenu === menu.name ? '#3498db' : 'transparent',
              color: activeMenu === menu.name ? 'white' : '#bdc3c7',
              cursor: 'pointer',
              userSelect: 'none',
              marginBottom: 10
            }}>
            {menu.name}
          </div>
        ))}
      </nav>

      {/* 메인 콘텐츠 */}
      <main style={{
        marginLeft: 200, marginTop: 60,
        height: 'calc(100vh - 60px)',
        overflowY: 'auto', backgroundColor: '#ecf0f1', padding: 20
      }}>
        <DashboardDesign
          activeMenu={activeMenu}
          onMenuClick={setActiveMenu}
          emergencyAlert={emergencyAlert}
          sensorsStatus={sensorsStatus}
          motorStatus={motorStatus}
          rainfallData={rainfallData}
          sewerData={sewerData}
          onSewerMarkerClick={handleSewerMarkerClick}
        />
      </main>
    </div>
  );
};

export default Dashboard;
