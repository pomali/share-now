# WebRTC QR Code Signaling Specification

## Overview

This specification defines a method for establishing WebRTC peer-to-peer connections using QR codes as the initial signaling channel, eliminating the need for a remote signaling server. This approach enables secure, serverless, local data sharing between devices.

## Architecture

### Core Components

1. **Peer A (Initiator/Offerer)**: The device that creates the WebRTC offer
2. **Peer B (Responder/Answerer)**: The device that responds to the offer
3. **QR Code Channel**: Visual medium for exchanging signaling data
4. **WebRTC Data Channel**: Encrypted peer-to-peer connection for data transfer

### Design Principles

- **Serverless**: No dependency on remote signaling servers
- **Local**: Designed for local network or direct peer connections
- **Secure**: End-to-end encryption via WebRTC's DTLS-SRTP
- **Simple**: User-friendly flow with minimal steps
- **Offline-capable**: Works without internet connectivity

## Signaling Flow

### Phase 1: Offer Exchange

```
Peer A (Initiator)                          Peer B (Responder)
      |                                              |
      | 1. Create RTCPeerConnection                  |
      | 2. Create data channel                       |
      | 3. Create offer (SDP)                        |
      | 4. Set local description                     |
      | 5. Gather ICE candidates                     |
      |                                              |
      | 6. Package offer + ICE candidates            |
      | 7. Encode as JSON                            |
      | 8. Compress (optional)                       |
      | 9. Generate QR code                          |
      |                                              |
      |        [QR Code Display]                     |
      |             (Offer)                          |
      |                                              |
      |                                    10. Scan QR code
      |                                    11. Decode JSON
      |                                    12. Extract offer + ICE
      |                                    13. Create RTCPeerConnection
      |                                    14. Set remote description
      |                                    15. Add ICE candidates
```

### Phase 2: Answer Exchange

```
Peer B (Responder)                          Peer A (Initiator)
      |                                              |
      | 16. Create answer (SDP)                      |
      | 17. Set local description                    |
      | 18. Gather ICE candidates                    |
      |                                              |
      | 19. Package answer + ICE candidates          |
      | 20. Encode as JSON                           |
      | 21. Compress (optional)                      |
      | 22. Generate QR code                         |
      |                                              |
      |        [QR Code Display]                     |
      |             (Answer)                         |
      |                                              |
      |                                    23. Scan QR code
      |                                    24. Decode JSON
      |                                    25. Extract answer + ICE
      |                                    26. Set remote description
      |                                    27. Add ICE candidates
      |                                              |
      |        [Connection Established]              |
      |<============================================>|
      |           Data Channel Open                  |
```

### Phase 3: Data Transfer

```
Peer A                                      Peer B
      |                                              |
      |<============================================>|
      |    Encrypted data transfer via WebRTC        |
      |          DataChannel API                     |
      |                                              |
```

## QR Code Payload Format

### Structure

Each QR code contains a JSON payload with the following structure:

#### Offer Payload

```json
{
  "type": "offer",
  "sdp": "<SDP offer string>",
  "iceServers": [
    {
      "urls": ["stun:stun.l.google.com:19302"]
    }
  ],
  "iceCandidates": [
    {
      "candidate": "<ICE candidate string>",
      "sdpMid": "<media stream identification>",
      "sdpMLineIndex": <number>
    }
  ],
  "version": "1.0",
  "timestamp": "<ISO 8601 timestamp>"
}
```

#### Answer Payload

```json
{
  "type": "answer",
  "sdp": "<SDP answer string>",
  "iceCandidates": [
    {
      "candidate": "<ICE candidate string>",
      "sdpMid": "<media stream identification>",
      "sdpMLineIndex": <number>
    }
  ],
  "version": "1.0",
  "timestamp": "<ISO 8601 timestamp>"
}
```

### Payload Optimization

To minimize QR code size and improve scan reliability:

1. **ICE Candidate Filtering**: Include only candidates likely to work
   - Prioritize: host > srflx > relay
   - Filter out redundant candidates
   - Limit to first N candidates (recommended: 3-5)

2. **Compression**: Apply compression before encoding
   - Use gzip or similar algorithm
   - Base64-encode compressed data
   - Add compression flag to payload

3. **SDP Optimization**: Minimize SDP size
   - Remove unnecessary attributes
   - Use compact formatting
   - Consider SDP munging for size reduction

### QR Code Specifications

- **Error Correction Level**: H (30% recovery capability)
- **Encoding**: UTF-8 with Base64 for binary data
- **Maximum Size**: Aim for QR Code version 10-15 (optimal for mobile scanning)
- **Display**: Ensure sufficient contrast and size for reliable scanning

