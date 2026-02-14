import { useState, useRef } from 'react';
import './SoundSender.css';

// Configuration for ultrasonic communication
const SAMPLE_RATE = 44100; // Standard audio sample rate
const BASE_FREQ = 18000; // Base ultrasonic frequency (18 kHz)
const FREQ_SHIFT = 1000; // Frequency shift for FSK modulation
const BIT_DURATION = 0.05; // Duration of each bit in seconds (50ms)
const PREAMBLE_DURATION = 0.2; // Duration of preamble tone

function SoundSender() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const audioContextRef = useRef(null);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const createTone = (frequency, duration, audioContext, startTime) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    // Smooth envelope to avoid clicks
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + duration - 0.01);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
    
    return duration;
  };

  const textToBinary = (text) => {
    // Convert text to base64 first (for better handling of special characters)
    const base64 = btoa(unescape(encodeURIComponent(text)));
    
    // Convert base64 string to binary
    let binary = '';
    for (let i = 0; i < base64.length; i++) {
      const charCode = base64.charCodeAt(i);
      binary += charCode.toString(2).padStart(8, '0');
    }
    
    return binary;
  };

  const sendViaSound = async () => {
    if (!text.trim()) {
      setError('Please enter some text to send');
      return;
    }

    try {
      setError('');
      setStatus('Preparing to send...');
      setIsSending(true);

      const audioContext = initAudioContext();
      const currentTime = audioContext.currentTime;
      let timeOffset = currentTime + 0.1;

      // Create preamble tone (helps receiver synchronize)
      setStatus('Sending preamble...');
      timeOffset += createTone(BASE_FREQ + FREQ_SHIFT, PREAMBLE_DURATION, audioContext, timeOffset);
      
      // Small gap after preamble
      timeOffset += 0.05;

      // Convert text to binary
      const binaryData = textToBinary(text);
      
      setStatus(`Sending data (${text.length} characters, ${binaryData.length} bits)...`);

      // Send length header (16 bits = 2 bytes for length)
      const lengthBinary = binaryData.length.toString(2).padStart(16, '0');
      for (let i = 0; i < lengthBinary.length; i++) {
        const bit = lengthBinary[i];
        const frequency = bit === '1' ? BASE_FREQ + FREQ_SHIFT : BASE_FREQ;
        timeOffset += createTone(frequency, BIT_DURATION, audioContext, timeOffset);
      }

      // Send actual data
      for (let i = 0; i < binaryData.length; i++) {
        const bit = binaryData[i];
        const frequency = bit === '1' ? BASE_FREQ + FREQ_SHIFT : BASE_FREQ;
        timeOffset += createTone(frequency, BIT_DURATION, audioContext, timeOffset);
        
        // Update progress
        if (i % 100 === 0) {
          const progress = Math.round((i / binaryData.length) * 100);
          setStatus(`Sending data... ${progress}%`);
        }
      }

      // Calculate total duration
      const totalDuration = (timeOffset - currentTime) * 1000;
      
      // Wait for transmission to complete
      setTimeout(() => {
        setStatus('Data sent successfully! The receiver should now have your message.');
        setIsSending(false);
        setText('');
      }, totalDuration);

    } catch (err) {
      setError(`Failed to send data: ${err.message}`);
      setStatus('');
      setIsSending(false);
    }
  };

  const stopSending = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsSending(false);
    setStatus('Transmission cancelled');
  };

  return (
    <div className="sound-sender-container">
      <h1>Share Now - Sound Sender</h1>
      <p>Send text using ultrasonic sound waves</p>

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

      <div className="sound-actions">
        {!isSending ? (
          <>
            <div className="input-section">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter password, URL, or any text to send..."
                rows="4"
                maxLength="500"
              />
              <div className="character-count">
                {text.length}/500 characters
              </div>
            </div>

            <button className="send-button" onClick={sendViaSound}>
              Send via Sound
            </button>
          </>
        ) : (
          <div className="sending-section">
            <div className="spinner"></div>
            <p>Transmitting... Keep devices close together</p>
            <button className="stop-button" onClick={stopSending}>
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="info-section">
        <h3>How it works</h3>
        <ol>
          <li>Enter the text you want to share (max 500 characters)</li>
          <li>Click "Send via Sound" to start transmission</li>
          <li>Keep the sender device close to the receiver (within 1-2 meters)</li>
          <li>The data is encoded into ultrasonic sound waves (18-20 kHz)</li>
          <li>The receiver device captures and decodes the sound</li>
        </ol>
        <div className="info-note">
          <strong>Note:</strong> This uses ultrasonic frequencies (18-20 kHz) which are at the edge 
          of human hearing. Some people may hear a faint high-pitched sound during transmission. 
          Keep devices close together and minimize background noise for best results. The receiver 
          must have "Start Receiving" active before you send.
        </div>
        <div className="warning-note">
          ⚠️ For best results, use in a quiet environment and ensure both devices' speakers and 
          microphones are working properly. Transmission speed is approximately 20 bits per second.
        </div>
      </div>
    </div>
  );
}

export default SoundSender;
