# Quick Start Guide

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create a `.env.local` file in the root directory:
```
EDENAI_API_KEY=your_eden_ai_api_key_here
```

Get your Eden AI API key from: https://www.edenai.co/

3. **Run the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Flow

1. **Home Page** (`/`) - Landing page with "Get Started" button
2. **Upload Page** (`/upload`) - Drag and drop or click to upload an image
3. **Editor Page** (`/editor`) - Automatically navigates after upload
   - Drag the circular crop selector to position it
   - Resize using the transform handles
   - Adjust zoom with +/- buttons
   - Click "Generate Header" to create a matching Twitter header
4. **Preview** - Click "Preview" button to see the result
5. **Download** - Download both header and profile picture images

## Features

- ✅ Drag-and-drop image upload
- ✅ Interactive circular crop selector
- ✅ Zoom controls
- ✅ AI-powered header generation (Eden AI)
- ✅ Desktop and mobile preview modes
- ✅ Download functionality

## Troubleshooting

### "npm run dev" not working
- Make sure you've run `npm install` first
- Check that Node.js version is 18+ or 20+

### Image generation fails
- Verify your `EDENAI_API_KEY` is set correctly
- Check that you have credits in your Eden AI account
- Review the browser console and server logs for errors

### Build errors
- Run `npm run lint` to check for issues
- Make sure all dependencies are installed
- Check TypeScript errors with `npx tsc --noEmit`

## Next Steps

- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- See [README.md](./README.md) for full documentation

