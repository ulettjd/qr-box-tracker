import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ boxes }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterFragile, setFilterFragile] = useState('');
  const [filterPacked, setFilterPacked] = useState('');

  const boxArray = Object.entries(boxes).map(([id, data]) => ({ id, ...data }));
  
  // Calculate stats
  const totalBoxes = boxArray.length;
  const packedBoxes = boxArray.filter(box => box.packed).length;
  const fragileBoxes = boxArray.filter(box => box.fragile).length;
  const packingProgress = totalBoxes > 0 ? Math.round((packedBoxes / totalBoxes) * 100) : 0;

  // Calculate move status based on box statuses
  const calculateMoveStatus = () => {
    if (totalBoxes === 0) return { phase: 'PACKING', step: 0 };
    
    const statusCounts = boxArray.reduce((acc, box) => {
      const status = box.status || 'PACKED';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const packedCount = statusCounts.PACKED || 0;
    const loadedCount = statusCounts.LOADED || 0;
    const deliveredCount = statusCounts.DELIVERED || 0;

    // Determine current phase
    if (deliveredCount === totalBoxes) {
      return { phase: 'COMPLETE', step: 5 };
    } else if (deliveredCount > 0) {
      return { phase: 'UNLOADING', step: 4 };
    } else if (loadedCount === totalBoxes) {
      return { phase: 'IN_TRANSIT', step: 3 };
    } else if (loadedCount > 0) {
      return { phase: 'LOADING', step: 2 };
    } else if (packedCount === totalBoxes) {
      return { phase: 'PACKED', step: 1 };
    } else {
      return { phase: 'PACKING', step: 0 };
    }
  };

  const moveStatus = calculateMoveStatus();

  // Get unique rooms for filter
  const rooms = [...new Set(boxArray.map(box => box.room).filter(Boolean))];

  // Filter boxes
  const filteredBoxes = boxArray.filter(box => {
    const matchesSearch = !searchTerm || 
      box.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      box.contents?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      box.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRoom = !filterRoom || box.room === filterRoom;
    const matchesFragile = !filterFragile || 
      (filterFragile === 'fragile' && box.fragile) ||
      (filterFragile === 'not-fragile' && !box.fragile);
    const matchesPacked = !filterPacked ||
      (filterPacked === 'packed' && box.packed) ||
      (filterPacked === 'not-packed' && !box.packed);

    return matchesSearch && matchesRoom && matchesFragile && matchesPacked;
  });

  const goToScanner = () => {
    navigate('/');
  };

  const editBox = (boxId) => {
    // Extract the original parts from the stored boxId (MG-JDU-001)
    const parts = boxId.split('-');
    if (parts.length === 3) {
      navigate(`/${parts[0]}/${parts[1]}/${parts[2]}`);
    } else {
      // Fallback for old format
      navigate(`/MG/JDU/${boxId}`);
    }
  };

  const moveSteps = [
    { id: 'PACKING', label: 'Packing', step: 0 },
    { id: 'PACKED', label: 'Packed', step: 1 },
    { id: 'LOADING', label: 'Loading', step: 2 },
    { id: 'IN_TRANSIT', label: 'In Transit', step: 3 },
    { id: 'UNLOADING', label: 'Unloading', step: 4 },
    { id: 'COMPLETE', label: 'Complete', step: 5 }
  ];

  return (
    <div className="dashboard">
      <div className="header">
        <button onClick={goToScanner} className="back-button">
          ← Back to Scanner
        </button>
        <h1>📊 Moving Dashboard</h1>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>📦 Total Boxes</h3>
          <div className="stat-number">{totalBoxes}</div>
        </div>
        <div className="stat-card">
          <h3>✅ Packed</h3>
          <div className="stat-number">{packedBoxes}</div>
        </div>
        <div className="stat-card">
          <h3>🔴 Fragile</h3>
          <div className="stat-number">{fragileBoxes}</div>
        </div>
        <div className="stat-card">
          <h3>📈 Progress</h3>
          <div className="stat-number">{packingProgress}%</div>
        </div>
      </div>

      {/* Packing Progress Bar */}
      <div className="progress-section">
        <h3>Packing Progress</h3>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${packingProgress}%` }}
          ></div>
        </div>
        <p>{packedBoxes} of {totalBoxes} boxes packed</p>
      </div>

      {/* Move Status Timeline */}
      <div className="move-status-section">
        <h3>Move Status</h3>
        <div className="move-timeline">
          {moveSteps.map((step, index) => (
            <div 
              key={step.id}
              className={`timeline-step ${
                step.step < moveStatus.step ? 'complete' : 
                step.step === moveStatus.step ? 'active' : 'pending'
              }`}
            >
              <div className="step-circle">
                {step.step < moveStatus.step ? '✓' : step.step + 1}
              </div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>
        <div className="current-move-status">
          Current Status: <strong>{moveStatus.phase.replace('_', ' ')}</strong>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search boxes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="filter-select"
          >
            <option value="">All Rooms</option>
            {rooms.map(room => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filterFragile}
            onChange={(e) => setFilterFragile(e.target.value)}
            className="filter-select"
          >
            <option value="">All Items</option>
            <option value="fragile">Fragile Only</option>
            <option value="not-fragile">Not Fragile</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filterPacked}
            onChange={(e) => setFilterPacked(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="packed">Packed</option>
            <option value="not-packed">Not Packed</option>
          </select>
        </div>
      </div>

      {/* Boxes List */}
      <div className="boxes-section">
        <h3>Your Boxes ({filteredBoxes.length})</h3>
        
        {filteredBoxes.length === 0 ? (
          <div className="no-boxes">
            {totalBoxes === 0 ? (
              <p>No boxes tracked yet. Scan a QR code to get started!</p>
            ) : (
              <p>No boxes match your current filters.</p>
            )}
          </div>
        ) : (
          <div className="boxes-grid">
            {filteredBoxes.map(box => (
              <div key={box.id} className="box-card" onClick={() => editBox(box.id)}>
                <div className="box-header">
                  <h4>Box #{box.originalBoxId || box.id}</h4>
                  <div className="box-status">
                    {box.packed && <span className="status-badge packed">✅ Packed</span>}
                    {box.fragile && <span className="status-badge fragile">🔴 Fragile</span>}
                    {box.status && <span className={`status-badge status-${box.status.toLowerCase()}`}>
                      {box.status}
                    </span>}
                  </div>
                </div>
                
                {box.image && (
                  <div className="box-image">
                    <img src={box.image} alt={`Box ${box.id}`} />
                  </div>
                )}
                
                <div className="box-details">
                  <p><strong>Room:</strong> {box.room || 'Not specified'}</p>
                  {box.description && (
                    <p><strong>Description:</strong> {box.description}</p>
                  )}
                  {box.contents && (
                    <p className="box-contents">
                      <strong>Contents:</strong> {box.contents.length > 50 
                        ? box.contents.substring(0, 50) + '...' 
                        : box.contents}
                    </p>
                  )}
                </div>
                
                <div className="box-footer">
                  <small>
                    {box.lastUpdated ? 
                      `Updated: ${new Date(box.lastUpdated).toLocaleDateString()}` :
                      `Created: ${new Date(box.dateCreated).toLocaleDateString()}`
                    }
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
