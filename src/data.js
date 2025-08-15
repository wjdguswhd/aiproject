// data.js
import React, { useState, useEffect } from 'react';
import DataDesign from './assets/datadesign';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  '지도', '대시보드', '장비 제어', '데이터 분석', '알림 관리', '설정', '시스템 로그'
];

const Data = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('데이터 분석');

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    const pathMap = {
      '지도': '/map',
      '대시보드': '/dashboard',
      '장비 제어': '/control',
      '데이터 분석': '/data',
      '알림 관리': '/alarm',
      '설정': '/setting',
      '시스템 로그': '/log',
    };
    navigate(pathMap[menu] || '/');
  };

  return (
    <DataDesign
      activeMenu={activeMenu}
      menuItems={menuItems}
      onMenuClick={handleMenuClick}
    />
  );
};

export default Data;
