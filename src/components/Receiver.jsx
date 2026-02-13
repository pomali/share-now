import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './Receiver.css';

function Receiver() {
  const [scannedText, setScannedText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const resultRef = useRef(null);

  const startScanning = async () => {
    try {
      setError('');
      setScannedText('');
      setShowScrollButton(false);
      
      // Make the reader element visible before the library initializes,
      // so it can measure dimensions for the camera feed.
      if (scannerRef.current) {
        scannerRef.current.classList.remove('qr-reader-hidden');
      }

      // Wait for next frame to ensure the browser applies the layout change
      await new Promise(resolve => requestAnimationFrame(resolve));

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("qr-reader");
      }

      const config = { 
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          setScannedText(decodedText);
          stopScanning();
          // Show scroll button on mobile after scanning
          if (window.innerWidth <= 768) {
            setShowScrollButton(true);
          }
        },
        () => {
          // Ignore scan errors (no QR code in frame)
        }
      );

      setIsScanning(true);
    } catch (err) {
      setError(`Unable to start camera: ${err.message || err}`);
      setIsScanning(false);
      if (scannerRef.current) {
        scannerRef.current.classList.add('qr-reader-hidden');
      }
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(scannedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const scrollToResult = () => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowScrollButton(false);
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  return (
    <div className="receiver-container">
      <h1>Receiver</h1>
      <p>Scan a QR code to receive the shared content</p>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="receiver-content">
        <div className="scanner-section">
          {!isScanning && !scannedText && (
            <button className="scan-button" onClick={startScanning}>
              Start Camera
            </button>
          )}

          <div id="qr-reader" ref={scannerRef} className={isScanning ? '' : 'qr-reader-hidden'}></div>
          
          {isScanning && (
            <button className="stop-button" onClick={stopScanning}>
              Stop Scanning
            </button>
          )}
        </div>

        {scannedText && (
          <div className="result-section" ref={resultRef}>
            <h2>Scanned Content:</h2>
            <div className="scanned-text">
              {scannedText}
            </div>
            <button className="copy-button" onClick={copyToClipboard}>
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button className="scan-again-button" onClick={() => {
              setScannedText('');
              setShowScrollButton(false);
              startScanning();
            }}>
              Scan Again
            </button>
          </div>
        )}
      </div>

      {showScrollButton && (
        <button 
          className="scroll-to-result-button" 
          onClick={scrollToResult}
          aria-label="Scroll to result"
        >
          ↓
        </button>
      )}
    </div>
  );
}

export default Receiver;
