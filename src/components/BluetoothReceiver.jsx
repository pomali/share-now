import { useState, useEffect, useRef } from 'react';
import './BluetoothReceiver.css';

// Custom UUID for our service - randomly generated to avoid conflicts (must match sender)
const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

function BluetoothReceiver() {
  const [receivedText, setReceivedText] = useState('');
  const [status, setStatus] = useState('');
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const deviceRef = useRef(null);
  const serverRef = useRef(null);
  const disconnectHandlerRef = useRef(null);
  const characteristicHandlerRef = useRef(null);
  const characteristicRef = useRef(null);

  useEffect(() => {
    // Check if Web Bluetooth is available
    const checkBluetooth = () => {
      if (!navigator.bluetooth) {
        setError('Web Bluetooth API is not available in this browser. Please use Chrome, Edge, or Opera on desktop or Android.');
      }
    };
    checkBluetooth();

    // Cleanup on unmount
    return () => {
      if (characteristicRef.current && characteristicHandlerRef.current) {
        characteristicRef.current.removeEventListener('characteristicvaluechanged', characteristicHandlerRef.current);
      }
      if (deviceRef.current && disconnectHandlerRef.current) {
        deviceRef.current.removeEventListener('gattserverdisconnected', disconnectHandlerRef.current);
      }
      if (deviceRef.current && deviceRef.current.gatt.connected) {
        deviceRef.current.gatt.disconnect();
      }
    };
  }, []);

  const startReceiving = async () => {
    try {
      setError('');
      setStatus('Waiting for sender to connect...');
      setReceivedText('');

      // Request a Bluetooth device - only show devices with our service
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [SERVICE_UUID] }]
      });

      deviceRef.current = device;
      setStatus(`Connecting to: ${device.name || 'Unknown Device'}`);

      // Add disconnect listener
      const disconnectHandler = () => {
        setIsAdvertising(false);
        setStatus('Device disconnected');
      };
      disconnectHandlerRef.current = disconnectHandler;
      device.addEventListener('gattserverdisconnected', disconnectHandler);

      // Connect to GATT server
      const server = await device.gatt.connect();
      serverRef.current = server;
      
      setIsAdvertising(true);
      setStatus(`Connected to ${device.name || 'device'}. Waiting for data...`);

      // Get the service and characteristic
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
      characteristicRef.current = characteristic;

      // Start notifications
      await characteristic.startNotifications();

      // Listen for data
      const characteristicHandler = (event) => {
        const value = event.target.value;
        const decoder = new TextDecoder();
        const text = decoder.decode(value);
        setReceivedText(text);
        setStatus('Data received successfully!');
      };
      characteristicHandlerRef.current = characteristicHandler;
      characteristic.addEventListener('characteristicvaluechanged', characteristicHandler);

    } catch (err) {
      if (err.name === 'NotFoundError') {
        setError('No compatible device found. Make sure you have a Bluetooth device advertising the Share Now service, or connect to the same device as the sender.');
      } else if (err.name === 'NetworkError') {
        setError('Connection failed. The selected device may not support the required Bluetooth service or is out of range.');
      } else if (err.name === 'SecurityError') {
        setError('Bluetooth access denied. Please ensure you are using HTTPS and have granted Bluetooth permissions.');
      } else {
        setError(`Connection failed: ${err.message}. Ensure the device supports the Share Now Bluetooth service.`);
      }
      setStatus('');
      setIsAdvertising(false);
    }
  };

  const stopReceiving = async () => {
    if (characteristicRef.current && characteristicHandlerRef.current) {
      characteristicRef.current.removeEventListener('characteristicvaluechanged', characteristicHandlerRef.current);
    }
    if (deviceRef.current && disconnectHandlerRef.current) {
      deviceRef.current.removeEventListener('gattserverdisconnected', disconnectHandlerRef.current);
    }
    if (deviceRef.current && deviceRef.current.gatt.connected) {
      deviceRef.current.gatt.disconnect();
    }
    setIsAdvertising(false);
    setStatus('Stopped receiving');
    deviceRef.current = null;
    serverRef.current = null;
    disconnectHandlerRef.current = null;
    characteristicHandlerRef.current = null;
    characteristicRef.current = null;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(receivedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bluetooth-receiver-container">
      <h1>Share Now - Bluetooth Receiver</h1>
      <p>Receive text from another device via Bluetooth</p>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {status && !error && (
        <div className="status-message">
          {status}
        </div>
      )}

      <div className="bluetooth-actions">
        {!isAdvertising && !receivedText && (
          <button 
            className="start-button" 
            onClick={startReceiving}
            disabled={!navigator.bluetooth}
          >
            Start Receiving
          </button>
        )}

        {isAdvertising && !receivedText && (
          <div className="waiting-section">
            <div className="spinner"></div>
            <p>Ready to receive. Waiting for sender...</p>
            <button className="stop-button" onClick={stopReceiving}>
              Stop
            </button>
          </div>
        )}

        {receivedText && (
          <div className="result-section">
            <h2>Received Content:</h2>
            <div className="received-text">
              {receivedText}
            </div>
            <div className="button-group">
              <button className="copy-button" onClick={copyToClipboard}>
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button className="receive-again-button" onClick={() => {
                setReceivedText('');
                startReceiving();
              }}>
                Receive Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="info-section">
        <h3>How it works</h3>
        <ol>
          <li>Both sender and receiver connect to the same Bluetooth peripheral device</li>
          <li>Click "Start Receiving" to search for compatible Bluetooth devices</li>
          <li>Select the same device that the sender will connect to (only devices with the required service will appear)</li>
          <li>Wait for the sender to transmit data</li>
          <li>The text will be received automatically and displayed</li>
        </ol>
        <div className="info-note">
          <strong>Note:</strong> Web browsers cannot directly communicate with each other via Bluetooth. 
          Both sender and receiver must connect to the same Bluetooth peripheral device (like a phone running 
          a companion app) that advertises the Share Now service UUID: <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>{SERVICE_UUID}</code>
          <br /><br />
          For direct browser-to-browser sharing, use the QR Code mode instead.
        </div>
      </div>
    </div>
  );
}

export default BluetoothReceiver;
