# Deployment Guide for Seamless

This guide covers deploying the Seamless application to production.

## Prerequisites

- A GitHub, GitLab, or Bitbucket account
- An Eden AI API key ([Get one here](https://www.edenai.co/))
- A Vercel account (recommended) or another hosting platform

## Option 1: Deploy to Vercel (Recommended)

Vercel is the recommended platform for Next.js applications with zero-config deployment.

### Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. **Push to GitHub**:
   - Create a new repository on GitHub
   - Push your code:
```bash
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Sign up/Login to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**:
   - In the project settings, go to "Environment Variables"
   - Add:
     - **Name**: `EDENAI_API_KEY`
     - **Value**: Your Eden AI API key
   - Select "Production", "Preview", and "Development"
   - Click "Save"

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (usually 2-3 minutes)
   - Your app will be live at `your-project-name.vercel.app`

### Step 3: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

## Option 2: Deploy to Other Platforms

### Netlify

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Build and Deploy**:
```bash
npm run build
netlify deploy --prod
```

3. **Set Environment Variables**:
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add `EDENAI_API_KEY`

### Railway

1. **Install Railway CLI**:
```bash
npm install -g @railway/cli
railway login
```

2. **Deploy**:
```bash
railway init
railway up
```

3. **Set Environment Variables**:
   - In Railway dashboard → Variables → Add `EDENAI_API_KEY`

### Self-Hosted (Docker)

1. **Create Dockerfile**:
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

2. **Build and Run**:
```bash
docker build -t seam .
docker run -p 3000:3000 -e EDENAI_API_KEY=your_key_here seam
```

## Environment Variables Required

Make sure to set these in your hosting platform:

- `EDENAI_API_KEY` - Your Eden AI API key (required)

## Build Configuration

The project uses Next.js 15 with:
- **Build Command**: `npm run build` (automatic)
- **Output Directory**: `.next` (automatic)
- **Node Version**: 20.x (recommended)

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] App builds without errors
- [ ] Test image upload functionality
- [ ] Test header generation
- [ ] Test download functionality
- [ ] Check mobile responsiveness
- [ ] Set up custom domain (if needed)
- [ ] Enable analytics (optional)

## Troubleshooting

### Build Fails

1. **Check Node version**: Ensure you're using Node.js 18+ or 20+
2. **Check dependencies**: Run `npm install` locally first
3. **Check logs**: Review build logs in your platform's dashboard

### API Errors

1. **Verify API Key**: Ensure `EDENAI_API_KEY` is set correctly
2. **Check API Limits**: Verify your Eden AI account has available credits
3. **Check CORS**: Vercel handles CORS automatically, but check if using other platforms

### Image Generation Fails

1. **Check Eden AI Status**: Visit [Eden AI Status Page](https://status.edenai.co/)
2. **Verify Provider Access**: Ensure your Eden AI account has access to image generation providers
3. **Check API Response**: Review server logs for detailed error messages

## Performance Optimization

1. **Enable Edge Functions** (Vercel):
   - Consider using Edge Runtime for API routes if needed
   - Update `route.ts` with `export const runtime = 'edge'` (if compatible)

2. **Image Optimization**:
   - Next.js Image component is configured
   - Sharp is included for server-side image processing

3. **Caching**:
   - Vercel automatically caches static assets
   - API routes can be cached using headers

## Monitoring

- **Vercel Analytics**: Available in Vercel dashboard
- **Error Tracking**: Consider adding Sentry or similar
- **Performance**: Monitor API response times in Vercel dashboard

## Support

For issues:
- Check [Next.js Documentation](https://nextjs.org/docs)
- Check [Eden AI Documentation](https://docs.edenai.co/)
- Review build logs in your deployment platform

