import React, { useState } from 'react';

const ControlDesign = ({ drainList, selectedDrain, onSelectDrain, onManualStart, onManualStop, onScheduleSave }) => {
  const MAX_VISIBLE = 8;

  const [manualRunning, setManualRunning] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([
    { time: '2024-12-19 14:35', device: '청소 모터', task: '수동 시작', status: '성공', user: '관리자', result: '정상' },
  ]);
  const [selectedDays, setSelectedDays] = useState(['수', '토']);

  // === 시간 상태 ===
  const [startPeriod, setStartPeriod] = useState('오전');
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [endPeriod, setEndPeriod] = useState('오후');
  const [endHour, setEndHour] = useState('06');
  const [endMinute, setEndMinute] = useState('00');

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  };

  const addHistory = (device, task, status='성공', user='관리자', result='정상') => {
    setHistoryData(prev => [{ time: getCurrentTime(), device, task, status, user, result }, ...prev]);
  };

  const toggleDay = (day) => setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d!==day) : [...prev, day]);

  const handleSave = async () => {
    if (!onScheduleSave) return;
    const startTime = `${startHour}:${startMinute} ${startPeriod}`;
    const endTime = `${endHour}:${endMinute} ${endPeriod}`;
    try {
      const success = await onScheduleSave(startTime, endTime, selectedDays);
      setSaved(success);
      addHistory('예약 설정', `스케줄 저장 (${selectedDays.join(', ')})`, success ? '성공' : '실패');
    } catch (err) {
      setSaved(false);
      addHistory('예약 설정', `스케줄 저장 (${selectedDays.join(', ')})`, '실패');
    }
    setTimeout(() => setSaved(false), 2000);
  };

  const handleManualStartClick = async () => {
    const res = await onManualStart();
    if (res.success) setManualRunning(true);
    addHistory(res.device, res.task, res.success ? '성공' : '실패');
  };

  const handleManualStopClick = async () => {
    const res = await onManualStop();
    if (res.success) setManualRunning(false);
    addHistory(res.device, res.task, res.success ? '성공' : '실패');
  };

  const columnWidths = {
    time: '15%',
    device: '15%',
    task: '20%',
    status: '20%',
    user: '15%',
    result: '15%',
  };

  const hours = Array.from({length:13}, (_,i)=>i.toString().padStart(2,'0'));
  const minutes = Array.from({length:60}, (_,i)=>i.toString().padStart(2,'0'));

  return (
    <div style={{ padding:20, backgroundColor:'#ecf0f1', minHeight:'100vh', fontFamily:'Arial, sans-serif' }}>
      {/* 상단 그리드 */}
      <div style={{display:'flex', gap:20, marginBottom:20, alignItems:'flex-start'}}>
        {/* 하수구 선택 */}
        <div style={{width:350}}>
          <div style={{fontSize:14, fontWeight:'bold', color:'#2c3e50', marginBottom:6}}>하수구 선택</div>
          <div style={{backgroundColor:'white', border:'1px solid #bdc3c7', borderRadius:5, padding:15, height:150, display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
            <div>
              <select 
                value={selectedDrain} 
                onChange={e => onSelectDrain(e.target.value)} 
                style={{width:'100%', height:36, borderRadius:5, border:'1px solid #bdc3c7', paddingLeft:10, fontSize:12, cursor:'pointer'}}
              >
                <option value="" disabled>하수구를 선택하세요</option>
                {drainList.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
              <div style={{marginTop:10, fontSize:12, color:'#2c3e50'}}>
                현재 선택된 하수구: <span style={{fontWeight:'bold'}}>{selectedDrain || '없음'}</span>
              </div>
            </div>
            <div style={{display:'flex', gap:10}}>
              <button onClick={handleManualStartClick} disabled={manualRunning} style={{
                  flex:1, height:40,
                  backgroundColor: manualRunning ? '#2980b9' : '#27ae60',
                  color:'white', borderRadius:5, border:'none', fontSize:14, cursor:'pointer'
              }}>{manualRunning ? '제어 중...' : '시작'}</button>
              <button onClick={handleManualStopClick} disabled={!manualRunning} style={{
                  flex:1, height:40,
                  backgroundColor:'#e74c3c', color:'white', borderRadius:5, border:'none', fontSize:14, cursor:'pointer'
              }}>정지</button>
            </div>
          </div>
        </div>

        {/* 예약 청소 설정 */}
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:'bold', color:'#2c3e50', marginBottom:6}}>예약 청소 설정</div>
          <div style={{
            backgroundColor:'white', border:'1px solid #bdc3c7', borderRadius:5,
            padding:15,
            display:'flex', 
            flexDirection:'row', 
            justifyContent:'flex-start',
            alignItems:'flex-start', 
            height:150
          }}>
            
            {/* 왼쪽 - 시간 설정 */}
            <div style={{
              display:'flex', 
              flexDirection:'column', 
              justifyContent:'center', 
              alignItems:'flex-start', 
              gap:10, 
              flex:1, 
              marginRight:20
            }}>
              {/* 시작 시간 */}
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <select value={startPeriod} onChange={e=>setStartPeriod(e.target.value)} style={{height:36, width:60, borderRadius:5, border:'1px solid #bdc3c7', paddingLeft:5, backgroundColor:'#f8f9fa', fontSize:14, cursor:'pointer'}}>
                  <option>오전</option>
                  <option>오후</option>
                </select>
                <select value={startHour} onChange={e=>setStartHour(e.target.value)} style={{height:36, width:60, borderRadius:5, border:'1px solid #bdc3c7', paddingLeft:5, backgroundColor:'#f8f9fa', fontSize:14, cursor:'pointer'}}>
                  {hours.map(h => <option key={h}>{h}</option>)}
                </select>
                <span style={{fontSize:16, fontWeight:'bold'}}>:</span>
                <select value={startMinute} onChange={e=>setStartMinute(e.target.value)} style={{height:36, width:60, borderRadius:5, border:'1px solid #bdc3c7', paddingLeft:5, backgroundColor:'#f8f9fa', fontSize:14, cursor:'pointer'}}>
                  {minutes.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <span style={{fontSize:16, fontWeight:'bold', color:'#2c3e50',paddingLeft:93}}>~</span>
              {/* 종료 시간 */}
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <select value={endPeriod} onChange={e=>setEndPeriod(e.target.value)} style={{height:36, width:60, borderRadius:5, border:'1px solid #bdc3c7', paddingLeft:5, backgroundColor:'#f8f9fa', fontSize:14, cursor:'pointer'}}>
                  <option>오전</option>
                  <option>오후</option>
                </select>
                <select value={endHour} onChange={e=>setEndHour(e.target.value)} style={{height:36, width:60, borderRadius:5, border:'1px solid #bdc3c7', paddingLeft:5, backgroundColor:'#f8f9fa', fontSize:14, cursor:'pointer'}}>
                  {hours.map(h => <option key={h}>{h}</option>)}
                </select>
                <span style={{fontSize:16, fontWeight:'bold'}}>:</span>
                <select value={endMinute} onChange={e=>setEndMinute(e.target.value)} style={{height:36, width:60, borderRadius:5, border:'1px solid #bdc3c7', paddingLeft:5, backgroundColor:'#f8f9fa', fontSize:14, cursor:'pointer'}}>
                  {minutes.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* 중앙 - 요일 선택 */}
            <div style={{flex:1, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'35px 5px', justifyItems:'center', marginLeft:-200}}>
              {['월','화','수','목','금','토','일'].map((day, idx) => (
                <div key={day} onClick={()=>toggleDay(day)} style={{
                  width:50, height:35,
                  backgroundColor:selectedDays.includes(day)?'#3498db':'#ecf0f1',
                  border:'1px solid #bdc3c7', borderRadius:5,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:selectedDays.includes(day)?'white':'#2c3e50',
                  fontSize:14, fontWeight:'bold',
                  cursor:'pointer', userSelect:'none',
                  gridColumn: idx < 3 ? idx+1 : idx-2
                }}>{day}</div>
              ))}
            </div>

            {/* 오른쪽 - 저장 버튼 */}
            <div style={{flex:0.5, display:'flex', flexDirection:'column', justifyContent:'flex-end', alignItems:'flex-end', height:'100%'}}>
              <button onClick={handleSave} style={{
                width:100, height:40,
                backgroundColor:saved?'#1e8449':'#27ae60',
                color:'white', borderRadius:5, border:'none', fontSize:15, fontWeight:'bold', cursor:'pointer'
              }}>{saved?'저장됨':'저장'}</button>
            </div>

          </div>
        </div>

      </div>

      {/* 최근 제어 이력 */}
      <div style={{fontSize:14, fontWeight:'bold', color:'#2c3e50', marginBottom:5}}>최근 제어 이력</div>

      <div style={{width:'100%', height:400, backgroundColor:'white', border:'1px solid #bdc3c7', borderRadius:5, overflow:'hidden', padding:0, marginBottom:10}}>
        <div style={{height:35, backgroundColor:'#34495e', color:'white', fontSize:12, fontWeight:'bold', display:'flex', alignItems:'center'}}>
          <div style={{width:columnWidths.time, paddingLeft:10}}>시간</div>
          <div style={{width:columnWidths.device}}>장비</div>
          <div style={{width:columnWidths.task}}>작업</div>
          <div style={{width:columnWidths.status}}>상태</div>
          <div style={{width:columnWidths.user}}>사용자</div>
          <div style={{width:columnWidths.result}}>결과</div>
        </div>
        {historyData.slice(0, MAX_VISIBLE).map((item,i)=>(
          <div key={i} style={{display:'flex', alignItems:'center', fontSize:12, height:50, backgroundColor:i%2===0?'#f8f9fa':'#ffffff', borderBottom:'1px solid #ecf0f1'}}>
            <div style={{width:columnWidths.time, paddingLeft:10}}>{item.time}</div>
            <div style={{width:columnWidths.device}}>{item.device}</div>
            <div style={{width:columnWidths.task}}>{item.task}</div>
            <div style={{width:columnWidths.status}}>
              <div style={{
                color: item.status === '성공' ? '#27ae60' : '#e74c3c',
                fontSize:12,
                textAlign:'center',
                display:'inline-block',
                width:'auto',
                minWidth:'20px',
              }}>{item.status}</div>
            </div>
            <div style={{width:columnWidths.user}}>{item.user}</div>
            <div style={{width:columnWidths.result, color:item.result==='정상'?'#27ae60':'#e74c3c'}}>{item.result}</div>
          </div>
        ))}
      </div>

      {/* 더보기 버튼 */}
      <div style={{width:'100%', display:'flex', justifyContent:'flex-end', marginTop:5}}>
        <button 
          onClick={()=>setShowHistoryModal(true)} 
          style={{
            width:100, height:28, backgroundColor:'#3498db', color:'white',
            border:'none', borderRadius:3, fontSize:12, cursor:'pointer'
          }}
        >
          더보기
        </button>
      </div>

      {/* 전체 이력 모달 */}
      {showHistoryModal && (
        <div style={{
          position:'fixed', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.5)',
          display:'flex', justifyContent:'center', alignItems:'center', zIndex:999
        }}>
          <div style={{width:850, height:500, backgroundColor:'white', borderRadius:5, padding:20, display:'flex', flexDirection:'column'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
              <h3>전체 제어 이력</h3>
              <button onClick={()=>setShowHistoryModal(false)} style={{cursor:'pointer'}}>닫기</button>
            </div>
            <div style={{flex:1, overflowY:'auto', border:'1px solid #bdc3c7', borderRadius:5}}>
              <div style={{height:35, backgroundColor:'#34495e', color:'white', fontSize:12, fontWeight:'bold', display:'flex', alignItems:'center'}}>
                <div style={{width:columnWidths.time, paddingLeft:10}}>시간</div>
                <div style={{width:columnWidths.device}}>장비</div>
                <div style={{width:columnWidths.task}}>작업</div>
                <div style={{width:columnWidths.status}}>상태</div>
                <div style={{width:columnWidths.user}}>사용자</div>
                <div style={{width:columnWidths.result}}>결과</div>
              </div>
              {historyData.map((item,i)=>(
                <div key={i} style={{display:'flex', alignItems:'center', fontSize:12, height:50, backgroundColor:i%2===0?'#f8f9fa':'#ffffff', borderBottom:'1px solid #ecf0f1'}}>
                  <div style={{width:columnWidths.time, paddingLeft:10}}>{item.time}</div>
                  <div style={{width:columnWidths.device}}>{item.device}</div>
                  <div style={{width:columnWidths.task}}>{item.task}</div>
                  <div style={{width:columnWidths.status}}>
                    <div style={{
                      color: item.status === '성공' ? '#27ae60' : '#e74c3c',
                      fontSize:12,
                      textAlign:'center',
                      display:'inline-block',
                      width:'auto',
                      minWidth:'20px',
                    }}>{item.status}</div>
                  </div>
                  <div style={{width:columnWidths.user}}>{item.user}</div>
                  <div style={{width:columnWidths.result, color:item.result==='정상'?'#27ae60':'#e74c3c'}}>{item.result}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlDesign;
