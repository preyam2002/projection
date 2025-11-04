# Seamless - Twitter Profile Generator

A modern Next.js application that generates seamless Twitter profiles (header + profile picture) from a single uploaded image.

## Features

- **Image Upload**: Drag-and-drop interface for uploading images
- **Circular Crop Selector**: Interactive canvas editor with draggable and resizable circular crop tool
- **AI Header Generation**: Uses Eden AI to generate matching Twitter headers (1500x500px)
- **Preview**: View your generated profile with desktop and mobile layouts
- **Download**: Export both header and profile picture images

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: Zustand
- **Canvas**: React Konva
- **AI**: Eden AI (Image Generation API)
- **Image Processing**: Sharp

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:
   Create a `.env.local` file:

```
EDENAI_API_KEY=your_eden_ai_api_key_here
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Navigate to `/upload` to upload an image
2. Use the editor at `/editor` to:
   - Drag and resize the circular crop selector
   - Adjust zoom levels
   - Generate a matching Twitter header
3. Preview your profile and download the images

## Project Structure

```
projection/
├── app/
│   ├── api/
│   │   └── outpaint/      # Eden AI image generation endpoint
│   ├── editor/            # Editor page
│   ├── upload/            # Upload page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── Editor.tsx         # Main editor component
│   ├── Preview.tsx        # Preview modal
│   └── UploadZone.tsx     # Upload component
├── lib/
│   └── store.ts           # Zustand store
└── package.json
```

## Environment Variables

- `EDENAI_API_KEY`: Your Eden AI API key (required)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy to Vercel:**

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add the `EDENAI_API_KEY` environment variable
4. Deploy!

For detailed steps and alternative deployment options (Netlify, Railway, Docker), see the [Deployment Guide](./DEPLOYMENT.md).

## License

MIT
