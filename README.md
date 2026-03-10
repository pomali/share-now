# Share Now

Share passwords, URLs, or any short text locally with no server using QR codes.

## Features

- **🔒 Secure & Private**: No data leaves your device - everything is shared locally via QR codes, Bluetooth, or sound
- **📤 Sender Mode**: Enter text and generate a QR code instantly
- **📥 Receiver Mode**: Scan QR codes using your device camera
- **📡 Bluetooth Sender**: Send text directly to another device via Bluetooth
- **📲 Bluetooth Receiver**: Receive text from another device via Bluetooth
- **🔊 Sound Sender**: Transmit data using ultrasonic sound waves
- **🎤 Sound Receiver**: Receive data through ultrasonic sound detection
- **🎨 Modern UI**: Clean, responsive design with dark theme
- **📱 Mobile-Friendly**: Works on desktop and mobile devices

## How It Works

### QR Code Mode
1. **Sender** enters text (password, URL, or any message)
2. A QR code is generated on the sender's device
3. **Receiver** scans the QR code with their camera
4. The text is instantly displayed on the receiver's device

### Bluetooth Mode
1. **Sender** clicks "Connect to Device" and selects the receiver's device
2. Confirm the device name matches to ensure correct device connection
3. **Sender** enters text and clicks "Send via Bluetooth"
4. **Receiver** receives the text automatically on their device

### Sound Mode
1. **Receiver** clicks "Start Receiving" and grants microphone permission
2. **Sender** enters text (max 500 characters) and clicks "Send via Sound"
3. Keep devices close together (within 1-2 meters) during transmission
4. Data is encoded into ultrasonic sound waves (18-20 kHz) and transmitted
5. **Receiver** automatically detects, captures, and decodes the sound

**No internet or server required!** Data is shared locally via QR codes, Bluetooth connection, or ultrasonic sound.

## Usage

Visit the deployed site at: https://share-now.arcicode.com/

- Click **Sender** to share text via QR code
- Click **Receiver** to scan a QR code
- Click **Bluetooth Sender** to send text via Bluetooth
- Click **Bluetooth Receiver** to receive text via Bluetooth
- Click **Sound Sender** to transmit text via ultrasonic sound
- Click **Sound Receiver** to receive text via ultrasonic sound

**Note:** Bluetooth features require a compatible browser (Chrome, Edge, or Opera on desktop or Android) with Web Bluetooth API support. Sound features work on any modern browser with microphone and speaker access.

## Development

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

Visit http://localhost:5173/

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Linting

```bash
npm run lint
```

## Deployment

The application is configured for automatic deployment to GitHub Pages via GitHub Actions. When changes are pushed to the `main` branch, the site is automatically built and deployed.

## Technologies

- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **React Router** - Client-side routing
- **qrcode.react** - QR code generation
- **html5-qrcode** - QR code scanning with camera
- **Web Bluetooth API** - Direct device-to-device communication
- **Web Audio API** - Ultrasonic sound generation and detection
- **GitHub Pages** - Hosting

## Android App

A specification for a native Android application with similar functionality is available in [ANDROID_SPEC.md](ANDROID_SPEC.md). This document outlines requirements for implementing QR code, Bluetooth, and ultrasonic sound features on Android devices.

## License

This project is open source and available under the [MIT License](LICENSE).

