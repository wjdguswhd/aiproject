// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Map from './map';     // ③에서 만드는 컴포넌트
import Dashboard from './dashboard';
import Control from './control';
import Alarm from './alarm';
import Data from './data';

function App() {
  return (
    <Router>
      <Routes>
        {/* 루트(/)로 들어오면 /map 으로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/map" replace />} />
        <Route path="/map" element={<Map />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/control" element={<Control />} />
        <Route path="/Alarm" element={<Alarm />} />
        <Route path="/Data" element={<Data />} />
      </Routes>
    </Router>
  );
}

export default App;
