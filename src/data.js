import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DataDesign from './assets/datadesign';

const menuItems = [
  '지도', '대시보드', '장비 제어', '알림 관리', '데이터 분석', '설정', '시스템 로그'
];

// 테스트용 팀/하수구 데이터
const TEST_TEAMS = [
  {
    team_id: 1,
    team_name: "1팀",
    tasks: [
      { location_name: "하수구 A", latitude: 37.5665, longitude: 126.9780, risk_level: "위험", scheduled_start: "09:00", scheduled_end: "09:30", estimated_duration_min: 30 },
      { location_name: "하수구 B", latitude: 37.5650, longitude: 126.9750, risk_level: "주의", scheduled_start: "09:35", scheduled_end: "10:00", estimated_duration_min: 25 },
      { location_name: "하수구 C", latitude: 37.5640, longitude: 126.9800, risk_level: "정상", scheduled_start: "10:05", scheduled_end: "10:20", estimated_duration_min: 15 }
    ]
  },
  {
    team_id: 2,
    team_name: "2팀",
    tasks: [
      { location_name: "하수구 D", latitude: 37.5700, longitude: 126.9820, risk_level: "위험", scheduled_start: "09:00", scheduled_end: "09:40", estimated_duration_min: 40 },
      { location_name: "하수구 E", latitude: 37.5680, longitude: 126.9850, risk_level: "주의", scheduled_start: "09:45", scheduled_end: "10:10", estimated_duration_min: 25 },
      { location_name: "하수구 F", latitude: 37.5670, longitude: 126.9800, risk_level: "정상", scheduled_start: "10:15", scheduled_end: "10:30", estimated_duration_min: 15 }
    ]
  }
];

const Data = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('데이터 분석');
  const [selectedSewer, setSelectedSewer] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [kakaoMap, setKakaoMap] = useState(null);
  const [polylines, setPolylines] = useState([]);

  useEffect(() => setTeams(TEST_TEAMS), []);
  useEffect(() => window.kakao.maps.load(() => initMap()), []);

  const toBase64 = (str) => window.btoa(unescape(encodeURIComponent(str)));

  const createMarkerImage = (color, status) => {
    const symbol = status === 'danger' ? '!' : status === 'warning' ? '?' : 'V';
    const svg = `
      <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="12" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="15" cy="15" r="6" fill="white"/>
        <text x="15" y="19" text-anchor="middle" font-size="8" fill="${color}" font-weight="bold">${symbol}</text>
      </svg>`;
    return new window.kakao.maps.MarkerImage(
      `data:image/svg+xml;base64,${toBase64(svg)}`,
      new window.kakao.maps.Size(30, 30),
      { offset: new window.kakao.maps.Point(15, 30) }
    );
  };

  const initMap = () => {
    const container = document.getElementById('kakao-map');
    const options = { center: new window.kakao.maps.LatLng(37.5665, 126.9780), level: 5 };
    const map = new window.kakao.maps.Map(container, options);
    setKakaoMap(map);

    // 모든 팀 마커 표시
    TEST_TEAMS.forEach(team => {
      team.tasks.forEach(task => {
        let color = '#2ecc71';
        let status = 'normal';
        if (task.risk_level === '위험') { color = '#e74c3c'; status = 'danger'; }
        else if (task.risk_level === '주의') { color = '#f39c12'; status = 'warning'; }
        else { color = '#2ecc71'; status = 'normal'; }

        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(task.latitude, task.longitude),
          image: createMarkerImage(color, status),
          map
        });

        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">${task.location_name} - ${task.risk_level}</div>`
        });

        window.kakao.maps.event.addListener(marker, 'mouseover', () => infowindow.open(map, marker));
        window.kakao.maps.event.addListener(marker, 'mouseout', () => infowindow.close());
        window.kakao.maps.event.addListener(marker, 'click', () => setSelectedSewer(task));
      });
    });
  };

  const fetchRoute = async (team) => {
    if (!team || team.tasks.length < 2 || !kakaoMap) return;

    polylines.forEach(line => line.setMap(null));
    setPolylines([]);

    const headers = {
      Authorization: 'KakaoAK 7a035fa25142208aafc99c15d53ee2e7',
      'Content-Type': 'application/json'
    };

    const origin = { x: team.tasks[0].longitude, y: team.tasks[0].latitude };
    const destination = { x: team.tasks[team.tasks.length - 1].longitude, y: team.tasks[team.tasks.length - 1].latitude };
    const waypointsArr = team.tasks.slice(1, team.tasks.length - 1).map(t => ({ x: t.longitude, y: t.latitude }));
    const body = { origin, destination, priority: 'RECOMMEND', car_fuel: 'GASOLINE', car_hipass: false, alternatives: false, road_details: false };
    if (waypointsArr.length > 0) body.waypoints = waypointsArr;

    try {
      const res = await axios.post(
        'https://apis-navi.kakaomobility.com/v1/waypoints/directions', 
        body, 
        { headers }
      );

      if (!res.data.routes || res.data.routes.length === 0) {
        alert(`${team.team_name} 경로를 찾을 수 없습니다.`);
        return;
      }

      const sections = res.data.routes[0].sections || [];
      sections.forEach(section => {
        const path = [];
        section.roads.forEach(road => {
          for (let i = 0; i < road.vertexes.length; i += 2) {
            path.push(new window.kakao.maps.LatLng(road.vertexes[i + 1], road.vertexes[i]));
          }
        });
        const polyline = new window.kakao.maps.Polyline({
          path,
          strokeWeight: 5,
          strokeColor: '#3498db',
          strokeOpacity: 0.8,
          strokeStyle: 'solid'
        });
        polyline.setMap(kakaoMap);
        setPolylines(prev => [...prev, polyline]);
      });

      const bounds = new window.kakao.maps.LatLngBounds();
      team.tasks.forEach(t => bounds.extend(new window.kakao.maps.LatLng(t.latitude, t.longitude)));
      kakaoMap.setBounds(bounds);

    } catch (err) {
      console.error(`${team.team_name} 경로 API 호출 실패`, err);
      alert(`${team.team_name} 경로를 불러오지 못했습니다.`);
    }
  };

  useEffect(() => { if (selectedTeam) fetchRoute(selectedTeam); }, [selectedTeam, kakaoMap]);

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    const routes = { '지도':'/', '대시보드':'/dashboard', '장비 제어':'/control', '알림 관리':'/alarm', '데이터 분석':'/data' };
    if (routes[menu]) navigate(routes[menu]);
  };

  return (
    <DataDesign
      selectedSewer={selectedSewer}
      activeMenu={activeMenu}
      menuItems={menuItems}
      onMenuClick={handleMenuClick}
      kakaoMap={kakaoMap}
      teams={teams}
      selectedTeam={selectedTeam}
      onSelectTeam={setSelectedTeam}
    />
  );
};

export default Data;
