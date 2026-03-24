import { useState, useRef } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Textarea,
  Alert,
  Card,
  Spinner,
} from '@chakra-ui/react';

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
    <Container maxW="2xl" py={10}>
      <VStack gap={6} align="stretch">
        <VStack gap={2} textAlign="center">
          <Heading>Sound Sender</Heading>
          <Text color="fg.muted">Send text using ultrasonic sound waves</Text>
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
          {!isSending ? (
            <VStack gap={3} align="stretch">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter password, URL, or any text to send..."
                rows={4}
                maxLength={500}
              />
              <Text fontSize="sm" color="fg.muted" textAlign="right">
                {text.length}/500 characters
              </Text>
              <Button colorPalette="blue" onClick={sendViaSound}>
                Send via Sound
              </Button>
            </VStack>
          ) : (
            <VStack gap={3} align="center">
              <Spinner size="lg" color="blue.500" />
              <Text>Transmitting... Keep devices close together</Text>
              <Button colorPalette="red" variant="outline" onClick={stopSending}>
                Cancel
              </Button>
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
                <Box as="li" mb={1}>Enter the text you want to share (max 500 characters)</Box>
                <Box as="li" mb={1}>Click &quot;Send via Sound&quot; to start transmission</Box>
                <Box as="li" mb={1}>Keep the sender device close to the receiver (within 1-2 meters)</Box>
                <Box as="li" mb={1}>The data is encoded into ultrasonic sound waves (18-20 kHz)</Box>
                <Box as="li">The receiver device captures and decodes the sound</Box>
              </Box>
              <Alert.Root status="info">
                <Alert.Indicator />
                <Alert.Description>
                  <strong>Note:</strong> This uses ultrasonic frequencies (18-20 kHz) which are at the edge
                  of human hearing. Some people may hear a faint high-pitched sound during transmission.
                  Keep devices close together and minimize background noise for best results. The receiver
                  must have &quot;Start Receiving&quot; active before you send.
                </Alert.Description>
              </Alert.Root>
              <Alert.Root status="warning">
                <Alert.Indicator />
                <Alert.Description>
                  ⚠️ For best results, use in a quiet environment and ensure both devices&apos; speakers and
                  microphones are working properly. Transmission speed is approximately 20 bits per second.
                </Alert.Description>
              </Alert.Root>
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Container>
  );
}

export default SoundSender;
