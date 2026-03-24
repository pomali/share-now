import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Textarea,
  Alert,
  Card,
  Code,
} from '@chakra-ui/react';

// Custom UUID for our service - randomly generated to avoid conflicts
const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

function BluetoothSender() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const deviceRef = useRef(null);
  const serverRef = useRef(null);
  const disconnectHandlerRef = useRef(null);

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
      if (deviceRef.current && disconnectHandlerRef.current) {
        deviceRef.current.removeEventListener('gattserverdisconnected', disconnectHandlerRef.current);
      }
      if (deviceRef.current && deviceRef.current.gatt.connected) {
        deviceRef.current.gatt.disconnect();
      }
    };
  }, []);

  const connectToDevice = async () => {
    try {
      setError('');
      setStatus('Searching for devices...');

      // Request a Bluetooth device - only show devices with our service
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [SERVICE_UUID] }]
      });

      deviceRef.current = device;
      setStatus(`Found device: ${device.name || 'Unknown Device'}`);

      // Add disconnect listener
      const disconnectHandler = () => {
        setIsConnected(false);
        setStatus('Device disconnected');
      };
      disconnectHandlerRef.current = disconnectHandler;
      device.addEventListener('gattserverdisconnected', disconnectHandler);

      // Connect to GATT server
      setStatus('Connecting...');
      const server = await device.gatt.connect();
      serverRef.current = server;

      setIsConnected(true);
      setStatus(`Connected to ${device.name || 'device'}. Enter text and click Send.`);
    } catch (err) {
      if (err.name === 'NotFoundError') {
        setError('No compatible device found. Make sure the receiver device has Bluetooth enabled and is advertising the required service.');
      } else if (err.name === 'NetworkError') {
        setError('Connection failed. The selected device may not support the required Bluetooth service or is out of range.');
      } else if (err.name === 'SecurityError') {
        setError('Bluetooth access denied. Please ensure you are using HTTPS and have granted Bluetooth permissions.');
      } else {
        setError(`Connection failed: ${err.message}. Ensure the device supports the Share Now Bluetooth service.`);
      }
      setStatus('');
      setIsConnected(false);
    }
  };

  const sendData = async () => {
    if (!text.trim()) {
      setError('Please enter some text to send');
      return;
    }

    if (!isConnected || !serverRef.current) {
      setError('Not connected to any device');
      return;
    }

    try {
      setStatus('Sending data...');
      setError('');

      // Get the service
      const service = await serverRef.current.getPrimaryService(SERVICE_UUID);

      // Get the characteristic
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

      // Convert text to Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(text);

      // Write the data
      await characteristic.writeValue(data);

      setStatus('Data sent successfully!');
      setText('');
    } catch (err) {
      setError(`Failed to send data: ${err.message}`);
      setStatus('');
    }
  };

  const disconnect = async () => {
    if (deviceRef.current && disconnectHandlerRef.current) {
      deviceRef.current.removeEventListener('gattserverdisconnected', disconnectHandlerRef.current);
    }
    if (deviceRef.current && deviceRef.current.gatt.connected) {
      deviceRef.current.gatt.disconnect();
    }
    setIsConnected(false);
    setStatus('Disconnected');
    deviceRef.current = null;
    serverRef.current = null;
    disconnectHandlerRef.current = null;
  };

  return (
    <Container maxW="2xl" py={10}>
      <VStack gap={6} align="stretch">
        <VStack gap={2} textAlign="center">
          <Heading>Bluetooth Sender</Heading>
          <Text color="fg.muted">Send text to another device via Bluetooth</Text>
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
          {!isConnected ? (
            <Button
              colorPalette="blue"
              onClick={connectToDevice}
              disabled={!navigator.bluetooth}
            >
              Connect to Device
            </Button>
          ) : (
            <VStack gap={4} align="stretch">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter password, URL, or any text to send..."
                rows={4}
              />
              <HStack gap={3}>
                <Button colorPalette="blue" onClick={sendData}>
                  Send via Bluetooth
                </Button>
                <Button colorPalette="red" variant="outline" onClick={disconnect}>
                  Disconnect
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
                <Box as="li" mb={1}>Both devices must connect to a Bluetooth device that supports the Share Now service</Box>
                <Box as="li" mb={1}>Click &quot;Connect to Device&quot; to search for compatible Bluetooth devices</Box>
                <Box as="li" mb={1}>Select a device from the filtered list (only devices with the required service will appear)</Box>
                <Box as="li" mb={1}>Enter your text and click &quot;Send via Bluetooth&quot;</Box>
                <Box as="li">The text will be transferred to the connected Bluetooth device</Box>
              </Box>
              <Alert.Root status="warning">
                <Alert.Indicator />
                <Alert.Description>
                  <strong>Note:</strong> Web browsers cannot directly communicate with each other via Bluetooth.
                  You need a compatible Bluetooth peripheral device (like a phone running a companion app) that
                  advertises the Share Now Bluetooth service UUID: <Code>{SERVICE_UUID}</Code>
                </Alert.Description>
              </Alert.Root>
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Container>
  );
}

export default BluetoothSender;
