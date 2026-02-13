import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Sender from './components/Sender';
import Receiver from './components/Receiver';
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
      </div>

      <div className="info-section">
        <h3>How it works</h3>
        <ol>
          <li>The sender enters text and generates a QR code</li>
          <li>The receiver scans the QR code with their camera</li>
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
          <Link to="/sender" className="nav-link">Sender</Link>
          <Link to="/receiver" className="nav-link">Receiver</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sender" element={<Sender />} />
        <Route path="/receiver" element={<Receiver />} />
      </Routes>
    </Router>
  );
}

export default App;
