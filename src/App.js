import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QRScanner from './components/QRScanner';
import BoxForm from './components/BoxForm';
import Dashboard from './components/Dashboard';
import './App.css';

// Mock data storage (will be replaced with backend later)
const getBoxes = () => {
  const stored = localStorage.getItem('boxes');
  return stored ? JSON.parse(stored) : {};
};

const saveBoxes = (boxes) => {
  localStorage.setItem('boxes', JSON.stringify(boxes));
};

function App() {
  const [boxes, setBoxes] = useState(getBoxes());

  const updateBox = (boxId, boxData) => {
    const newBoxes = { ...boxes, [boxId]: boxData };
    setBoxes(newBoxes);
    saveBoxes(newBoxes);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<QRScanner />} />
          <Route
            path="/:company/:moveId/:boxId"
            element={<BoxForm boxes={boxes} updateBox={updateBox} />}
        />
          <Route 
            path="/dashboard" 
            element={<Dashboard boxes={boxes} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

