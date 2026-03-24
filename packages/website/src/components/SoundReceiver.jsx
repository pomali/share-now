import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Alert,
  Card,
  Spinner,
} from '@chakra-ui/react';

// Configuration for ultrasonic communication (must match sender)
const SAMPLE_RATE = 44100;
const BASE_FREQ = 18000;
const FREQ_SHIFT = 1000;
const BIT_DURATION = 0.05;
const PREAMBLE_FREQ = BASE_FREQ + FREQ_SHIFT;
const FFT_SIZE = 2048;

function SoundReceiver() {
  const [receivedText, setReceivedText] = useState('');
  const [status, setStatus] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const receivedBitsRef = useRef('');
  const isReceivingRef = useRef(false);
  const lastBitTimeRef = useRef(0);

  useEffect(() => {
    return () => {
      // Cleanup directly without calling stopReceiving
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const getFrequencyMagnitude = (analyser, frequency) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    const nyquist = SAMPLE_RATE / 2;
    const frequencyBinIndex = Math.round((frequency / nyquist) * analyser.frequencyBinCount);

    // Average nearby bins to account for frequency drift
    let sum = 0;
    const range = 2;
    for (let i = -range; i <= range; i++) {
      const index = frequencyBinIndex + i;
      if (index >= 0 && index < dataArray.length) {
        sum += dataArray[index];
      }
    }

    return sum / (range * 2 + 1);
  };

  const detectBit = (analyser) => {
    const mag0 = getFrequencyMagnitude(analyser, BASE_FREQ);
    const mag1 = getFrequencyMagnitude(analyser, BASE_FREQ + FREQ_SHIFT);

    const threshold = 50; // Minimum magnitude to consider as signal
    const diff = Math.abs(mag1 - mag0);

    if (mag0 > threshold || mag1 > threshold) {
      if (diff > 20) {
        return mag1 > mag0 ? '1' : '0';
      }
    }

    return null;
  };

  const detectPreamble = (analyser) => {
    const mag = getFrequencyMagnitude(analyser, PREAMBLE_FREQ);
    return mag > 60; // Higher threshold for preamble detection
  };

  const binaryToText = (binary) => {
    try {
      // Convert binary to base64 string
      let base64 = '';
      for (let i = 0; i < binary.length; i += 8) {
        const byte = binary.slice(i, i + 8);
        if (byte.length === 8) {
          base64 += String.fromCharCode(parseInt(byte, 2));
        }
      }

      // Decode base64 back to text
      const text = decodeURIComponent(escape(atob(base64)));
      return text;
    } catch (err) {
      console.error('Error decoding binary:', err);
      return null;
    }
  };

  const processReceivedData = () => {
    const bits = receivedBitsRef.current;

    if (bits.length < 16) {
      setError('Received data too short. Please try again.');
      return;
    }

    // Extract length header
    const lengthBinary = bits.slice(0, 16);
    const expectedLength = parseInt(lengthBinary, 2);

    if (expectedLength <= 0 || expectedLength > 50000) {
      setError('Invalid data length. Please try again.');
      return;
    }

    // Extract actual data
    const dataBits = bits.slice(16, 16 + expectedLength);

    if (dataBits.length < expectedLength) {
      setError(`Incomplete data received: ${dataBits.length}/${expectedLength} bits. Please try again.`);
      return;
    }

    // Decode to text
    const text = binaryToText(dataBits);

    if (text) {
      setReceivedText(text);
      setStatus('Data received successfully!');
      setIsListening(false);
    } else {
      setError('Failed to decode received data. Please try again.');
    }
  };

  const startListening = async () => {
    const analyser = analyserRef.current;
    const currentTime = Date.now();

    // Check for preamble
    if (!isReceivingRef.current && detectPreamble(analyser)) {
      isReceivingRef.current = true;
      receivedBitsRef.current = '';
      lastBitTimeRef.current = currentTime;
      setStatus('Preamble detected! Receiving data...');
      return;
    }

    // Receive data bits
    if (isReceivingRef.current) {
      const timeSinceLastBit = (currentTime - lastBitTimeRef.current) / 1000;

      // Check for timeout (no data for 1 second)
      if (timeSinceLastBit > 1.0) {
        setStatus('Processing received data...');
        processReceivedData();
        isReceivingRef.current = false;
        return;
      }

      // Try to detect bit at the right timing
      if (timeSinceLastBit >= BIT_DURATION * 0.8) {
        const bit = detectBit(analyser);
        if (bit !== null) {
          receivedBitsRef.current += bit;
          lastBitTimeRef.current = currentTime;

          const bitsReceived = receivedBitsRef.current.length;
          if (bitsReceived % 80 === 0) {
            setStatus(`Receiving data... ${bitsReceived} bits received`);
          }
        }
      }
    }
  };

  const startReceiving = async () => {
    try {
      setError('');
      setStatus('Requesting microphone access...');
      setReceivedText('');
      receivedBitsRef.current = '';
      isReceivingRef.current = false;

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      streamRef.current = stream;

      // Setup audio context and analyser
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.3;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsListening(true);
      setStatus('Listening for ultrasonic signals... (waiting for sender)');

      // Start detection loop
      detectionIntervalRef.current = setInterval(() => {
        startListening();
      }, 10); // Check every 10ms

    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone access denied. Please grant microphone permission and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please ensure your device has a working microphone.');
      } else {
        setError(`Failed to start receiving: ${err.message}`);
      }
      setStatus('');
    }
  };

  const stopReceiving = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    isReceivingRef.current = false;
    receivedBitsRef.current = '';
    setIsListening(false);
    setStatus('Stopped receiving');
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
    <Container maxW="2xl" py={10}>
      <VStack gap={6} align="stretch">
        <VStack gap={2} textAlign="center">
          <Heading>Sound Receiver</Heading>
          <Text color="fg.muted">Receive text using ultrasonic sound waves</Text>
        </VStack>

        {error && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        )}

        {status && !error && (
          <Alert.Root status="info">
            <Alert.Indicator />
            <Alert.Description>{status}</Alert.Description>
          </Alert.Root>
        )}

        <Box>
          {!isListening && !receivedText && (
            <Button colorPalette="blue" onClick={startReceiving}>
              Start Receiving
            </Button>
          )}

          {isListening && !receivedText && (
            <VStack gap={3} align="center">
              <Spinner size="lg" color="blue.500" />
              <Text>Listening for ultrasonic signals...</Text>
              <Text fontSize="sm" color="fg.muted">Ask the sender to transmit now</Text>
              <Button colorPalette="red" variant="outline" onClick={stopReceiving}>
                Stop
              </Button>
            </VStack>
          )}

          {receivedText && (
            <VStack gap={4} align="stretch">
              <Heading size="md">Received Content:</Heading>
              <Box
                p={4}
                borderRadius="md"
                borderWidth="1px"
                fontFamily="mono"
                whiteSpace="pre-wrap"
                wordBreak="break-all"
              >
                {receivedText}
              </Box>
              <HStack gap={3}>
                <Button colorPalette="blue" onClick={copyToClipboard}>
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setReceivedText('');
                  setStatus('');
                  startReceiving();
                }}>
                  Receive Again
                </Button>
              </HStack>
            </VStack>
          )}
        </Box>

        <Card.Root>
          <Card.Header>
            <Heading size="md">How it works</Heading>
          </Card.Header>
          <Card.Body>
            <VStack gap={3} align="start">
              <Box as="ol" pl={5}>
                <Box as="li" mb={1}>Click &quot;Start Receiving&quot; to activate the microphone</Box>
                <Box as="li" mb={1}>Grant microphone permission when prompted</Box>
                <Box as="li" mb={1}>Keep your device close to the sender (within 1-2 meters)</Box>
                <Box as="li" mb={1}>Wait for the sender to start transmitting</Box>
                <Box as="li">The ultrasonic sound will be captured and decoded automatically</Box>
              </Box>
              <Alert.Root status="info">
                <Alert.Indicator />
                <Alert.Description>
                  <strong>Note:</strong> This uses ultrasonic frequencies (18-20 kHz) to receive data.
                  Ensure your device&apos;s microphone is enabled and not muted. The receiver must be started
                  before the sender begins transmission. Keep devices close and minimize background noise.
                </Alert.Description>
              </Alert.Root>
              <Alert.Root status="warning">
                <Alert.Indicator />
                <Alert.Description>
                  ⚠️ For best results, use in a quiet environment. Loud noises or other ultrasonic
                  sources may interfere with reception. If reception fails, try moving devices closer
                  together and ensure there are no obstacles between them.
                </Alert.Description>
              </Alert.Root>
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Container>
  );
}

export default SoundReceiver;
