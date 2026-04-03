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
import Quiet from 'quietjs-bundle';

const PROFILE = 'ultrasonic';

function SoundReceiver() {
  const [receivedText, setReceivedText] = useState('');
  const [status, setStatus] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const receiverRef = useRef(null);

  useEffect(() => {
    return () => {
      if (receiverRef.current) {
        receiverRef.current.destroy();
        Quiet.disconnect();
        receiverRef.current = null;
      }
    };
  }, []);

  const startReceiving = () => {
    setError('');
    setReceivedText('');
    setStatus('Requesting microphone access...');
    setIsListening(true);

    const rx = Quiet.receiver({
      profile: PROFILE,
      onReceive: (data) => {
        try {
          const text = Quiet.ab2str(data);
          if (!text) {
            throw new Error('Decoded text is empty');
          }
          setReceivedText(text);
          setStatus('Data received successfully!');
        } catch (err) {
          setError(`Failed to decode received data: ${err.message}. Please try again.`);
        }
        setIsListening(false);
        rx.destroy();
        Quiet.disconnect();
        receiverRef.current = null;
      },
      onCreate: () => {
        setStatus('Listening for signals... (waiting for sender)');
      },
      onCreateFail: (reason) => {
        setError(`Failed to start receiving: ${reason}`);
        setIsListening(false);
        receiverRef.current = null;
      },
    });
    receiverRef.current = rx;
  };

  const stopReceiving = () => {
    if (receiverRef.current) {
      receiverRef.current.destroy();
      Quiet.disconnect();
      receiverRef.current = null;
    }
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
                <Box as="li">The Quiet.js library will capture and decode the ultrasonic sound automatically</Box>
              </Box>
              <Alert.Root status="info">
                <Alert.Indicator />
                <Alert.Description>
                  <strong>Note:</strong> This uses the Quiet.js library with an ultrasonic profile to
                  receive data via sound. Ensure your device&apos;s microphone is enabled and not muted.
                  The receiver must be started before the sender begins transmission.
                  Keep devices close and minimize background noise.
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