## Implementation Details

### WebRTC Configuration

#### RTCPeerConnection Configuration

```javascript
const config = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // Add more STUN servers for redundancy
    { urls: 'stun:stun1.l.google.com:19302' }
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require'
};

const peerConnection = new RTCPeerConnection(config);
```

#### Data Channel Configuration

```javascript
const dataChannelConfig = {
  ordered: true,           // Ensure ordered delivery
  maxRetransmits: 3,       // Retry failed packets
  protocol: 'share-now-v1' // Custom protocol identifier
};

const dataChannel = peerConnection.createDataChannel('data', dataChannelConfig);
```

### Offer Creation (Peer A)

```javascript
// Step 1: Create peer connection
const peerConnection = new RTCPeerConnection(config);

// Step 2: Create data channel
const dataChannel = peerConnection.createDataChannel('data', dataChannelConfig);

// Step 3: Collect ICE candidates
const iceCandidates = [];
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    iceCandidates.push({
      candidate: event.candidate.candidate,
      sdpMid: event.candidate.sdpMid,
      sdpMLineIndex: event.candidate.sdpMLineIndex
    });
  }
};

// Step 4: Create and set offer
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);

// Step 5: Wait for ICE gathering
await new Promise((resolve) => {
  if (peerConnection.iceGatheringState === 'complete') {
    resolve();
  } else {
    peerConnection.onicegatheringstatechange = () => {
      if (peerConnection.iceGatheringState === 'complete') {
        resolve();
      }
    };
  }
});

// Step 6: Create QR payload
const qrPayload = {
  type: 'offer',
  sdp: offer.sdp,
  iceServers: config.iceServers,
  iceCandidates: iceCandidates.slice(0, 5), // Limit candidates
  version: '1.0',
  timestamp: new Date().toISOString()
};

// Step 7: Generate QR code
const qrData = JSON.stringify(qrPayload);
// Use QR code library to generate and display QR code
```

### Answer Creation (Peer B)

```javascript
// Step 1: Parse QR payload (scanned from Peer A)
const offerQrData = /* scanned QR code data string */;
const offerPayload = JSON.parse(offerQrData);

// Step 2: Create peer connection
const peerConnection = new RTCPeerConnection({
  iceServers: offerPayload.iceServers
});

// Step 3: Handle data channel
peerConnection.ondatachannel = (event) => {
  const dataChannel = event.channel;
  dataChannel.onopen = () => console.log('Data channel open');
  dataChannel.onmessage = (e) => console.log('Received:', e.data);
};

// Step 4: Collect ICE candidates
const iceCandidates = [];
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    iceCandidates.push({
      candidate: event.candidate.candidate,
      sdpMid: event.candidate.sdpMid,
      sdpMLineIndex: event.candidate.sdpMLineIndex
    });
  }
};

// Step 5: Set remote description
await peerConnection.setRemoteDescription({
  type: 'offer',
  sdp: offerPayload.sdp
});

// Step 6: Add ICE candidates from offer
for (const candidate of offerPayload.iceCandidates) {
  await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

// Step 7: Create and set answer
const answer = await peerConnection.createAnswer();
await peerConnection.setLocalDescription(answer);

// Step 8: Wait for ICE gathering
await new Promise((resolve) => {
  if (peerConnection.iceGatheringState === 'complete') {
    resolve();
  } else {
    peerConnection.onicegatheringstatechange = () => {
      if (peerConnection.iceGatheringState === 'complete') {
        resolve();
      }
    };
  }
});

// Step 9: Create QR payload
const answerPayload = {
  type: 'answer',
  sdp: answer.sdp,
  iceCandidates: iceCandidates.slice(0, 5),
  version: '1.0',
  timestamp: new Date().toISOString()
};

// Step 10: Generate QR code
const answerQrData = JSON.stringify(answerPayload);
// Use QR code library to generate and display QR code
```

### Completing Connection (Peer A)

```javascript
// Step 1: Parse answer QR payload (scanned from Peer B)
const answerQrData = /* scanned QR code data string */;
const answerPayload = JSON.parse(answerQrData);

// Step 2: Set remote description
await peerConnection.setRemoteDescription({
  type: 'answer',
  sdp: answerPayload.sdp
});

// Step 3: Add ICE candidates from answer
for (const candidate of answerPayload.iceCandidates) {
  await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

// Connection should now be established
dataChannel.onopen = () => {
  console.log('Data channel open, ready to send data');
  dataChannel.send('Hello from Peer A!');
};
```

