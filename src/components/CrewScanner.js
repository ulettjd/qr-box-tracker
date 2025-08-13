import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';

const CrewQRScanner = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [qrScanner, setQrScanner] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualBoxId, setManualBoxId] = useState('');

  useEffect(() => {
    return () => {
      if (qrScanner) {
        qrScanner.stop();
      }
    };
  }, [qrScanner]);

  const startScanning = async () => {
    try {
      setError('');
      setScanning(true);

      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data);
          scanner.stop();
          setScanning(false);
          
          // Extract box ID from QR code
          const boxId = result.data.replace('BOX-', '');
          
          // Navigate to crew box status page
          navigate(`/crew-status/MG/JDU/${boxId}`);
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      setQrScanner(scanner);
      await scanner.start();
    } catch (err) {
      console.error('Failed to start camera:', err);
      setError('Failed to access camera. Please ensure camera permissions are granted.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (qrScanner) {
      qrScanner.stop();
      setScanning(false);
    }
  };

  const handleManualEntry = () => {
    if (manualBoxId.trim()) {
      navigate(`/crew-status/MG/JDU/${manualBoxId.trim()}`);
    }
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  const switchToCustomerMode = () => {
    navigate('/');
  };

  return (
    <div className="qr-scanner">
      <div className="mg-header mover-mode">
        <img src="/mg-moving-logo.png" alt="MG Moving Services" className="company-logo" />
        <h1>Box Tracker</h1>
        <p className="mode-indicator">(Crew)</p>
        <p>Scan to update box status</p>
      </div>

      <div className="scanner-container">
        <video ref={videoRef} className="scanner-video"></video>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="scanner-controls">
          {!scanning ? (
            <button onClick={startScanning} className="scan-button">
              📸 Scan for Status Update
            </button>
          ) : (
            <button onClick={stopScanning} className="stop-button">
              ⏹️ Stop Scanning
            </button>
          )}
        </div>

        <div className="mode-toggle">
          <button onClick={switchToCustomerMode} className="toggle-mode-button">
            Switch to Customer Mode
          </button>
        </div>
      </div>

      <div className="manual-entry">
        <h3>Or enter box number manually:</h3>
        <div className="manual-input">
          <input
            type="text"
            value={manualBoxId}
            onChange={(e) => setManualBoxId(e.target.value)}
            placeholder="Enter box ID (e.g., 001)"
            onKeyPress={(e) => e.key === 'Enter' && handleManualEntry()}
          />
          <button onClick={handleManualEntry} disabled={!manualBoxId.trim()}>
            Update Status
          </button>
        </div>
      </div>

      <div className="crew-quick-actions">
        <h3>Quick Actions:</h3>
        <div className="quick-action-buttons">
          <button onClick={() => navigate('/bulk-actions')} className="bulk-action-button">
            📦 Bulk Load Complete
          </button>
          <button onClick={() => navigate('/manifest-review')} className="bulk-action-button">
            📋 Review Manifest
          </button>
          <button onClick={() => navigate('/add-item')} className="bulk-action-button">
            ➕ Add Missing Item
          </button>
        </div>
      </div>

      <div className="dashboard-link">
        <button onClick={goToDashboard} className="dashboard-button">
          📊 View Move Status
        </button>
      </div>

      <div className="powered-by">
        Powered by QTrace
      </div>
    </div>
  );
};

export default CrewQRScanner;