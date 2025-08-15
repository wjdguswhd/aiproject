import React, { useState, useRef, useEffect } from 'react';

const ControlDesign = () => {
  const [motorSpeed, setMotorSpeed] = useState(75);
  const [autoSpeed, setAutoSpeed] = useState(60);
  const [cleanDuration, setCleanDuration] = useState(50);
  const [selectedDays, setSelectedDays] = useState(['수', '토']);
  const [manualRunning, setManualRunning] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([
    {

      time: '2024-12-19 14:35',
      device: '청소 모터',
      task: '속도 조절 (75%)',
      status: '성공',
      user: '관리자',
      result: '정상'
    }
  ]);

  const motorSliderRef = useRef(null);
  const autoSliderRef = useRef(null);
  const draggingMotor = useRef(false);
  const draggingAuto = useRef(false);
  const prevMotorSpeed = useRef(motorSpeed);
  const prevAutoSpeed = useRef(autoSpeed);

  const getCurrentTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const addHistory = (device, task, status, user, result) => {
    const newHistory = {
      time: getCurrentTime(),
      device,
      task,
      status,
      user,
      result
    };
    setHistoryData(prev => [newHistory, ...prev]);
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const controlBoxHeight = 200;
  const controlBoxWidth = 340;
  const boxGap = 20;
  const historyBoxWidth = controlBoxWidth * 2 + boxGap;

  const handleManualStart = () => {
    setManualRunning(true);
    addHistory('청소 모터', '수동 시작', '성공', '관리자', '정상');
  };

  const handleManualStop = () => {
    setManualRunning(false);
    addHistory('청소 모터', '수동 정지', '성공', '관리자', '정상');
  };

  const handleAutoStart = () => {
    setAutoRunning(true);
    addHistory('청소 모터', `자동 시작 (${autoSpeed}%)`, '성공', '관리자', '정상');
  };

  const handleAutoStop = () => {
    setAutoRunning(false);
    addHistory('청소 모터', '자동 정지', '성공', '관리자', '정상');
  };

  const handleSave = () => {
    setSaved(true);
    addHistory('예약 설정', `스케줄 저장 (${selectedDays.join(', ')})`, '성공', '관리자', '정상');
    setTimeout(() => setSaved(false), 2000);
  };

  const onMotorMouseDown = () => {
    draggingMotor.current = true;
  };
  const onMotorMouseUp = () => {
    draggingMotor.current = false;
  };
  const onMotorMouseMove = (e) => {
    if (!draggingMotor.current || !motorSliderRef.current) return;
    const rect = motorSliderRef.current.getBoundingClientRect();
    let newPercent = ((e.clientX - rect.left) / rect.width) * 100;
    newPercent = Math.max(0, Math.min(100, newPercent));
    setMotorSpeed(Math.round(newPercent));
  };

  const onAutoMouseDown = () => {
    draggingAuto.current = true;
  };
  const onAutoMouseUp = () => {
    draggingAuto.current = false;
  };
  const onAutoMouseMove = (e) => {
    if (!draggingAuto.current || !autoSliderRef.current) return;
    const rect = autoSliderRef.current.getBoundingClientRect();
    let newPercent = ((e.clientX - rect.left) / rect.width) * 100;
    newPercent = Math.max(0, Math.min(100, newPercent));
    setAutoSpeed(Math.round(newPercent));
  };

  useEffect(() => {
    const onMouseUp = () => {
      if (draggingMotor.current) {
        draggingMotor.current = false;
        if (motorSpeed !== prevMotorSpeed.current) {
          addHistory('청소 모터', `속도 조절 (${motorSpeed}%)`, '성공', '관리자', '정상');
          prevMotorSpeed.current = motorSpeed;
        }
      }
      if (draggingAuto.current) {
        draggingAuto.current = false;
        if (autoSpeed !== prevAutoSpeed.current) {
          addHistory('청소 모터', `자동 속도 조절 (${autoSpeed}%)`, '성공', '관리자', '정상');
          prevAutoSpeed.current = autoSpeed;
        }
      }
    };
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [motorSpeed, autoSpeed]);

  return (
    <div
      style={{
        padding: 20,
        backgroundColor: '#ecf0f1',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* 모달 창 */}
      {showHistoryModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 20,
              width: '80%',
              maxWidth: '1000px',
              height: '80%',
              maxHeight: '600px',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 'bold', color: '#2c3e50', margin: 0 }}>
                전체 제어 이력
              </h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: 5,
                  padding: '8px 16px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                닫기
              </button>
            </div>
            <div
              style={{
                flex: 1,
                border: '1px solid #bdc3c7',
                borderRadius: 5,
                overflow: 'auto',
              }}
            >
              <div
                style={{
                  height: 40,
                  backgroundColor: '#34495e',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 15,
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}
              >
                <div style={{ width: 150 }}>시간</div>
                <div style={{ width: 120 }}>장비</div>
                <div style={{ width: 250 }}>작업</div>
                <div style={{ width: 120 }}>상태</div>
                <div style={{ width: 120 }}>사용자</div>
                <div style={{ width: 120 }}>결과</div>
              </div>
              {historyData.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 15,
                    fontSize: 13,
                    height: 50,
                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff',
                    borderBottom: index === historyData.length - 1 ? 'none' : '1px solid #ecf0f1',
                  }}
                >
                  <div style={{ width: 150 }}>{item.time}</div>
                  <div style={{ width: 120 }}>{item.device}</div>
                  <div style={{ width: 250 }}>{item.task}</div>
                  <div style={{ width: 120 }}>
                    <div
                      style={{
                        backgroundColor: item.status === '성공' ? '#27ae60' : '#e74c3c',
                        color: 'white',
                        fontSize: 10,
                        padding: '4px 8px',
                        borderRadius: 3,
                        width: 50,
                        textAlign: 'center',
                      }}
                    >
                      {item.status}
                    </div>
                  </div>
                  <div style={{ width: 120 }}>{item.user}</div>
                  <div style={{ width: 120, color: item.result === '정상' ? '#27ae60' : '#e74c3c' }}>
                    {item.result}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'start',
          alignItems: 'flex-start',
          gap: 28,
        }}
      >
        {/* 좌측: 수동 + 자동 + 최근 이력 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: boxGap }}>
            {/* 수동 제어 */}
            <div style={{ width: controlBoxWidth }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  marginBottom: 6,
                }}
              >
                수동 제어
              </div>
              <div
                style={{
                  height: controlBoxHeight,
                  backgroundColor: 'white',
                  border: '1px solid #bdc3c7',
                  borderRadius: 5,
                  padding: 12,
                  userSelect: 'none',
                }}
              >
                <h3
                  style={{
                    fontSize: 14,
                    color: '#2c3e50',
                    fontWeight: 'bold',
                    marginBottom: 15,
                  }}
                >
                  모터 제어
                </h3>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <button
                    onClick={handleManualStart}
                    style={{
                      width: 80,
                      height: 32,
                      backgroundColor: '#27ae60',
                      color: 'white',
                      borderRadius: 5,
                      border: 'none',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    시작
                  </button>
                  <button
                    onClick={handleManualStop}
                    style={{
                      width: 80,
                      height: 32,
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      borderRadius: 5,
                      border: 'none',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    정지
                  </button>
                </div>
                <div style={{ fontSize: 12, marginBottom: 8 }}>속도 조절</div>
                <div
                  ref={motorSliderRef}
                  onMouseMove={onMotorMouseMove}
                  onMouseDown={onMotorMouseDown}
                  onMouseUp={onMotorMouseUp}
                  style={{
                    position: 'relative',
                    height: 10,
                    backgroundColor: '#ecf0f1',
                    borderRadius: 5,
                    marginBottom: 8,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: `${motorSpeed}%`,
                      height: '100%',
                      backgroundColor: '#3498db',
                      borderRadius: 5,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: `${motorSpeed}%`,
                      top: -3,
                      transform: 'translateX(-50%)',
                      width: 16,
                      height: 16,
                      backgroundColor: '#2c3e50',
                      borderRadius: '50%',
                      cursor: 'grab',
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, marginBottom: 4 }}>
                  현재: {motorSpeed}%
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: manualRunning ? '#27ae60' : '#95a5a6',
                  }}
                >
                  ✓ 모터 {manualRunning ? '정상 작동 중' : '정지됨'}
                </div>
              </div>
            </div>

            {/* 자동 제어 */}
            <div style={{ width: controlBoxWidth }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  marginBottom: 6,
                }}
              >
                자동 제어
              </div>
              <div
                style={{
                  height: controlBoxHeight,
                  backgroundColor: 'white',
                  border: '1px solid #bdc3c7',
                  borderRadius: 5,
                  padding: 12,
                  userSelect: 'none',
                }}
              >
                <h3
                  style={{
                    fontSize: 14,
                    color: '#2c3e50',
                    fontWeight: 'bold',
                    marginBottom: 15,
                  }}
                >
                  모터 제어
                </h3>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <button
                    onClick={handleAutoStart}
                    style={{
                      width: 80,
                      height: 32,
                      backgroundColor: autoRunning ? '#2980b9' : '#27ae60',
                      color: 'white',
                      borderRadius: 5,
                      border: 'none',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                    disabled={autoRunning}
                  >
                    {autoRunning ? '제어 중...' : '시작'}
                  </button>
                  <button
                    onClick={handleAutoStop}
                    style={{
                      width: 80,
                      height: 32,
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      borderRadius: 5,
                      border: 'none',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                    disabled={!autoRunning}
                  >
                    정지
                  </button>
                </div>
                <div style={{ fontSize: 12, marginBottom: 4 }}>
                  자동 설정 속도
                </div>
                <div
                  ref={autoSliderRef}
                  onMouseMove={onAutoMouseMove}
                  onMouseDown={onAutoMouseDown}
                  onMouseUp={onAutoMouseUp}
                  style={{
                    position: 'relative',
                    height: 10,
                    backgroundColor: '#ecf0f1',
                    borderRadius: 5,
                    marginBottom: 8,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: `${autoSpeed}%`,
                      height: '100%',
                      backgroundColor: '#95a5a6',
                      borderRadius: 5,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: `${autoSpeed}%`,
                      top: -3,
                      transform: 'translateX(-50%)',
                      width: 16,
                      height: 16,
                      backgroundColor: '#2c3e50',
                      borderRadius: '50%',
                      cursor: 'grab',
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, marginBottom: 4 }}>
                  현재: {autoSpeed}%
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: autoRunning ? '#27ae60' : '#95a5a6',
                  }}
                >
                  {autoRunning ? '제어 중...' : '정지됨'}
                </div>
              </div>
            </div>
          </div>

          {/* 최근 제어 이력 */}
          <div
            style={{
              width: historyBoxWidth,
              height: controlBoxHeight * 2 + 20,
              backgroundColor: '#ecf0f1',
              borderRadius: 5,
              padding: 1,
              marginTop: 10,
              alignSelf: 'flex-start',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: 10,
              }}
            >
              최근 제어 이력
            </div>
            <div
              style={{
                backgroundColor: 'white',
                border: '1px solid #bdc3c7',
                borderRadius: 3,
                overflowX: 'auto',
                overflowY: 'auto',
                flex: 1,
                maxHeight: '350px',
              }}
            >
              <div
                style={{
                  height: 25,
                  backgroundColor: '#34495e',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 10,
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}
              >
                <div style={{ width: 100 }}>시간</div>
                <div style={{ width: 100 }}>장비</div>
                <div style={{ width: 200 }}>작업</div>
                <div style={{ width: 100 }}>상태</div>
                <div style={{ width: 100 }}>사용자</div>
                <div style={{ width: 100 }}>결과</div>
              </div>
              {historyData.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 10,
                    fontSize: 10,
                    height: 40,
                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff',
                    borderBottom: index === historyData.length - 1 ? 'none' : '1px solid #ecf0f1',
                  }}
                >
                  <div style={{ width: 100 }}>{item.time}</div>
                  <div style={{ width: 100 }}>{item.device}</div>
                  <div style={{ width: 200 }}>{item.task}</div>
                  <div style={{ width: 100 }}>
                    <div
                      style={{
                        backgroundColor: item.status === '성공' ? '#27ae60' : '#e74c3c',
                        color: 'white',
                        fontSize: 8,
                        padding: '2px 5px',
                        borderRadius: 2,
                        width: 40,
                        textAlign: 'center',
                      }}
                    >
                      {item.status}
                    </div>
                  </div>
                  <div style={{ width: 100 }}>{item.user}</div>
                  <div style={{ width: 100, color: item.result === '정상' ? '#27ae60' : '#e74c3c' }}>
                    {item.result}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowHistoryModal(true)}
              style={{
                marginTop: 10,
                alignSelf: 'flex-end',
                width: 100,
                height: 25,
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: 3,
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              더보기
            </button>
          </div>
        </div>

        {/* 우측: 예약 청소 설정 */}
        <div style={{ width: 440 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: '#2c3e50',
              marginBottom: 6,
            }}
          >
            예약 청소 설정
          </div>
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #bdc3c7',
              borderRadius: 5,
              padding: 20,
              boxSizing: 'border-box',
              height: controlBoxHeight * 2 + 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 15 }}>
              <h3 style={{ fontSize: 14, color: '#2c3e50', fontWeight: 'bold' }}>
                정기 청소 스케줄
              </h3>
              <div style={{ fontSize: 12 }}>청소 요일 선택</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
                  <div
                    key={day}
                    onClick={() => toggleDay(day)}
                    style={{
                      width: 40,
                      height: 30,
                      backgroundColor: selectedDays.includes(day) ? '#3498db' : '#ecf0f1',
                      border: '1px solid #bdc3c7',
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: selectedDays.includes(day) ? 'white' : '#2c3e50',
                      fontSize: 12,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12 }}>청소 시간 설정</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 80,
                    height: 30,
                    border: '1px solid #bdc3c7',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    userSelect: 'none',
                  }}
                >
                  09:00
                </div>
                <span>~</span>
                <div
                  style={{
                    width: 80,
                    height: 30,
                    border: '1px solid #bdc3c7',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    userSelect: 'none',
                  }}
                >
                  09:30
                </div>
              </div>
              <div style={{ fontSize: 12 }}>청소 지속 시간</div>
              <div
                style={{
                  position: 'relative',
                  width: 160,
                  height: 10,
                  backgroundColor: '#ecf0f1',
                  borderRadius: 5,
                }}
              >
                <div
                  style={{
                    width: `${cleanDuration}%`,
                    height: '100%',
                    backgroundColor: '#27ae60',
                    borderRadius: 5,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: `${cleanDuration}%`,
                    top: -3,
                    transform: 'translateX(-50%)',
                    width: 16,
                    height: 16,
                    backgroundColor: '#2c3e50',
                    borderRadius: '50%',
                  }}
                />
              </div>
              <button
                onClick={handleSave}
                style={{
                  width: 80,
                  height: 30,
                  backgroundColor: saved ? '#1e8449' : '#27ae60',
                  color: 'white',
                  borderRadius: 5,
                  border: 'none',
                  fontSize: 12,
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'background-color 0.3s',
                }}
              >
                {saved ? '저장됨' : '저장'}
              </button>
              <div style={{ fontSize: 11 }}>
                현재 설정: {selectedDays.join(', ')} 09:00 (30분간)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlDesign;