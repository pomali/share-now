import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Sender from './components/Sender';
import Receiver from './components/Receiver';
import BluetoothSender from './components/BluetoothSender';
import BluetoothReceiver from './components/BluetoothReceiver';
import SoundSender from './components/SoundSender';
import SoundReceiver from './components/SoundReceiver';
import './App.css';

function Home() {
  return (
    <div className="home-container">
      <h1>Share Now</h1>
      <p className="subtitle">Share passwords, URLs, or any text locally with no server</p>
      
      <div className="mode-selection">
        <Link to="/sender" className="mode-card">
          <div className="icon">📤</div>
          <h2>Sender</h2>
          <p>Create a QR code to share</p>
        </Link>
        
        <Link to="/receiver" className="mode-card">
          <div className="icon">📥</div>
          <h2>Receiver</h2>
          <p>Scan a QR code to receive</p>
        </Link>

        <Link to="/bluetooth-sender" className="mode-card">
          <div className="icon">📡</div>
          <h2>Bluetooth Sender</h2>
          <p>Send via Bluetooth</p>
        </Link>

        <Link to="/bluetooth-receiver" className="mode-card">
          <div className="icon">📲</div>
          <h2>Bluetooth Receiver</h2>
          <p>Receive via Bluetooth</p>
        </Link>

        <Link to="/sound-sender" className="mode-card">
          <div className="icon">🔊</div>
          <h2>Sound Sender</h2>
          <p>Send via ultrasonic sound</p>
        </Link>

        <Link to="/sound-receiver" className="mode-card">
          <div className="icon">🎤</div>
          <h2>Sound Receiver</h2>
          <p>Receive via ultrasonic sound</p>
        </Link>
      </div>

      <div className="info-section">
        <h3>How it works</h3>
        <ol>
          <li><strong>QR Code:</strong> The sender enters text and generates a QR code. The receiver scans it with their camera.</li>
          <li><strong>Bluetooth:</strong> Connect two devices via Bluetooth, confirm the device name, and send text directly.</li>
          <li><strong>Sound:</strong> Send data using ultrasonic sound waves (18-20 kHz). Keep devices close together for transmission.</li>
          <li>Data is shared locally - no server involved!</li>
        </ol>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router basename="/share-now">
      <nav className="navbar">
        <Link to="/" className="nav-brand">Share Now</Link>
        <div className="nav-links">
          <Link to="/sender" className="nav-link">QR Sender</Link>
          <Link to="/receiver" className="nav-link">QR Receiver</Link>
          <Link to="/bluetooth-sender" className="nav-link">BT Sender</Link>
          <Link to="/bluetooth-receiver" className="nav-link">BT Receiver</Link>
          <Link to="/sound-sender" className="nav-link">Sound Sender</Link>
          <Link to="/sound-receiver" className="nav-link">Sound Receiver</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sender" element={<Sender />} />
        <Route path="/receiver" element={<Receiver />} />
        <Route path="/bluetooth-sender" element={<BluetoothSender />} />
        <Route path="/bluetooth-receiver" element={<BluetoothReceiver />} />
        <Route path="/sound-sender" element={<SoundSender />} />
        <Route path="/sound-receiver" element={<SoundReceiver />} />
      </Routes>
    </Router>
  );
}

export default App;
