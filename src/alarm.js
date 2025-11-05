import React, { useState, useEffect } from 'react';
import SchedulingDesign from './assets/alarmdesign';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const menuItems = [
  '지도', '대시보드', '장비 제어', '스케줄링', '경로 안내'];

const Alarm = () => {
  const [activeMenu, setActiveMenu] = useState('스케줄링');
  const [schedules, setSchedules] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // 상태 필터
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = () => {
    axios.get('http://192.168.79.45:8000/maintenance/crews/tasks')
      .then(res => {
        if (res.data && Array.isArray(res.data.crews)) {
          const flattenedSchedules = res.data.crews.flatMap(crewItem =>
            crewItem.tasks.map(task => ({
              id: task.id,
              status: task.status,
              scheduled_start: task.start,
              scheduled_end: task.end,
              drain: task.drain_id,
              lat: task.lat,
              lng: task.lng,
              assigned_crew: crewItem.crew.name,
              estimated_duration_min: Math.round((new Date(task.end) - new Date(task.start)) / 60000),
              risk_score: task.risk_score
            }))
          );
          setSchedules(flattenedSchedules);
        }
      })
      .catch(err => console.error('스케줄 불러오기 오류:', err));
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    switch (menu) {
      case '지도': navigate('/map'); break;
      case '대시보드': navigate('/dashboard'); break;
      case '장비 제어': navigate('/control'); break;
      case '스케줄링': navigate('/scheduling'); break;
      case '경로 안내': navigate('/data'); break;
      default: break;
    }
  };

  // 상태 변경 처리
  const handleStatusChange = (taskId, newStatus) => {
    setSchedules(prev =>
      prev.map(s => s.id === taskId ? { ...s, status: newStatus } : s)
    );

    axios.post('http://192.168.79.45:8000/maintenance/crews/tasks', {
      task_id: taskId,
      status: newStatus
    })
    .then(res => console.log('상태 변경 성공', res.data))
    .catch(err => console.error('상태 변경 오류', err));
  };

  // 상태 필터링 처리 (상태 글씨 옆 드롭다운에서 선택 시)
  const handleStatusFilterChange = (newFilter) => {
    setStatusFilter(newFilter);

    if (newFilter === 'done') {
      axios.get('http://192.168.79.45:8000/maintenance/tasks/')
        .then(res => {
          if (Array.isArray(res.data)) {
            const doneTasks = res.data
              .filter(task => task.status === 'done') // done만
              .map(task => ({
                id: task.id,
                status: task.status,
                scheduled_start: task.scheduled_start,
                scheduled_end: task.scheduled_end,
                drain: task.drain,
                lat: task.lat,
                lng: task.lng,
                assigned_crew: `팀 ${task.assigned_crew}`, // 숫자를 이름으로 변환
                estimated_duration_min: task.estimated_duration_min,
                risk_score: task.risk_score
              }));
            setSchedules(doneTasks);
          }
        })
        .catch(err => console.error('완료 작업 불러오기 오류:', err));
    } else {
      // all 또는 scheduled는 기존 fetchSchedules 사용
      fetchSchedules();
    }
  };

  // 스케줄 생성 처리
  const handleCreateSchedule = () => {
    axios.post('http://192.168.79.45:8000/maintenance/predict-and-generate-tasks/')
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setSchedules(res.data);
          console.log('스케줄 생성 완료', res.data);
        }
      })
      .catch(err => console.error('스케줄 생성 오류:', err));
  };

  return (
    <SchedulingDesign
      activeMenu={activeMenu}
      menuItems={menuItems}
      onMenuClick={handleMenuClick}
      schedules={schedules}
      onStatusChange={handleStatusChange}
      onCreateSchedule={handleCreateSchedule}
      statusFilter={statusFilter}
      onStatusFilterChange={handleStatusFilterChange} // 필터링 함수 전달
    />
  );
};

export default Alarm;
