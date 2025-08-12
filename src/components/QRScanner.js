// src/components/QRScanner.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';

const QRScanner = () => {
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
          
          // Extract box ID from QR code (assuming format like "BOX-001" or just "001")
          const boxId = result.data.replace('BOX-', '');
        navigate(`/MG/JDU/${boxId}`);
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
    navigate(`/MG/JDU/${manualBoxId.trim()}`);
    }
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="qr-scanner">
      <div className="header">
        <h1>📦 QR Box Tracker</h1>
        <p>Scan a QR code to track your moving box</p>
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
              📸 Start Scanning
            </button>
          ) : (
            <button onClick={stopScanning} className="stop-button">
              ⏹️ Stop Scanning
            </button>
          )}
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
            Go to Box
          </button>
        </div>
      </div>

      <div className="dashboard-link">
        <button onClick={goToDashboard} className="dashboard-button">
          📊 View Dashboard
        </button>
      </div>
    </div>
  );
};

export default QRScanner;
