import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MapDesign from './assets/mapdesign';

const menuItems = [
  '지도', '대시보드', '장비 제어', '데이터 분석', '알림 관리', '설정', '시스템 로그'
];

const Map = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('지도');
  const [sewerData, setSewerData] = useState([]);
  const [selectedSewer, setSelectedSewer] = useState(null);
  const [kakaoMap, setKakaoMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    switch (menu) {
      case '지도': navigate('/map'); break;
      case '대시보드': navigate('/dashboard'); break;
      case '장비 제어': navigate('/control'); break;
      case '데이터 분석': navigate('/data'); break;
      case '알림 관리': navigate('/alarm'); break;
      case '설정': navigate('/settings'); break;
      case '시스템 로그': navigate('/system-logs'); break;
      default: break;
    }
  };

  const toBase64 = (str) => window.btoa(unescape(encodeURIComponent(str)));

  const createMarkerImage = (color, status) => {
    const symbol = status === 'danger' ? '!' : status === 'warning' ? '?' : 'V';
    const svg = `
      <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="12" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="15" cy="15" r="6" fill="white"/>
        <text x="15" y="19" text-anchor="middle" font-size="8" fill="${color}" font-weight="bold">${symbol}</text>
      </svg>`;
    return `data:image/svg+xml;base64,${toBase64(svg)}`;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'danger': return '위험';
      case 'warning': return '주의';
      case 'normal': return '정상';
      default: return '알 수 없음';
    }
  };

  // 🔹 value 기준 상태/색상 결정 함수 추가
  const getStatusAndColor = (value) => {
    if (value === null || value === undefined) return { status: 'normal', color: '#2ecc71' };
    if (value >= 80) return { status: 'danger', color: '#e74c3c' };
    if (value >= 60) return { status: 'warning', color: '#f39c12' };
    return { status: 'normal', color: '#2ecc71' };
  };

  const fetchSewerData = async () => {
    try {
      const res = await axios.get('http://192.168.0.222:8000/api/accountapp/drains/');
      const formattedData = res.data.map(item => {
        // 🔹 value 기반 상태/색상 적용
        const { status, color } = getStatusAndColor(item.value);

        return {
          id: item.id,
          name: item.name || item.location || `하수구-${item.id}`,
          lat: item.latitude || item.lat || 37.5665,
          lng: item.longitude || item.lng || 126.9780,
          status,
          color,
          value: item.value || 0,   // 🔹 value 저장
          waterLevel: item.waterLevel || 0,
          temperature: item.temperature || 0,
          lastUpdate: item.last_updated || item.lastUpdate || '',
        };
      });
      setSewerData(formattedData);
    } catch (error) {
      console.error('하수구 목록 불러오기 실패:', error);
    }
  };

  const deleteSewer = async (id) => {
    try {
      await axios.delete(`http://192.168.0.222:8000/api/accountapp/drains/${id}/`);
      setSelectedSewer(null);
      await fetchSewerData(); // 삭제 후 목록 갱신
    } catch (err) {
      alert('삭제 실패: ' + (err.response?.data?.message || '서버 오류'));
      console.error(err);
    }
  };

  const clearMarkers = () => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  };

  const addSewerMarkers = (map) => {
    if (!window.kakao || !window.kakao.maps) return;
    clearMarkers();

    const newMarkers = sewerData.map(sewer => {
      const position = new window.kakao.maps.LatLng(sewer.lat, sewer.lng);
      const markerImage = new window.kakao.maps.MarkerImage(
        createMarkerImage(sewer.color, sewer.status),
        new window.kakao.maps.Size(30, 30)
      );
      const marker = new window.kakao.maps.Marker({ position, image: markerImage });
      marker.setMap(map);

      window.kakao.maps.event.addListener(marker, 'click', () => setSelectedSewer(sewer));

      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:12px;text-align:center;">
                    <strong>${sewer.name}</strong><br/>
                    <span style="color:${sewer.color};">${getStatusText(sewer.status)}</span>
                  </div>`
      });

      window.kakao.maps.event.addListener(marker, 'mouseover', () => infowindow.open(map, marker));
      window.kakao.maps.event.addListener(marker, 'mouseout', () => infowindow.close());

      return marker;
    });

    setMarkers(newMarkers);
  };

  const initKakaoMap = () => {
    const container = document.getElementById('kakao-map');
    if (!container || !window.kakao || !window.kakao.maps) return;

    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 3,
    };
    const map = new window.kakao.maps.Map(container, options);
    setKakaoMap(map);

    const geocoder = new window.kakao.maps.services.Geocoder();

    window.kakao.maps.event.addListener(map, 'click', async (mouseEvent) => {
      const latlng = mouseEvent.latLng;
      const name = prompt('하수구 이름을 입력하세요:');
      if (!name) return;

      // 주소 변환 (좌표 -> 주소)
      geocoder.coord2Address(latlng.getLng(), latlng.getLat(), async (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const addressInfo = result[0].address;

          const region = addressInfo.region_1depth_name || '알수없음';
          const sub_region = addressInfo.region_2depth_name || '알수없음';
          const detail_region = addressInfo.region_3depth_name || '알수없음';

          const newSewer = {
            name,
            latitude: latlng.getLat(),
            longitude: latlng.getLng(),
            region,
            sub_region,
            detail_region
          };

          try {
            console.log('보내는 하수구 데이터:', newSewer);
            await axios.post(
              'http://192.168.0.222:8000/api/accountapp/drains/',
              newSewer,
              { headers: { 'Content-Type': 'application/json' } }
            );

            await fetchSewerData();
          } catch (error) {
            alert('하수구 등록 실패: ' + (error.response?.data?.message || '오류 발생'));
            console.error(error);
          }
        } else {
          alert('주소를 가져올 수 없습니다.');
        }
      });
    });

    addSewerMarkers(map);
    setTimeout(() => map.relayout(), 100);
  };

  useEffect(() => {
    fetchSewerData();
  }, []);

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        if (!kakaoMap) {
          initKakaoMap();
        } else {
          addSewerMarkers(kakaoMap);
        }
      });
    }
  }, [sewerData]);

  return (
    <MapDesign
      sewerData={sewerData}
      selectedSewer={selectedSewer}
      activeMenu={activeMenu}
      menuItems={menuItems}
      onMenuClick={handleMenuClick}
      onCloseModal={() => setSelectedSewer(null)}
      getStatusText={getStatusText}
      onDeleteSewer={deleteSewer}
    />
  );
};

export default Map;
