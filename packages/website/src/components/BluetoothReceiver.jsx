import { useState, useEffect, useRef } from 'react';
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
  Code,
  Spinner,
} from '@chakra-ui/react';

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
    <Container maxW="2xl" py={10}>
      <VStack gap={6} align="stretch">
        <VStack gap={2} textAlign="center">
          <Heading>Bluetooth Receiver</Heading>
          <Text color="fg.muted">Receive text from another device via Bluetooth</Text>
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
          {!isAdvertising && !receivedText && (
            <Button
              colorPalette="blue"
              onClick={startReceiving}
              disabled={!navigator.bluetooth}
            >
              Start Receiving
            </Button>
          )}

          {isAdvertising && !receivedText && (
            <VStack gap={3} align="center">
              <Spinner size="lg" color="blue.500" />
              <Text>Ready to receive. Waiting for sender...</Text>
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
                <Box as="li" mb={1}>Both sender and receiver connect to the same Bluetooth peripheral device</Box>
                <Box as="li" mb={1}>Click &quot;Start Receiving&quot; to search for compatible Bluetooth devices</Box>
                <Box as="li" mb={1}>Select the same device that the sender will connect to (only devices with the required service will appear)</Box>
                <Box as="li" mb={1}>Wait for the sender to transmit data</Box>
                <Box as="li">The text will be received automatically and displayed</Box>
              </Box>
              <Alert.Root status="warning">
                <Alert.Indicator />
                <Alert.Description>
                  <strong>Note:</strong> Web browsers cannot directly communicate with each other via Bluetooth.
                  Both sender and receiver must connect to the same Bluetooth peripheral device (like a phone running
                  a companion app) that advertises the Share Now service UUID: <Code>{SERVICE_UUID}</Code>
                  <br /><br />
                  For direct browser-to-browser sharing, use the QR Code mode instead.
                </Alert.Description>
              </Alert.Root>
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Container>
  );
}

export default BluetoothReceiver;
