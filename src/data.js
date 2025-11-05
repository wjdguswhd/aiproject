import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DataDesign from './assets/datadesign';

const menuItems = [
  '지도', '대시보드', '장비 제어', '스케줄링', '경로 안내'];

const Data = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('경로 안내');
  const [selectedSewer, setSelectedSewer] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [crewHomes, setCrewHomes] = useState([]);
  const [kakaoMap, setKakaoMap] = useState(null);
  const [polylines, setPolylines] = useState([]);
  const [sewerData, setSewerData] = useState([]);
  const [lastNavigationPosition, setLastNavigationPosition] = useState(null);

  const toBase64 = (str) => window.btoa(unescape(encodeURIComponent(str)));

  const createMarkerImage = (color, status) => {
    let symbol;
    if (status === 'danger') symbol = '!';
    else if (status === 'warning') symbol = '?';
    else if (status === 'home') symbol = 'H';
    else symbol = 'V';

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

  const getStatusAndColor = (value) => {
    if (value === null || value === undefined) return { status: 'normal', color: '#2ecc71' };
    if (value >= 20) return { status: 'danger', color: '#e74c3c' };
    if (value >= 15) return { status: 'warning', color: '#f39c12' };
    return { status: 'normal', color: '#2ecc71' };
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'danger': return '위험';
      case 'warning': return '주의';
      case 'normal': return '정상';
      default: return '알 수 없음';
    }
  };

  const fetchSewerData = async () => {
    try {
      const res = await axios.get('http://192.168.79.45:8000/api/accountapp/drains/');
      const formattedData = await Promise.all(
        res.data.map(async (item) => {
          let value = 0;
          try {
            const sensorRes = await axios.post(
              'http://192.168.79.45:8000/api/accountapp/sensorvalue/',
              { region: item.region || "경기도", sub_region: item.sub_region || "고양시", name: item.name },
              { headers: { 'Content-Type': 'application/json' } }
            );
            if (sensorRes.data && sensorRes.data.length > 0) value = sensorRes.data[0].value;
          } catch (err) {
            console.error(`Sensor value 가져오기 실패 (하수구 ${item.name}):`, err);
          }

          const { status, color } = getStatusAndColor(value);

          return {
            id: item.id,
            name: item.name || item.location || `하수구-${item.id}`,
            lat: item.latitude || item.lat || 37.5665,
            lng: item.longitude || item.lng || 126.9780,
            status,
            color,
            value,
          };
        })
      );
      setSewerData(formattedData);
      return formattedData;
    } catch (err) {
      console.error('하수구 목록 불러오기 실패:', err);
      return [];
    }
  };

  const formatUTC = (utcString) => utcString.replace("T", " ").replace("+00:00", "");

  const fetchTeamSchedules = async () => {
    try {
      const sewers = await fetchSewerData();
      const res = await axios.get('http://192.168.79.45:8000/maintenance/crews/tasks');
      if (res.data && Array.isArray(res.data.crews)) {
        const crewsData = res.data.crews.map(crewItem => ({
          team_id: crewItem.crew.id,
          team_name: `${crewItem.crew.name}`,
          tasks: crewItem.tasks.map(task => {
            const sewer = sewers.find(s => s.id === task.drain_id);
            const lat = task.lat ?? (sewer ? sewer.lat : null);
            const lng = task.lng ?? (sewer ? sewer.lng : null);

            return {
              id: task.id,
              status: task.status,
              scheduled_start: formatUTC(task.start),
              scheduled_end: formatUTC(task.end),
              drain: task.drain_id,
              lat,
              lng,
              assigned_crew: crewItem.crew.name,
              estimated_duration_min: Math.round((new Date(task.end) - new Date(task.start)) / 60000),
              location_name: sewer ? sewer.name : `하수구 ${task.drain_id}`
            };
          })
        }));
        setTeams(crewsData);
      }
    } catch (err) {
      console.error('팀별 스케줄 불러오기 실패:', err);
    }
  };

  const fetchCrewHomes = async () => {
    try {
      const res = await axios.get('http://192.168.79.45:8000/maintenance/crews/');
      if (Array.isArray(res.data)) setCrewHomes(res.data);
    } catch (err) {
      console.error('청소팀 홈 위치 불러오기 실패:', err);
    }
  };

  const initMap = () => {
    const container = document.getElementById('kakao-map');
    if (!container) return;
    const map = new window.kakao.maps.Map(container, { center: new window.kakao.maps.LatLng(37.7132, 126.8900), level: 3 });
    setKakaoMap(map);

    sewerData.forEach(sewer => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(sewer.lat, sewer.lng),
        image: createMarkerImage(sewer.color, sewer.status),
        map
      });
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:12px;text-align:center;"><strong>${sewer.name}</strong><br/><span style="color:${sewer.color}; font-weight:bold;">${getStatusText(sewer.status)}</span><span style="font-size:11px; color:#333;">측정값: ${sewer.value}</span></div>`
      });
      window.kakao.maps.event.addListener(marker, 'mouseover', () => infowindow.open(map, marker));
      window.kakao.maps.event.addListener(marker, 'mouseout', () => infowindow.close());
      window.kakao.maps.event.addListener(marker, 'click', () => setSelectedSewer(sewer));
    });
  };

  const fetchRoute = async (team) => {
    if (!team || team.tasks.length < 1 || !kakaoMap) return;

    polylines.forEach(line => line.setMap(null));
    setPolylines([]);

    const crewHome = crewHomes.find(c => c.id === team.team_id);
    const origin = crewHome
      ? { x: crewHome.home_lng, y: crewHome.home_lat }
      : { x: team.tasks[0].lng, y: team.tasks[0].lat };

    const destination = { x: team.tasks[team.tasks.length - 1].lng, y: team.tasks[team.tasks.length - 1].lat };
    const waypointsArr = team.tasks.map(t => ({ x: t.lng, y: t.lat }));

    const body = { origin, destination, priority: 'RECOMMEND', car_fuel: 'GASOLINE', waypoints: waypointsArr };
    const headers = { Authorization: 'KakaoAK 7a035fa25142208aafc99c15d53ee2e7', 'Content-Type': 'application/json' };

    try {
      const res = await axios.post('https://apis-navi.kakaomobility.com/v1/waypoints/directions', body, { headers });
      if (!res.data.routes || res.data.routes.length === 0) return;

      res.data.routes[0].sections.forEach((section, index) => {
        const path = [];
        section.roads.forEach(road => {
          for (let i = 0; i < road.vertexes.length; i += 2)
            path.push(new window.kakao.maps.LatLng(road.vertexes[i + 1], road.vertexes[i]));
        });
        const colors = ['#3498db', '#e74c3c', '#f1c40f', '#2ecc71', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
        const polyline = new window.kakao.maps.Polyline({
          path,
          strokeWeight: 5,
          strokeColor: colors[index % colors.length],
          strokeOpacity: 0.8,
          strokeStyle: 'solid'
        });
        polyline.setMap(kakaoMap);
        setPolylines(prev => [...prev, polyline]);
      });

      const bounds = new window.kakao.maps.LatLngBounds();
      team.tasks.forEach(t => bounds.extend(new window.kakao.maps.LatLng(t.lat, t.lng)));
      if (crewHome) bounds.extend(new window.kakao.maps.LatLng(crewHome.home_lat, crewHome.home_lng));
      kakaoMap.setBounds(bounds);

      if (crewHome) {
        const homeMarker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(crewHome.home_lat, crewHome.home_lng),
          image: createMarkerImage('#3498db', 'home'),
          map: kakaoMap
        });
        const infowindow = new window.kakao.maps.InfoWindow({ content: `<div style="padding:5px;font-size:12px;text-align:center;"><strong>${crewHome.name} 홈</strong></div>` });
        window.kakao.maps.event.addListener(homeMarker, 'mouseover', () => infowindow.open(kakaoMap, homeMarker));
        window.kakao.maps.event.addListener(homeMarker, 'mouseout', () => infowindow.close());
      }
    } catch (err) {
      console.error(`${team.team_name} 경로 API 호출 실패`, err);
    }
  };

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init('95d93fec9e3afa95e9d63e426d400a8d'); // 여기에 본인 키
      console.log('Kakao SDK 초기화 완료');
    }
  }, []);

