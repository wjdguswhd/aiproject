// src/control.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ControlDesign from './assets/controldesign';

const Control = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('장비 제어');

  const menuItems = [
    { name: '지도', path: '/map' },
    { name: '대시보드', path: '/dashboard' },
    { name: '장비 제어', path: '/control' },
    { name: '데이터 분석', path: '/data' },
    { name: '알림 관리', path: '/alarm' },
    { name: '설정', path: '/settings' },
    { name: '시스템 로그', path: '/system-logs' },
  ];

  const onClickMenu = (menu) => {
    setActiveMenu(menu.name);
    navigate(menu.path);
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
        <div style={{ fontSize: 14, fontWeight: 'normal' }}>관리자님 환영합니다</div>
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

      {/* 메인 콘텐츠 */}
      <main style={{
        marginLeft: 200,
        marginTop: 60,
        height: 'calc(100vh - 60px)',
        overflowY: 'auto',
        backgroundColor: '#ecf0f1',
        padding: 20,
      }}>
        <ControlDesign />
      </main>
    </div>
  );
};

export default Control;
