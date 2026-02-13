# Share Now

Share passwords, URLs, or any short text locally with no server using QR codes.

## Features

- **🔒 Secure & Private**: No data leaves your device - everything is shared locally via QR codes
- **📤 Sender Mode**: Enter text and generate a QR code instantly
- **📥 Receiver Mode**: Scan QR codes using your device camera
- **🎨 Modern UI**: Clean, responsive design with dark theme
- **📱 Mobile-Friendly**: Works on desktop and mobile devices

## How It Works

1. **Sender** enters text (password, URL, or any message)
2. A QR code is generated on the sender's device
3. **Receiver** scans the QR code with their camera
4. The text is instantly displayed on the receiver's device

**No internet or server required!** Data is encoded in the QR code and decoded locally.

## Usage

Visit the deployed site at: https://pomali.github.io/share-now/

- Click **Sender** to share text via QR code
- Click **Receiver** to scan a QR code

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

Visit http://localhost:5173/share-now/

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
- **GitHub Pages** - Hosting

## License

This project is open source and available under the [MIT License](LICENSE).