const onStartNavigationToTask = (task) => {
  if (!task) return;

  const destLat = Number(task.lat);
  const destLng = Number(task.lng);
  const destName = task.location_name || '목적지';

  if ([destLat, destLng].some(v => isNaN(v))) {
    alert('목적지 위치 정보가 올바르지 않습니다.');
    console.log("❌ 잘못된 목적지 좌표:", task);
    return;
  }

  const navigateToKakaoMap = (startLat, startLng) => {
    const startName = '현재 위치';
    console.log("📍 길안내 시작 위치:", startLat, startLng, "목적지:", destLat, destLng);

    if (navigator.userAgent.match(/Android|iPhone|iPad|iPod/i)) {
      const scheme = `kakaomap://route?sp=${startLat},${startLng}&ep=${destLat},${destLng}&by=CAR&sname=${encodeURIComponent(startName)}&dname=${encodeURIComponent(destName)}`;
      console.log("📱 모바일 카카오맵 스킴:", scheme);
      window.location.href = scheme;
    } else {
      const webUrl = `https://map.kakao.com/link/from/${encodeURIComponent(startName)},${startLat},${startLng}/to/${encodeURIComponent(destName)},${destLat},${destLng}`;
      console.log("🌐 웹 카카오맵 URL:", webUrl);
      window.open(webUrl, '_blank');
    }
  };

  // ✅ 위치 고정
  const fixedLat = 37.713789;
  const fixedLng = 126.889265;
  navigateToKakaoMap(fixedLat, fixedLng);
};



  useEffect(() => { fetchSewerData(); fetchTeamSchedules(); fetchCrewHomes(); }, []);
  useEffect(() => { if (window.kakao && window.kakao.maps) window.kakao.maps.load(() => initMap()); }, [sewerData]);
  useEffect(() => { if (selectedTeam) fetchRoute(selectedTeam); }, [selectedTeam, kakaoMap]);

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    const routes = { '지도':'/map', '대시보드':'/dashboard', '장비 제어':'/control', '스케줄링':'/alarm', '경로안내 ':'/data' };
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
      onStartNavigationToTask={onStartNavigationToTask}
    />
  );
};

export default Data;
  