### Data Transfer

Once the connection is established, use the DataChannel API:

```javascript
// Send text
dataChannel.send('Hello, Peer!');

// Send binary data
const blob = new Blob(['binary data'], { type: 'application/octet-stream' });
const arrayBuffer = await blob.arrayBuffer();
dataChannel.send(arrayBuffer);

// Receive data
dataChannel.onmessage = (event) => {
  if (typeof event.data === 'string') {
    console.log('Text message:', event.data);
  } else if (event.data instanceof ArrayBuffer) {
    console.log('Binary data:', new Uint8Array(event.data));
  }
};
```

## Security Considerations

### Built-in Security

1. **DTLS-SRTP Encryption**: WebRTC provides end-to-end encryption by default
2. **Perfect Forward Secrecy**: Each session uses unique encryption keys
3. **Fingerprint Verification**: SDP includes certificate fingerprints

### Additional Security Measures

1. **QR Code Visibility**
   - Display QR codes only in secure environments
   - Ensure physical security during QR code exchange
   - Clear QR codes from screen after successful scan

2. **Session Validation**
   - Implement timeout on QR codes (recommended: 5-10 minutes)
   - Verify timestamp in payload
   - Single-use QR codes (reject replayed offers/answers)

3. **Man-in-the-Middle Prevention**
   - Physical QR code exchange provides implicit authentication
   - Users visually verify they're scanning from intended device
   - Consider adding PIN code verification as additional layer

4. **Data Validation**
   - Validate all incoming data
   - Implement size limits on messages
   - Sanitize data before processing

### Security Best Practices

```javascript
// Validate timestamp (reject old offers)
const MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes
const payloadTime = new Date(payload.timestamp).getTime();
const now = Date.now();

if (now - payloadTime > MAX_AGE_MS) {
  throw new Error('Offer expired');
}

// Validate version
const SUPPORTED_VERSIONS = ['1.0'];
if (!SUPPORTED_VERSIONS.includes(payload.version)) {
  throw new Error('Unsupported version');
}

// Validate payload structure
if (!payload.type || !payload.sdp || !payload.iceCandidates) {
  throw new Error('Invalid payload structure');
}
```

## Error Handling

### Connection Failures

```javascript
// Handle ICE connection failures
peerConnection.oniceconnectionstatechange = () => {
  if (peerConnection.iceConnectionState === 'failed') {
    console.error('ICE connection failed');
    // Attempt ICE restart
    peerConnection.restartIce();
  }
  if (peerConnection.iceConnectionState === 'disconnected') {
    console.warn('ICE connection disconnected');
    // Wait for reconnection or timeout
  }
};

// Handle connection state changes
peerConnection.onconnectionstatechange = () => {
  console.log('Connection state:', peerConnection.connectionState);
  if (peerConnection.connectionState === 'failed') {
    console.error('Connection failed');
    // Notify user and suggest retry
  }
};
```

### QR Code Scanning Issues

1. **Invalid Data**: Implement JSON parsing error handling
2. **Corrupted QR Code**: Use appropriate error correction level
3. **Timeout**: Set reasonable timeout for QR code generation/scanning
4. **Network Issues**: Handle cases where STUN servers are unreachable

### Timeout Handling

```javascript
// Timeout for connection establishment
const CONNECTION_TIMEOUT_MS = 30000; // 30 seconds

const connectionTimeout = setTimeout(() => {
  if (peerConnection.connectionState !== 'connected') {
    console.error('Connection timeout');
    peerConnection.close();
    // Notify user
  }
}, CONNECTION_TIMEOUT_MS);

peerConnection.onconnectionstatechange = () => {
  if (peerConnection.connectionState === 'connected') {
    clearTimeout(connectionTimeout);
  }
};
```

## Network Considerations

### ICE Candidate Priority

For local/LAN connections, prioritize candidates:

1. **Host candidates** (local IP addresses) - highest priority
2. **Server reflexive candidates** (STUN) - medium priority
3. **Relay candidates** (TURN) - lowest priority (usually not needed)

### STUN Server Configuration

```javascript
const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' }
];
```

### NAT Traversal

- Most local connections work with host candidates only
- STUN servers help with NAT traversal if needed
- TURN servers generally not required for local sharing
- Consider fallback to TURN for difficult network scenarios

## User Experience

### Recommended Flow

