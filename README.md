# VoyaCulture - AI-Powered Cultural Travel Architect

VoyaCulture is a production-ready, premium cultural travel planner and destination discovery application. Leveraging the Google Gemini API, it crafts personalized, day-by-day travel itineraries complete with historical context, folklore narration, traditional gastronomy guides, artisan workshops, and safety tips.

## Key Features

- **AI Destination Discovery**: Personalized, budget-aware, and accessibility-aware itineraries generated on-the-fly via Gemini.
- **Dual-Engine Map**: Integrates Google Maps, and automatically falls back to an offline-capable, interactive Leaflet (OpenStreetMap) layout when API keys are not supplied.
- **Immersive Lore (Story Mode)**: Provides cultural context and ancient myths of destinations, accompanied by a browser-native text-to-speech (TTS) voice narrator.
- **Smart Path Optimization**: Rearranges daily schedules to minimize travel time using a local nearest-neighbor greedy routing solver.
- **Calendar Integrations**: Generates and downloads native `.ics` files to sync daily travel activities to Google Calendar, Apple Calendar, or Outlook.
- **Zero-Database Sharing**: Compresses entire itineraries into URL hashes allowing travelers to share their bespoke plans.

---

## Technology Stack

### Frontend
- **React + Vite** (JavaScript core framework)
- **Tailwind CSS v4** (Modern utility-first styling with native CSS compiler)
- **React Router v6** (Client routing)
- **Framer Motion** (Glassmorphism card animations & transitions)
- **React Hook Form + Zod** (Input validations)
- **Leaflet & React-Leaflet** (Open-source mapping engine fallback)
- **@react-google-maps/api** (Google Maps loader)

### Backend
- **Node.js & Express**
- **Google Generative AI SDK** (`@google/generative-ai`)

---

## Directory Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI (Navbar, GlassCard, MapContainer)
│   │   ├── pages/          # Layouts (Home, Planner, Dashboard, Share)
│   │   ├── App.jsx         # Router config
│   │   ├── index.css       # Tailwind v4 import & custom styles
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js      # Vite compilation & proxy setup
├── server/                 # Express backend
│   ├── services/
│   │   └── gemini.js       # Gemini API client & prompt schemas
│   ├── server.js           # Server application
│   └── package.json
├── package.json            # Monorepo task configurations
├── vercel.json             # Vercel deployment parameters
└── .env                    # Local environment variables
```

---

## Installation & Local Execution

### 1. Configure Environment Variables
Create a `.env` file at the root of the workspace (a template has been generated as `.env.example`):
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```
> **Note**: If `VITE_GOOGLE_MAPS_API_KEY` is omitted, the app runs on the high-performance Leaflet fallback engine automatically.

### 2. Install Dependencies
Run the install command at the root to recursively fetch node modules for the server and client:
```bash
npm run install-all
```

### 3. Start Development Servers
Run the dev command to launch the Express backend (port 3001) and Vite frontend (port 3000) concurrently:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Design System

The application implements a premium, dark-mode styling scheme:
- **Glassmorphism**: Backdrop blur effects (`backdrop-blur-md`), dark transparency (`bg-slate-900/60`), and subtle borders.
- **Accented Colors**: Soft glowing purples (`violet-600`), cyans, and pinks.
- **Micro-Interactions**: Smooth hover offsets and page entry translations using Framer Motion.
- **Typography**: Outfit heading typeface and Inter body fonts loaded dynamically via Google Fonts.

---

## Deployment

The application is prepared for instant deployment:
- **Frontend & Serverless Functions**: Configure Vercel using the pre-made `vercel.json`. Set `GEMINI_API_KEY` and `VITE_GOOGLE_MAPS_API_KEY` in Vercel's Dashboard Environment settings.
- **Standalone Frontend + Managed Backend**: Build client code (`npm run build:client`) and host build static folder on Vercel, Netlify, or GitHub Pages. Deploy the `server/` directory to Google Cloud Run, Render, or Railway.
