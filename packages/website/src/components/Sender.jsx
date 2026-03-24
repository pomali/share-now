import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Textarea,
} from '@chakra-ui/react';

function Sender() {
  const [text, setText] = useState('');

  return (
    <Container maxW="2xl" py={10}>
      <VStack gap={6} align="stretch">
        <VStack gap={2} textAlign="center">
          <Heading>Sender</Heading>
          <Text color="fg.muted">Enter text to share via QR code</Text>
        </VStack>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter password, URL, or any text to share..."
          rows={8}
          resize="vertical"
        />

        {text && (
          <VStack gap={3} align="center">
            <Box bg="white" p={4} borderRadius="md" display="inline-block">
              <QRCodeSVG
                value={text}
                size={256}
                level="H"
                includeMargin={true}
              />
            </Box>
            <Text color="fg.muted" fontSize="sm">
              Have the receiver scan this QR code with their camera
            </Text>
          </VStack>
        )}
      </VStack>
    </Container>
  );
}

export default Sender;
