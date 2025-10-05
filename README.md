# Brisker

A modern Progressive Web App (PWA) for keeping score in the classic card game Bezique, with real-time multiplayer support and offline capabilities.

## 🎯 Features

### Core Functionality
- **Digital Score Tracking** - Replace pen and paper with an intuitive touch interface
- **Real-time Multiplayer** - Play with opponents over the network via WebSocket connection
- **Offline Mode** - Continue playing when network connection is unavailable
- **Score History** - View detailed game history and undo moves
- **Dealer Tracking** - Visual indicators show who dealt each hand

### Technical Features
- **Progressive Web App** - Install on any device, works like a native app
- **Multilingual Support** - Available in multiple languages
- **Cross-platform** - Works on desktop, tablet, and mobile devices
- **Network Discovery** - Find and connect with nearby players
- **Persistent Storage** - Game state automatically saved and restored

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/emreerkan/brisker.git
   cd brisker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   # HTTP server (recommended for network testing)
   npm run dev
   
   # HTTPS server (required for PWA features)
   npm run dev-https
   ```

## 🎮 How to Play

1. **Solo Play** - Start scoring immediately for local games
2. **Multiplayer** - Search for nearby players or connect via network
3. **Score Entry** - Tap point values to add scores for each hand
4. **Brisk Scoring** - Special handling for brisk (remaining tricks) points
5. **Game Management** - Reset, undo, or view history as needed

## 🛠️ Architecture

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling and development server
- **PWA** capabilities with offline support
- **CSS Modules** for component styling

### Backend
- **Node.js** WebSocket server
- **Express** for HTTP endpoints
- **Real-time communication** via WebSocket
- **Player discovery** and matchmaking

### Key Components
- `Brisker` - Main game interface
- `GameServerAPI` - WebSocket client with reconnection logic
- `useBeziqueGame` - Game state management hook
- Score tracking, history, and multiplayer synchronization

## 📱 PWA Features

- **Installable** - Add to home screen on mobile devices
- **Offline Ready** - Core functionality works without internet
- **App-like Experience** - Full-screen, native feel
- **Auto-updates** - New versions deployed seamlessly

## 🌐 Network Setup

The app supports both local and network multiplayer:

- **Local Development** - `http://localhost:5173`
- **Network Access** - Server listens on all interfaces (`0.0.0.0`)
- **HTTPS Support** - SSL certificates for secure connections
- **Flexible Configuration** - Easy IP/port configuration

## 🌐 Brisker Server

The Brisker app relies on the Brisker Server for real-time multiplayer functionality. You can find the server project [here](https://github.com/emreerkan/brisker-server/).

For setup and usage instructions, refer to the server's README.

## 🔧 Scripts

- `npm run dev` - Start HTTP development server
- `npm run dev-https` - Start HTTPS development server  
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌍 Translations

Special thanks to the following contributors for their translation work:

- **Dutch (nl)** - Peter Smits

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