1. **Peer A**: Click "Share" → Display offer QR code
2. **Peer B**: Click "Receive" → Scan offer QR code
3. **Peer B**: Display answer QR code
4. **Peer A**: Scan answer QR code
5. **Both**: Connection established notification
6. **Peer A**: Send data via established channel
7. **Peer B**: Receive data and confirm

### UI Considerations

- Clear instructions at each step
- Visual feedback during QR code generation
- Connection status indicators
- Progress indication during data transfer
- Success/failure notifications
- Option to retry on failure

### Accessibility

- Provide alternative text for QR codes
- Support keyboard navigation
- Announce connection status to screen readers
- Consider alternative signaling methods for accessibility

## Limitations and Considerations

### QR Code Size Limitations

- QR codes have size limits (max ~4,296 alphanumeric characters for version 40)
- SDP and ICE candidates can be large
- May need compression or truncation strategies
- Consider progressive signaling if data exceeds QR code capacity

### Browser Compatibility

- Check WebRTC support (RTCPeerConnection, RTCDataChannel)
- Verify getUserMedia for camera access (QR scanning)
- Test on target browsers (Chrome, Firefox, Safari, Edge)
- Consider polyfills for older browsers

### Network Requirements

- Both peers should be on same network for optimal performance
- STUN servers needed if behind NAT
- May not work with symmetric NAT without TURN
- Consider providing network diagnostics

### Use Cases

**Ideal for:**
- Sharing passwords between devices
- Transferring URLs or short text
- Local file sharing (small files)
- Pairing devices in same physical location

**Not ideal for:**
- Large file transfers (due to QR complexity)
- Cross-network/remote connections
- Many-to-many communication
- High-throughput applications

## Extensions and Future Enhancements

### Multi-QR Code Support

For larger payloads:
- Split data across multiple QR codes
- Add sequence numbers and checksums
- Scan QR codes in order
- Reconstruct full payload

### Backup Signaling Methods

- Bluetooth for alternative local channel
- NFC for close-proximity devices
- Audio-based signaling (ultrasonic)
- Manual text entry for simple cases

### Enhanced Security

- Additional encryption layer
- PIN code verification
- Biometric confirmation
- Certificate pinning

### Advanced Features

- Resume interrupted transfers
- Compression for efficient data transfer
- Chunked file transfer with progress
- Multiple simultaneous connections
- Peer discovery on local network

## Reference Implementation

### Required Libraries

- **qrcode.js** or **qrcode-generator**: QR code generation
- **jsQR** or **qr-scanner**: QR code scanning
- **pako** (optional): Compression/decompression

### Code Structure

```
src/
  ├── signaling/
  │   ├── qr-generator.js      # QR code generation
  │   ├── qr-scanner.js        # QR code scanning
  │   └── payload-builder.js   # Payload creation and parsing
  ├── webrtc/
  │   ├── peer-connection.js   # RTCPeerConnection management
  │   ├── data-channel.js      # DataChannel handling
  │   └── ice-handler.js       # ICE candidate management
  ├── security/
  │   ├── validator.js         # Payload validation
  │   └── crypto.js            # Additional encryption (optional)
  └── app.js                   # Main application logic
```

## Testing Recommendations

### Unit Tests

- Payload creation and parsing
- QR code generation and validation
- ICE candidate filtering
- Timeout handling
- Error scenarios

### Integration Tests

- Full offer/answer exchange
- Connection establishment
- Data transfer
- Reconnection scenarios
- Network failure handling

### Manual Testing

- Different network conditions (WiFi, mobile hotspot, etc.)
- Various device combinations
- Different browsers
- Large data transfers
- Error recovery

## Compliance and Standards

### Standards Compliance

- **WebRTC 1.0**: W3C Recommendation
- **RFC 8831**: WebRTC Data Channels
- **RFC 8832**: WebRTC Data Channel Establishment Protocol
- **RFC 8834**: WebRTC Security Architecture
- **ISO/IEC 18004**: QR Code specification

### Privacy Considerations

- No data sent to remote servers
- Ephemeral connections (no persistence)
- Local-only data transfer
- User controls data sharing
- Clear data after transfer

## Conclusion

This specification provides a complete framework for implementing serverless WebRTC connections using QR codes as the signaling channel. The approach is particularly well-suited for local, secure data sharing scenarios where server infrastructure is unavailable or undesirable.

By leveraging QR codes for signaling, this method:
- Eliminates server dependencies
- Provides visual authentication
- Enables offline operation
- Maintains end-to-end encryption
- Offers simple user experience

Implementers should carefully consider the limitations and trade-offs, particularly around QR code size constraints and network requirements, to ensure optimal user experience.
