# VTxMus

<div align="center">

![VTxMus Logo](public/favicon.ico)

A modern, elegant NetEase Cloud Music client built with Vue 3 + TypeScript

[中文文档](./README_CN.md) | English

</div>

## Features

- **Music Search** - Search for songs, artists, and albums
- **High-Quality Playback** - Support for multiple audio quality levels (up to Hi-Res)
- **Playlist Management** - Create and manage your playlists
- **Favorites** - Save your favorite songs locally
- **Modern UI** - Beautiful dark gradient theme with smooth animations
- **Playback Modes** - Sequential, single loop, and random playback
- **Fully Responsive** - Perfect experience on desktop, tablet, and mobile devices
- **Touch Optimized** - Enhanced touch interactions for mobile devices
- **Desktop App** - Available as Electron desktop application
- **Production Ready** - Optimized for deployment with automatic API routing

## Quick Start

### Prerequisites

- Node.js >= 20.19.0 or >= 22.12.0
- Python 3.x (for API service)
- NetEase Cloud Music account with VIP membership (for high-quality audio)

### Installation

1. Clone the repository

```bash
git clone https://github.com/DarkStarLan/VTxMus.git
cd VTxMus
```

2. Install dependencies

```bash
npm install
```

3. Configure Cookie

Copy your NetEase Cloud Music cookie to `login_cookie.txt`:

```bash
# Get your cookie from browser after logging in to music.163.com
# Copy the entire cookie string to login_cookie.txt
```

4. Start the application

**Windows (Easiest):**

```bash
start.bat
```

**Manual Start:**

```bash
# Terminal 1: Start proxy server
npm run dev:proxy

# Terminal 2: Start frontend
npm run dev:vite
```

5. Open your browser and visit `http://localhost:5173`

## Audio Quality Levels

Configure audio quality in `src/config/api.ts`:

```typescript
export const DEFAULT_QUALITY = QualityLevel.EXHIGH
```

Available quality levels:

- `STANDARD` - Standard (128kbps)
- `EXHIGH` - Extra High (320kbps) [Default]
- `LOSSLESS` - Lossless (FLAC)
- `HIRES` - Hi-Res (24bit/96kHz)
- `JYEFFECT` - HD Surround Sound
- `SKY` - Immersive Surround Sound
- `JYMASTER` - Ultra HD Master

> Note: Higher quality levels require VIP membership

## Tech Stack

- **Frontend Framework**: Vue 3 + TypeScript
- **State Management**: Pinia
- **Build Tool**: Vite
- **Desktop**: Electron
- **API Proxy**: Express + Node.js
- **Styling**: CSS3 with modern animations
- **Testing**: Vitest + Cypress

## Build

### Web Application

```bash
npm run build
```

The built files will be in the `dist` directory.

### Desktop Application

```bash
# Windows
npm run electron:build:win

# All platforms
npm run electron:build
```

## Deployment

### Deploy to Production Server

This project is optimized for deployment to production servers with automatic API routing that works on both mobile and desktop devices.

**Quick Deploy:**

```bash
# 1. Build the project
npm run build

# 2. Verify the build
./verify-build.bat  # Windows
./verify-build.sh   # Linux/Mac

# 3. Upload to server and configure
# See DEPLOY_GUIDE.md for detailed instructions
```

**Key Features for Production:**
- ✅ Automatic API routing (no hardcoded localhost)
- ✅ Works on mobile and desktop browsers
- ✅ Subdirectory deployment support (e.g., `/VTxMus/`)
- ✅ Nginx configuration included
- ✅ PM2 process management

**Documentation:**
- 📖 [Complete Deployment Guide](./DEPLOY_GUIDE.md)
- ✅ [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- 📝 [Changes Summary](./CHANGES_SUMMARY.md)
- ⚙️ [Nginx Configuration Example](./nginx.conf.example)

### Responsive Design

The application is fully responsive with optimized layouts for:
- 📱 **Mobile** (≤ 768px): Single column, bottom player, drawer-style playlist
- 📱 **Tablet** (768px - 1024px): Two-column layout
- 💻 **Desktop** (> 1024px): Full multi-column layout
- 👆 **Touch Devices**: Minimum 44x44px touch targets, optimized gestures

## Development

```bash
# Run tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
VTxMus/
├── src/
│   ├── api/              # API integration
│   ├── components/       # Vue components
│   ├── config/           # Configuration files
│   ├── router/           # Vue Router
│   ├── stores/           # Pinia stores
│   ├── utils/            # Utility functions
│   └── views/            # Page components
├── electron/             # Electron main process
├── public/               # Static assets
├── proxy-server.js       # API proxy server
└── package.json
```

## Acknowledgments

This project uses the following open-source projects:

- [@.ai/Netease_url](https://github.com/yourusername/Netease_url) - NetEase Cloud Music API parsing and technical support
- [Font Awesome Free 7.2.0](https://fontawesome.com/) - Icon library for beautiful UI elements

## Disclaimer

This project is for **educational and personal use only**. Please do not use it for commercial purposes. Users should comply with NetEase Cloud Music's terms of service.

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact

If you have any questions or suggestions, feel free to open an issue.

---

**Enjoy the music!**
