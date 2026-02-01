# Siphon

A sleek desktop application for extracting audio and video from YouTube. Paste a link, choose your format, and download.

## Features

- **MP3 & MP4 Support** - Download audio-only or full video with a single click
- **Video Preview** - See title, uploader, and duration before downloading
- **Progress Tracking** - Real-time download progress bar
- **High Quality** - Best available audio/video quality extraction
- **Clean UI** - Modern interface with smooth animations

## Tech Stack

- **Electron** - Cross-platform desktop app framework
- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Framer Motion** - Animations
- **yt-dlp** - YouTube downloading backend
- **ffmpeg** - Audio/video processing

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
cd Siphon
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
# Windows
npm run build:win

# Not Currently Supported: 
# macOS
# npm run build:mac

# # Linux
# npm run build:linux
```

## Project Structure

```
Siphon/
├── src/
│   ├── main/          # Electron main process
│   ├── preload/       # Preload scripts
│   └── renderer/      # React frontend
│       └── src/
│           ├── components/    # UI components
│           ├── assets/        # Styles and assets
│           └── lib/           # Utilities
├── resources/
│   └── bin/           # yt-dlp and ffmpeg binaries
└── build/             # Build assets (icons)
```

## License

For personal, permitted use only.

---

Built by Sebastian Torres
