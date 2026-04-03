import { useState, useRef, useEffect } from 'react';
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
import Quiet from 'quietjs-bundle';

const PROFILE = 'ultrasonic';

function SoundSender() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);
  const transmitterRef = useRef(null);

  useEffect(() => {
    Quiet.addReadyCallback(
      () => setIsReady(true),
      () => setError('Failed to initialize sound library'),
    );
  }, []);

  const sendViaSound = () => {
    if (!text.trim()) {
      setError('Please enter some text to send');
      return;
    }

    setError('');
    setStatus('Sending...');
    setIsSending(true);

    try {
      const tx = Quiet.transmitter({
        profile: PROFILE,
        onFinish: () => {
          tx.destroy();
          transmitterRef.current = null;
          setStatus('Data sent successfully! The receiver should now have your message.');
          setIsSending(false);
          setText('');
        },
      });
      transmitterRef.current = tx;
      tx.transmit(Quiet.str2ab(text));
    } catch (err) {
      setError(`Failed to send data: ${err.message}`);
      setStatus('');
      setIsSending(false);
    }
  };

  const stopSending = () => {
    if (transmitterRef.current) {
      transmitterRef.current.destroy();
      transmitterRef.current = null;
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
              />
              <Button colorPalette="blue" onClick={sendViaSound} disabled={!isReady}>
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
                <Box as="li" mb={1}>Enter the text you want to share</Box>
                <Box as="li" mb={1}>Click &quot;Send via Sound&quot; to start transmission</Box>
                <Box as="li" mb={1}>Keep the sender device close to the receiver (within 1-2 meters)</Box>
                <Box as="li" mb={1}>The data is encoded into ultrasonic sound waves by the Quiet.js library</Box>
                <Box as="li">The receiver device captures and decodes the sound</Box>
              </Box>
              <Alert.Root status="info">
                <Alert.Indicator />
                <Alert.Description>
                  <strong>Note:</strong> This uses the Quiet.js library with an ultrasonic profile to
                  transmit data via sound. Keep devices close together and minimize background noise
                  for best results. The receiver must have &quot;Start Receiving&quot; active before you send.
                </Alert.Description>
              </Alert.Root>
              <Alert.Root status="warning">
                <Alert.Indicator />
                <Alert.Description>
                  ⚠️ For best results, use in a quiet environment and ensure both devices&apos; speakers and
                  microphones are working properly.
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
