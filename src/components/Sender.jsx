import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './Sender.css';

function Sender() {
  const [text, setText] = useState('');

  return (
    <div className="sender-container">
      <h1>Share Now - Sender</h1>
      <p>Enter text to share via QR code</p>
      
      <div className="input-section">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter password, URL, or any text to share..."
          rows="4"
        />
      </div>

      {text && (
        <div className="qr-section">
          <h2>Scan this QR Code</h2>
          <div className="qr-code-wrapper">
            <QRCodeSVG 
              value={text} 
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="share-info">
            Have the receiver scan this QR code with their camera
          </p>
        </div>
      )}
    </div>
  );
}

export default Sender;
