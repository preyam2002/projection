# Seamless

Create seamless X/Twitter profiles where your header and profile picture flow together perfectly.

## What is Seamless?

Seamless is a web tool that helps you create visually stunning X/Twitter profiles by seamlessly connecting your banner and profile picture. Upload any image, position it precisely using our visual editor, and download perfectly sized assets for your profile.

## Features

- 🖼️ **Visual Editor** - Drag, zoom, and position your image with real-time preview
- 🎯 **Perfect Alignment** - Ensures your profile picture and banner align flawlessly
- 📱 **Mobile-First Design** - Works beautifully on all devices
- ⚡ **Fast & Lightweight** - Built with Next.js for optimal performance
- 🎨 **Modern UI** - Beautiful glass-morphism design with smooth animations
- 💾 **Persistent State** - Your edits are saved locally as you work
- 📥 **Easy Export** - Download ready-to-use images for immediate upload

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) + [GSAP](https://gsap.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Canvas Editing**: [Konva.js](https://konvajs.org/) + [React Konva](https://konvajs.org/docs/react/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/preyam2002/projection.git
cd projection
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Upload an Image** - Drag and drop or click to select an image (up to 5MB)
2. **Position Your Image** - Use the visual editor to align the circular crop area
3. **Preview in Real-Time** - See exactly how your profile will look
4. **Download Assets** - Get perfectly sized images for your X/Twitter profile
5. **Upload to X** - Set the downloaded images as your header and profile picture

## Project Structure

```
app/
├── editor/           # Editor page component
├── error.tsx         # Error boundary
├── layout.tsx        # Root layout
├── not-found.tsx     # 404 page
└── page.tsx          # Home page (upload zone)

components/
├── CropTool.tsx      # Circular cropping interface
├── Editor.tsx        # Main editor component
├── HeaderPreview.tsx # Header preview component
├── ShuffleText.tsx   # Animated text component
├── UploadZone.tsx    # File upload component
└── ui/               # UI components

lib/
├── store.ts          # Zustand state management
└── utils.ts          # Utility functions

public/
├── example.png       # Example output image
└── logo.png          # App logo
```

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

```bash
npm run build
```

Or deploy directly from GitHub to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/preyam2002/projection)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

Built with ❤️ by [Preyam](https://github.com/preyam2002)

---

**Live Demo**: [projection-sable.vercel.app](https://projection-sable.vercel.app)
