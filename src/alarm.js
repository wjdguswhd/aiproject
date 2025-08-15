// alarm.js
import React, { useState, useEffect } from 'react';
import AlarmDesign from './assets/alarmdesign';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const menuItems = [
  '지도', '대시보드', '장비 제어', '데이터 분석', '알림 관리', '설정', '시스템 로그'
];

const Alarm = () => {
  const [activeMenu, setActiveMenu] = useState('알림 관리');
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/alerts')
      .then((res) => setAlerts(res.data))
      .catch((err) => console.error('알림 불러오기 오류:', err));
  }, []);

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    switch (menu) {
      case '지도':
        navigate('/map');
        break;
      case '대시보드':
        navigate('/dashboard');
        break;
      case '장비 제어':
        navigate('/control');
        break;
      case '데이터 분석':
        navigate('/data');
        break;
      case '알림 관리':
        navigate('/alarm');
        break;
      case '설정':
        navigate('/settings');
        break;
      case '시스템 로그':
        navigate('/logs');
        break;
      default:
        break;
    }
  };

  return (
    <AlarmDesign
      activeMenu={activeMenu}
      menuItems={menuItems}
      onMenuClick={handleMenuClick}
      alerts={alerts}
    />
  );
};

export default Alarm;
