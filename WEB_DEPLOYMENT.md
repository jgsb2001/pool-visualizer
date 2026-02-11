# Web Deployment Guide
## Deploy Pool Visualizer to Free Hosting

---

## Option 1: Vercel (Recommended - Easiest)

### Why Vercel?
- Built specifically for Next.js
- Free tier is generous (100GB bandwidth/month)
- Automatic HTTPS
- Global CDN
- Zero configuration
- Automatic deployments from Git

### Step 1: Prepare Your Project

**1. Create `.gitignore` (if not exists):**
```bash
# Already included in Next.js, but verify:
node_modules/
.next/
.env*.local
*.log
.vercel
```

**2. Create `vercel.json` in project root:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

**3. Convert Express API to Serverless Functions:**

Create `/api` folder in root if it doesn't exist:
```
_Pool/
  └─ api/
      └─ upload.ts  (serverless function)
```

Move Express routes to Vercel serverless functions:
```typescript
// api/upload.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'POST') {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Upload failed' });
      }

      // Process tile upload
      // Return processed texture URLs
      res.status(200).json({
        textureUrl: '/uploads/tile.jpg',
        normalMapUrl: '/uploads/tile-normal.jpg'
      });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
```

### Step 2: Deploy to Vercel

**Method A: Vercel CLI (Command Line)**

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
cd /Users/jonathangibson/Desktop/_Pool
vercel

# Follow prompts:
# - Setup and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? pool-visualizer
# - Directory? ./ (current directory)
# - Override settings? No

# Production deployment
vercel --prod
```

**Method B: Vercel Dashboard (Web UI - Easier)**

```
1. Push code to GitHub:
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/pool-visualizer.git
   git push -u origin main

2. Go to vercel.com → Sign up/Login (use GitHub)

3. New Project → Import Git Repository

4. Select your pool-visualizer repo

5. Configure:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next
   - Install Command: npm install --legacy-peer-deps

6. Environment Variables (if needed):
   - Add any .env variables here

7. Deploy

8. Done! Your app is live at: https://pool-visualizer.vercel.app
```

### Step 3: Custom Domain (Optional)

```
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add Domain: yourdomain.com
3. Follow DNS instructions:
   - Add CNAME record: www → cname.vercel-dns.com
   - Add A record: @ → 76.76.19.19
4. Wait for DNS propagation (5 mins - 24 hrs)
5. Automatic HTTPS enabled
```

---

## Option 2: Netlify

### Why Netlify?
- Similar to Vercel
- Great for static sites
- Free tier: 100GB bandwidth
- Form handling built-in
- Easy drag-and-drop deployment

### Deploy to Netlify

**Method A: Drag & Drop (Quick Test)**

```
1. Build your app:
   npm run build
   npm run export  # If using static export

2. Go to netlify.com → Sign up

3. Drag .next folder (or out folder if exported) to Netlify drop zone

4. Site is live! (random URL like: random-name-123.netlify.app)
```

**Method B: Git Integration (Automatic Deploys)**

```
1. Push to GitHub (same as Vercel)

2. Netlify → New Site from Git

3. Connect to GitHub → Select repo

4. Build settings:
   - Build command: npm run build
   - Publish directory: .next
   - Functions directory: api (if using serverless)

5. Advanced:
   - Add environment variables

6. Deploy Site

7. Live at: https://pool-visualizer.netlify.app
```

### Custom Domain on Netlify:
```
1. Site Settings → Domain Management → Add Custom Domain
2. Follow DNS setup (similar to Vercel)
3. Enable HTTPS (automatic)
```

---

## Option 3: GitHub Pages (Free Static Hosting)

### Limitations:
- Static sites only (no server-side API)
- Need to export Next.js as static
- Client-side only rendering

### Setup Static Export

**1. Configure Next.js for Static Export:**

Edit `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true,
  basePath: '/pool-visualizer', // Your GitHub repo name
};

module.exports = nextConfig;
```

**2. Add Export Script:**

Edit `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "export": "next export",
    "deploy": "npm run build && npm run export && gh-pages -d out"
  }
}
```

**3. Install gh-pages:**
```bash
npm install --save-dev gh-pages
```

**4. Deploy:**
```bash
# Build and export
npm run build
npm run export  # Creates 'out' folder

# Deploy to GitHub Pages
npm run deploy
```

**5. Enable GitHub Pages:**
```
1. GitHub repo → Settings → Pages
2. Source: gh-pages branch
3. Save
4. Live at: https://YOUR_USERNAME.github.io/pool-visualizer/
```

---

## Option 4: Cloudflare Pages

### Why Cloudflare?
- Free unlimited bandwidth
- Fast global CDN
- Works with Workers (serverless functions)
- Great performance

### Deploy to Cloudflare Pages

```
1. Push to GitHub

2. Go to pages.cloudflare.com → Sign up

3. Create Project → Connect to Git

4. Select repository

5. Build settings:
   - Framework: Next.js
   - Build command: npm run build
   - Output: .next
   - Install: npm install --legacy-peer-deps

