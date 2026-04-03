import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Heading,
  Text,
  Button,
  Container,
  SimpleGrid,
  Card,
  Code,
  Link,
} from '@chakra-ui/react';
import { ColorModeButton } from './components/ui/color-mode';
import Sender from './components/Sender';
import Receiver from './components/Receiver';
import BluetoothSender from './components/BluetoothSender';
import BluetoothReceiver from './components/BluetoothReceiver';
import SoundSender from './components/SoundSender';
import SoundReceiver from './components/SoundReceiver';

const modeCards = [
  { to: '/sender', icon: '📤', title: 'Sender', desc: 'Create a QR code to share' },
  { to: '/receiver', icon: '📥', title: 'Receiver', desc: 'Scan a QR code to receive' },
  { to: '/bluetooth-sender', icon: '📡', title: 'Bluetooth Sender', desc: 'Send via Bluetooth' },
  { to: '/bluetooth-receiver', icon: '📲', title: 'Bluetooth Receiver', desc: 'Receive via Bluetooth' },
  { to: '/sound-sender', icon: '🔊', title: 'Sound Sender', desc: 'Send via ultrasonic sound' },
  { to: '/sound-receiver', icon: '🎤', title: 'Sound Receiver', desc: 'Receive via ultrasonic sound' },
];

const navLinks = [
  { to: '/sender', label: 'QR Sender' },
  { to: '/receiver', label: 'QR Receiver' },
  { to: '/bluetooth-sender', label: 'BT Sender' },
  { to: '/bluetooth-receiver', label: 'BT Receiver' },
  { to: '/sound-sender', label: 'Sound Sender' },
  { to: '/sound-receiver', label: 'Sound Receiver' },
];

function Home() {
  return (
    <Container maxW="5xl" py={10}>
      <VStack gap={10} align="stretch">
        <VStack gap={3} textAlign="center">
          <Heading size="3xl">Share Now</Heading>
          <Text color="fg.muted" fontSize="lg">
            Share passwords, URLs, or any text locally with no server
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={4}>
          {modeCards.map((card) => (
            <RouterLink key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
              <Card.Root
                height="full"
                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                _focus={{ transform: 'translateY(-2px)', shadow: 'md', outline: '2px solid', outlineColor: 'colorPalette.focusRing' }}
                transition="all 0.2s"
                cursor="pointer"
              >
                <Card.Body>
                  <VStack gap={2} align="center" textAlign="center">
                    <Text fontSize="3xl">{card.icon}</Text>
                    <Heading size="md">{card.title}</Heading>
                    <Text color="fg.muted" fontSize="sm">{card.desc}</Text>
                  </VStack>
                </Card.Body>
              </Card.Root>
            </RouterLink>
          ))}
        </SimpleGrid>

        <Card.Root>
          <Card.Header>
            <Heading size="md">🧩 Browser Extension</Heading>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="start">
              <Text>
                Receive QR code data directly into any input field on any website — no need to copy and paste.
              </Text>
              <Button asChild colorPalette="blue">
                <a href="/share-now-extension.zip" download="share-now-extension.zip">
                  ⬇️ Download Chrome Extension
                </a>
              </Button>
              <Box>
                <Heading size="sm" mb={2}>Installation Instructions</Heading>
                <Box as="ol" pl={5}>
                  <Box as="li" mb={1}>Download the extension ZIP file above.</Box>
                  <Box as="li" mb={1}>Unzip the downloaded file.</Box>
                  <Box as="li" mb={1}>
                    Open Chrome and navigate to{' '}
                    <Code aria-label="Chrome extensions settings URL">chrome://extensions</Code>.
                  </Box>
                  <Box as="li" mb={1}>
                    Enable <strong>Developer mode</strong> (toggle in the top-right corner).
                  </Box>
                  <Box as="li" mb={1}>
                    Click <strong>Load unpacked</strong> and select the unzipped folder.
                  </Box>
                  <Box as="li">The Share Now extension is now installed! Right-click any input field to use it.</Box>
                </Box>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Heading size="md">How it works</Heading>
          </Card.Header>
          <Card.Body>
            <Box as="ol" pl={5}>
              <Box as="li" mb={2}>
                <strong>QR Code:</strong> The sender enters text and generates a QR code. The receiver scans it with their camera.
              </Box>
              <Box as="li" mb={2}>
                <strong>Bluetooth:</strong> Connect two devices via Bluetooth, confirm the device name, and send text directly.
              </Box>
              <Box as="li" mb={2}>
                <strong>Sound:</strong> Send data using ultrasonic sound waves (18-20 kHz). Keep devices close together for transmission.
              </Box>
              <Box as="li">Data is shared locally - no server involved!</Box>
            </Box>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Container>
  );
}

function App() {
  return (
    <Router basename="/">
      <Box as="nav" borderBottomWidth="1px" px={4} py={3} position="sticky" top={0} zIndex={100} bg="bg">
        <Flex maxW="5xl" mx="auto" align="center" justify="space-between" gap={2} wrap="wrap">
          <Link asChild fontWeight="bold" fontSize="lg" _hover={{ textDecoration: 'none' }}>
            <RouterLink to="/">Share Now</RouterLink>
          </Link>
          <Flex align="center" gap={1} wrap="wrap">
            <HStack gap={0} wrap="wrap">
              {navLinks.map(({ to, label }) => (
                <Button key={to} asChild variant="ghost" size="sm">
                  <RouterLink to={to}>{label}</RouterLink>
                </Button>
              ))}
            </HStack>
            <ColorModeButton />
          </Flex>
        </Flex>
      </Box>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sender" element={<Sender />} />
        <Route path="/receiver" element={<Receiver />} />
        <Route path="/bluetooth-sender" element={<BluetoothSender />} />
        <Route path="/bluetooth-receiver" element={<BluetoothReceiver />} />
        <Route path="/sound-sender" element={<SoundSender />} />
        <Route path="/sound-receiver" element={<SoundReceiver />} />
      </Routes>
    </Router>
  );
}

export default App;
