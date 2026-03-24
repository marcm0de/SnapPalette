# SnapPalette 🎨

Instant color palette generator from images. Drop an image, extract dominant colors, copy codes, and export — all in your browser.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Drag & drop** or file picker for images
- **K-means clustering** extracts 4–8 dominant colors (no external API)
- **Color codes** — HEX, RGB, HSL with click-to-copy
- **Export** as CSS custom properties, Tailwind config, SCSS variables, or JSON
- **Palette history** — last 10 palettes saved in localStorage
- **Palette naming** and management
- **WCAG contrast checker** — AA/AAA compliance for white and black text
- **Dark mode** toggle
- **Smooth animations** via Framer Motion
- **100% client-side** — no data leaves your browser

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand) (state + persistence)
- [Framer Motion](https://www.framer.com/motion/) (animations)
- [Lucide React](https://lucide.dev/) (icons)

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

1. Image pixels are sampled via an off-screen `<canvas>`
2. K-means++ clustering groups similar colors into centroids
3. Centroids become the palette — sorted dark to light
4. WCAG contrast ratios are calculated for accessibility checking

## License

[MIT](LICENSE)