6. Deploy

7. Live at: https://pool-visualizer.pages.dev
```

---

## Comparison Table

| Feature | Vercel | Netlify | GitHub Pages | Cloudflare |
|---------|--------|---------|--------------|------------|
| Next.js Support | ★★★★★ Best | ★★★★ Good | ★★ Static only | ★★★★ Good |
| Free Bandwidth | 100GB | 100GB | Unlimited | Unlimited |
| Serverless Functions | ✓ Built-in | ✓ Built-in | ✗ No | ✓ Workers |
| Custom Domain | ✓ Free | ✓ Free | ✓ Free | ✓ Free |
| HTTPS | ✓ Auto | ✓ Auto | ✓ Auto | ✓ Auto |
| Setup Difficulty | Easy | Easy | Medium | Medium |
| Best For | Next.js apps | Any framework | Static sites | High traffic |

**Recommendation: Use Vercel for this project** (Next.js optimized)

---

## Performance Optimization for Deployment

### 1. Optimize 3D Assets

**Texture Compression:**
```bash
# Install sharp for image optimization
npm install sharp

# Compress textures before deployment
# Add to build script
```

Create `scripts/optimize-textures.js`:
```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const texturesDir = './public/textures';

fs.readdirSync(texturesDir, { recursive: true }).forEach(file => {
  if (file.endsWith('.jpg') || file.endsWith('.png')) {
    const inputPath = path.join(texturesDir, file);
    sharp(inputPath)
      .resize(2048, 2048, { fit: 'inside' }) // Max 2K textures for web
      .jpeg({ quality: 85 }) // Good quality/size balance
      .toFile(inputPath.replace('.png', '.jpg'))
      .then(() => console.log(`Optimized: ${file}`));
  }
});
```

**Add to package.json:**
```json
{
  "scripts": {
    "optimize": "node scripts/optimize-textures.js",
    "prebuild": "npm run optimize"
  }
}
```

### 2. Enable Gzip/Brotli Compression

**Vercel (automatic)**
- Already enabled

**Netlify:**
Add `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Encoding = "br"
```

### 3. Lazy Load Heavy Components

```typescript
// Instead of:
import { PoolScene } from './PoolScene';

// Use dynamic import:
import dynamic from 'next/dynamic';
const PoolScene = dynamic(() => import('./PoolScene'), {
  ssr: false, // Disable server-side rendering for 3D
  loading: () => <div>Loading 3D scene...</div>
});
```

### 4. Add Loading States

```typescript
// src/app/page.tsx
export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PoolVisualizer />
    </Suspense>
  );
}
```

---

## Environment Variables

### Setup for Production:

**1. Create `.env.production`:**
```bash
NEXT_PUBLIC_API_URL=https://your-api.vercel.app
NEXT_PUBLIC_CDN_URL=https://cdn.example.com
```

**2. Add to Vercel/Netlify Dashboard:**
```
Settings → Environment Variables
- NEXT_PUBLIC_API_URL = https://...
- Add any API keys (never commit to Git!)
```

**3. Access in Code:**
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

---

## Monitoring & Analytics

### Add Analytics (Free):

**Vercel Analytics:**
```bash
npm install @vercel/analytics
```

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Google Analytics:**
```typescript
// Add to <head> in layout.tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
  strategy="afterInteractive"
/>
```

---

## Troubleshooting Deployment

**Issue: Build fails with "legacy-peer-deps" error**
```
Solution: Add .npmrc file:
legacy-peer-deps=true
```

**Issue: 3D scene doesn't load**
```
Solution:
1. Check browser console for errors
2. Ensure textures are in /public/ folder
3. Verify import paths are correct
4. Disable SSR for Three.js components
```

**Issue: Textures missing in production**
```
Solution:
1. Ensure textures are in /public/textures/
2. Use relative paths: /textures/tile.jpg (not ./textures/)
3. Check case sensitivity (Linux servers)
```

**Issue: API routes not working**
```
Solution (Vercel):
1. Convert Express routes to /api folder
2. Use Vercel serverless function format
3. Check function logs in dashboard
```

---

## Post-Deployment Checklist

- ✓ Site loads on desktop
- ✓ Site loads on mobile
- ✓ 3D scene renders correctly
- ✓ Textures load properly
- ✓ Camera controls work
- ✓ File upload works (if applicable)
- ✓ No console errors
- ✓ Fast load time (<3s)
- ✓ HTTPS enabled
- ✓ Custom domain configured (optional)
- ✓ Analytics tracking (optional)

---

## Your Live URLs

After deployment, you'll have:

**Vercel:**
- `https://pool-visualizer.vercel.app`
- OR custom: `https://yourpoolvisualizer.com`

**Share Link:**
- Send URL to clients
- Embed in iframe: `<iframe src="https://..." />`
- Share on social media

**QR Code:**
- Generate at qr-code-generator.com
- Use your live URL
- Print for physical marketing

---

That's it! Your pool visualizer is now live and accessible from any device, anywhere in the world. 🎉
