# Cards Manager

A beautiful, modern card management application built with Next.js. Create, edit, delete, and organize your ideas with an intuitive and visually stunning interface.

## Features

- ✨ **Create Cards** - Add new cards with title and content
- ✏️ **Edit Cards** - Inline editing with save/cancel functionality
- 🗑️ **Delete Cards** - Remove cards you no longer need
- 💾 **Persistent Storage** - Cards are saved in localStorage
- 🎨 **Modern Design** - Glassmorphism effects, smooth animations, and gradient accents
- 📱 **Responsive** - Works beautifully on all devices

## Getting Started

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Deploy to Vercel

The easiest way to deploy this app is using [Vercel](https://vercel.com):

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository to Vercel
3. Vercel will automatically detect Next.js and configure the build settings
4. Click "Deploy"

Alternatively, use the Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Vanilla CSS with modern design patterns
- **Storage**: localStorage (client-side)
- **Deployment**: Vercel-ready

## Project Structure

```
card-manager/
├── pages/
│   ├── _app.js          # App wrapper
│   ├── _document.js     # HTML document
│   └── index.js         # Main page with card functionality
├── styles/
│   └── globals.css      # Global styles and design system
├── package.json
├── next.config.js
└── README.md
```

## License

MIT
