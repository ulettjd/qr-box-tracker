import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CrewBoxStatus = ({ boxes, updateBox }) => {
  const { company, moveId, boxId } = useParams();
  const navigate = useNavigate();
  const [boxData, setBoxData] = useState(null);
  const fullBoxId = `${company}-${moveId}-${boxId}`;

  useEffect(() => {
    // Load existing box data if it exists
    if (boxes[fullBoxId]) {
      setBoxData(boxes[fullBoxId]);
    } else {
      // Create basic box entry if it doesn't exist
      setBoxData({
        boxId: fullBoxId,
        company,
        moveId,
        originalBoxId: boxId,
        status: 'PACKED', // Default status
        room: '',
        description: '',
        contents: '',
        fragile: false,
        dateCreated: new Date().toISOString()
      });
    }
  }, [fullBoxId, boxes, company, moveId, boxId]);

  const updateStatus = (newStatus) => {
    const updatedBoxData = {
      ...boxData,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: 'CREW'
    };

    updateBox(fullBoxId, updatedBoxData);
    
    // Navigate back to crew scanner
    navigate('/crew');
  };

  const cancelUpdate = () => {
    navigate('/crew');
  };

  if (!boxData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="crew-box-status">
      <div className="mg-header mover-mode">
        <img src="/mg-moving-logo.png" alt="MG Moving Services" className="company-logo" />
        <h1>Update Box Status</h1>
        <p className="mode-indicator">(Crew)</p>
      </div>

      <div className="box-info-card">
        <div className="box-header">
          <h2>Box #{boxId}</h2>
          <div className="current-status">
            Current Status: <span className={`status-badge status-${boxData.status?.toLowerCase()}`}>
              {boxData.status || 'PACKED'}
            </span>
          </div>
        </div>

        <div className="box-details">
          {boxData.room && (
            <p><strong>Room:</strong> {boxData.room}</p>
          )}
          {boxData.description && (
            <p><strong>Description:</strong> {boxData.description}</p>
          )}
          {boxData.fragile && (
            <p className="fragile-warning">🔴 FRAGILE ITEM</p>
          )}
        </div>
      </div>

      <div className="status-buttons">
        <h3>Update Status:</h3>
        <div className="button-grid">
          <button 
            onClick={() => updateStatus('VERIFIED')}
            className="status-button verified-button"
          >
            ✅ Verified
          </button>
          
          <button 
            onClick={() => updateStatus('LOADED')}
            className="status-button loaded-button"
          >
            🚚 Loaded
          </button>
          
          <button 
            onClick={() => updateStatus('DELIVERED')}
            className="status-button delivered-button"
          >
            📦 Delivered
          </button>
          
          <button 
            onClick={cancelUpdate}
            className="status-button cancel-button"
          >
            ❌ Cancel
          </button>
        </div>
      </div>

      <div className="quick-info">
        <p className="timestamp">
          Last updated: {boxData.lastUpdated ? 
            new Date(boxData.lastUpdated).toLocaleString() : 
            'Never'
          }
        </p>
      </div>

      <div className="powered-by">
        Powered by QTrace
      </div>
    </div>
  );
};

export default CrewBoxStatus;