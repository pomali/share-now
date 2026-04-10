import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Alert,
} from '@chakra-ui/react';

function Receiver() {
  const [scannedText, setScannedText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [autoStartAttempted, setAutoStartAttempted] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [isQrReaderVisible, setIsQrReaderVisible] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const resultRef = useRef(null);
  const isScanningRef = useRef(false);
  const isTransitioningRef = useRef(false);

  const getPreferredCamera = async () => {
    try {
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras?.length) return null;

      const rearCamera = cameras.find((camera) =>
        /(back|rear|environment|world)/i.test(camera.label || '')
      );
      if (rearCamera) {
        return { id: rearCamera.id, isFront: false };
      }

      const frontCamera = cameras.find((camera) =>
        /(front|user|facetime|selfie)/i.test(camera.label || '')
      );
      if (frontCamera) {
        return { id: frontCamera.id, isFront: true };
      }

      return { id: cameras[0].id, isFront: false };
    } catch {
      return null;
    }
  };

  const syncFrontCameraFromTrackSettings = () => {
    const settings = html5QrCodeRef.current?.getRunningTrackSettings?.();
    const facingMode = settings?.facingMode;

    if (typeof facingMode !== 'string') return;

    if (facingMode.toLowerCase() === 'user') {
      setIsFrontCamera(true);
    } else if (facingMode.toLowerCase() === 'environment') {
      setIsFrontCamera(false);
    }
  };

  const startScanning = async () => {
    // Prevent concurrent start attempts (e.g. React Strict Mode double-mount)
    if (isScanningRef.current || isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    try {
      setError('');
      setScannedText('');
      setShowScrollButton(false);
      setIsFrontCamera(false);

      // Make the reader element visible before the library initializes,
      // so it can measure dimensions for the camera feed.
      flushSync(() => {
        setIsQrReaderVisible(true);
      });

      // Wait for next frame to ensure the browser applies the layout change
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Always create a fresh instance to avoid stale state after cleanup
      html5QrCodeRef.current = new Html5Qrcode("qr-reader");

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      const successCallback = (decodedText) => {
        setScannedText(decodedText);
        stopScanning();
        // Show scroll button on mobile after scanning
        if (window.innerWidth <= 768) {
          setShowScrollButton(true);
        }
      };
      const errorCallback = () => {
        // Ignore scan errors (no QR code in frame)
      };

      const preferredCamera = await getPreferredCamera();

      if (preferredCamera) {
        await html5QrCodeRef.current.start(
          preferredCamera.id,
          config,
          successCallback,
          errorCallback
        );
        setIsFrontCamera(preferredCamera.isFront);
      } else {
        try {
          await html5QrCodeRef.current.start(
            { facingMode: "environment" },
            config,
            successCallback,
            errorCallback
          );
        } catch {
          await html5QrCodeRef.current.start(
            { facingMode: "user" },
            config,
            successCallback,
            errorCallback
          );
          setIsFrontCamera(true);
        }
      }

      syncFrontCameraFromTrackSettings();

      isScanningRef.current = true;
      setIsScanning(true);
    } catch (err) {
      setError(`Unable to start camera: ${err.message || err}`);
      isScanningRef.current = false;
      setIsScanning(false);
      setIsQrReaderVisible(false);
    } finally {
      isTransitioningRef.current = false;
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && isScanningRef.current) {
      try {
        isScanningRef.current = false;
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      } finally {
        setIsScanning(false);
        setIsQrReaderVisible(false);
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(scannedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const scrollToResult = () => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowScrollButton(false);
    }
  };

  // Auto-start camera on mount so users who already granted permissions
  // don't have to press "Start Camera" again.
  useEffect(() => {
    let cancelled = false;

    startScanning().finally(() => {
      if (!cancelled) setAutoStartAttempted(true);
    });

    return () => {
      cancelled = true;
      if (html5QrCodeRef.current && isScanningRef.current) {
        isScanningRef.current = false;
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container maxW="2xl" py={10}>
      <VStack gap={6} align="stretch">
        <VStack gap={2} textAlign="center">
          <Heading>Receiver</Heading>
          <Text color="fg.muted">Scan a QR code to receive the shared content</Text>
        </VStack>

        {error && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        )}

        <VStack gap={4} align="center">
          {!isScanning && !scannedText && autoStartAttempted && (
            <Button colorPalette="blue" onClick={startScanning}>
              Start Camera
            </Button>
          )}

          <Box
            id="qr-reader"
            ref={scannerRef}
            w="full"
            className={[
              isQrReaderVisible ? '' : 'qr-reader-hidden',
              isFrontCamera ? 'camera-mirrored' : '',
            ].filter(Boolean).join(' ')}
            css={{
              '&.qr-reader-hidden': {
                display: 'none',
              },
              '&.camera-mirrored video': {
                transform: 'scaleX(-1)',
              },
            }}
          />

          {isScanning && (
            <Button colorPalette="red" variant="outline" onClick={stopScanning}>
              Stop Scanning
            </Button>
          )}
        </VStack>

        {scannedText && (
          <VStack gap={4} align="stretch" ref={resultRef}>
            <Heading size="md">Scanned Content:</Heading>
            <Box
              p={4}
              borderRadius="md"
              borderWidth="1px"
              fontFamily="mono"
              whiteSpace="pre-wrap"
              wordBreak="break-all"
            >
              {scannedText}
            </Box>
            <HStack gap={3}>
              <Button colorPalette="blue" onClick={copyToClipboard}>
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
              <Button variant="outline" onClick={() => {
                setScannedText('');
                setShowScrollButton(false);
                startScanning();
              }}>
                Scan Again
              </Button>
            </HStack>
          </VStack>
        )}
      </VStack>

      {showScrollButton && (
        <Button
          position="fixed"
          bottom={6}
          right={6}
          borderRadius="full"
          colorPalette="blue"
          onClick={scrollToResult}
          aria-label="Scroll to result"
          size="lg"
        >
          ↓
        </Button>
      )}
    </Container>
  );
}

export default Receiver;
