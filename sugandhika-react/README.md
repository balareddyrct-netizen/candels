# Sugandhika — React Web App

Handcrafted candles e-commerce site built with React + Vite + React Router.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

## Build for Production

```bash
npm run build
# Output in /dist folder — deploy to Netlify, Vercel, or any static host
```

## Deploy to Netlify (Free)

1. Create account at netlify.com
2. Run `npm run build`
3. Drag the `/dist` folder into Netlify's deploy area
4. Done — your site is live!

## Project Structure

```
sugandhika-react/
├── public/
│   └── images/          ← All candle product photos (33 images)
│       ├── logo.jpg
│       ├── rose_01.jpg
│       └── ...
├── src/
│   ├── components/
│   │   ├── Navbar.jsx   ← Fixed navbar with logo, cart count
│   │   └── Footer.jsx   ← Footer with links
│   ├── context/
│   │   └── AppContext.jsx ← Cart state + Toast notifications
│   ├── data/
│   │   └── products.js  ← All 10 products + fragrances + testimonials
│   ├── hooks/
│   │   └── useReveal.js ← Scroll reveal animation hook
│   ├── pages/
│   │   ├── Home.jsx     ← Hero, featured products, testimonials
│   │   ├── Collection.jsx ← Full product grid, filters, + Add Product upload
│   │   ├── Product.jsx  ← Product detail with image gallery
│   │   ├── Customize.jsx ← Real-time 3D candle builder + WebAudio sound
│   │   ├── Cart.jsx     ← Cart with qty controls and order summary
│   │   ├── Story.jsx    ← Brand story with photo chapters
│   │   └── Ritual.jsx   ← 7-step candle care guide + scent table
│   ├── App.jsx          ← Router + layout
│   └── main.jsx         ← Entry point
└── package.json
```

## Pages

| Route | Page |
|---|---|
| `/` | Homepage |
| `/collection` | Product grid with filters |
| `/product/:id` | Product detail |
| `/customize` | Real-time candle builder |
| `/cart` | Shopping cart |
| `/story` | Brand story |
| `/ritual` | Candle care guide |

## Adding New Products

**Option A — In-browser:** Go to `/collection` → click **"+ Add Product"** button → fill in details and upload photo. The product appears instantly (stored in React state for the session).

**Option B — In code:** Open `src/data/products.js` and add a new entry to the `PRODUCTS` array. Place the product image in `public/images/` and reference it as `/images/your-image.jpg`.

## Features

- React Router v6 — true multi-page navigation
- Cart persisted in localStorage across sessions
- Real-time candle customizer with drag-to-rotate 3D SVG candle
- WebAudio API crackling fire ambient sound on customize page
- Scroll reveal animations on all pages
- Custom gold cursor
- Fully responsive — mobile hamburger menu
- All 10 real product photos integrated
- Logo displayed in navbar and footer
