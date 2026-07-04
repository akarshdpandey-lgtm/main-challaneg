import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { generateCulturalPlan } from './services/gemini.js';

dotenv.config();
// Support loading from parent directory during development
dotenv.config({ path: path.join(process.cwd(), '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*', // Allow all in development, can restrict in production
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Static assets (if any)
// In production, we could serve the client build from here
// app.use(express.static(path.join(process.cwd(), '../client/dist')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    geminiKeySet: !!process.env.GEMINI_API_KEY,
    googleMapsKeySet: !!process.env.VITE_GOOGLE_MAPS_API_KEY
  });
});

// Endpoint: Generate Cultural Plan via Gemini API
app.post('/api/generate-plan', async (req, res) => {
  const { destination, duration, budget, style, accessibility, dietary } = req.body;

  // Validation
  if (!destination) {
    return res.status(400).json({ error: 'Destination is required.' });
  }

  const durationNum = parseInt(duration, 10);
  if (isNaN(durationNum) || durationNum < 1 || durationNum > 10) {
    return res.status(400).json({ error: 'Duration must be a number between 1 and 10.' });
  }

  try {
    console.log(`Generating plan for: ${destination} (${durationNum} days, budget: ${budget}, style: ${style})`);
    const plan = await generateCulturalPlan({
      destination,
      duration: durationNum,
      budget: budget || 'Mid-range',
      style: style || 'Cultural',
      accessibility: accessibility || 'None',
      dietary: dietary || 'None'
    });

    res.json(plan);
  } catch (error) {
    console.error('Plan generation failed:', error.message);
    res.status(500).json({ 
      error: 'Plan generation failed.', 
      details: error.message 
    });
  }
});

// Handle React Router SPA fallback in production if serving build
// app.get('*', (req, res) => {
//   res.sendFile(path.join(process.cwd(), '../client/dist/index.html'));
// });

app.listen(PORT, () => {
  console.log(`🚀 Cultural travel server running on http://localhost:${PORT}`);
});
