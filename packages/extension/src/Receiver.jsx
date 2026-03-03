import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './Receiver.css';

function Receiver() {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [autoStartAttempted, setAutoStartAttempted] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const isScanningRef = useRef(false);
  const isTransitioningRef = useRef(false);

  // Extract the originating tab ID and frame ID from the URL query string
  const params = new URLSearchParams(window.location.search);
  const tabId = parseInt(params.get('tabId'), 10);
  const frameId = parseInt(params.get('frameId') ?? '0', 10);

  const startScanning = async () => {
    if (isScanningRef.current || isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    try {
      setError('');
      setStatus('');
      setIsFrontCamera(false);

      if (scannerRef.current) {
        scannerRef.current.classList.remove('qr-reader-hidden');
      }

      await new Promise((resolve) => requestAnimationFrame(resolve));

      html5QrCodeRef.current = new Html5Qrcode('qr-reader');

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      const successCallback = (decodedText) => {
        stopScanning();
        handleScanned(decodedText);
      };
      const errorCallback = () => {
        // Ignore per-frame scan errors (no QR in frame)
      };

      try {
        await html5QrCodeRef.current.start(
          { facingMode: 'environment' },
          config,
          successCallback,
          errorCallback
        );
      } catch {
        await html5QrCodeRef.current.start(
          { facingMode: 'user' },
          config,
          successCallback,
          errorCallback
        );
        setIsFrontCamera(true);
      }

      isScanningRef.current = true;
      setIsScanning(true);
    } catch (err) {
      setError(`Unable to start camera: ${err.message || err}`);
      isScanningRef.current = false;
      setIsScanning(false);
      if (scannerRef.current) {
        scannerRef.current.classList.add('qr-reader-hidden');
      }
    } finally {
      isTransitioningRef.current = false;
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && isScanningRef.current) {
      try {
        isScanningRef.current = false;
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      } finally {
        setIsScanning(false);
      }
    }
  };

  const handleScanned = (text) => {
    if (tabId) {
      // Send the scanned text to the background service worker which relays it
      // to the content script in the originating tab/frame.
      chrome.runtime.sendMessage({ action: 'fill', text, tabId, frameId }, () => {
        setStatus('✓ Filled successfully! This window will close shortly.');
        setTimeout(() => window.close(), 1500);
      });
    } else {
      setStatus(`Scanned: ${text}`);
    }
  };

  useEffect(() => {
    let cancelled = false;

    startScanning().finally(() => {
      if (!cancelled) setAutoStartAttempted(true);
    });

    return () => {
      cancelled = true;
      if (html5QrCodeRef.current && isScanningRef.current) {
        isScanningRef.current = false;
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="receiver-container">
      <h1>Share Now</h1>
      <p>Point the camera at a QR code to fill the selected field.</p>

      {error && <div className="error-message">{error}</div>}
      {status && <div className="status-message">{status}</div>}

      <div className="scanner-section">
        {!isScanning && !status && autoStartAttempted && (
          <button className="scan-button" onClick={startScanning}>
            Start Camera
          </button>
        )}

        <div
          id="qr-reader"
          ref={scannerRef}
          className={[isScanning ? '' : 'qr-reader-hidden', isFrontCamera ? 'camera-mirrored' : ''].filter(Boolean).join(' ')}
        />

        {isScanning && (
          <button className="stop-button" onClick={stopScanning}>
            Stop Scanning
          </button>
        )}
      </div>
    </div>
  );
}

export default Receiver;
