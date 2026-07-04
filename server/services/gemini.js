import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Support running directly or from npm scripts
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

// Generate the system instruction to make Gemini behave as a premium cultural guide
const SYSTEM_INSTRUCTION = `You are a world-class, premium Cultural Travel Architect and Local Historian. 
Your goal is to curate immersive, highly accurate, and deeply cultural travel itineraries and discovery guides.
You focus on historical context, artisan preservation, local stories, hidden gems, and respecting local etiquette.
You must NEVER return placeholder text, fake templates, or generic AI responses.
Every attraction, event, workshop, and story must be real, accurate, and customized for the destination.
Provide precise geographical coordinates (latitude and longitude) for all locations so they can be mapped accurately.`;

export async function generateCulturalPlan(params) {
  if (!apiKey || !genAI) {
    throw new Error('Google Gemini API Key is missing. Please set GEMINI_API_KEY in your env file.');
  }

  const { destination, duration, budget, style, accessibility, dietary } = params;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const prompt = `
Create a comprehensive cultural travel plan for the destination: "${destination}".
Details of the traveler's request:
- Duration: ${duration} days
- Budget Tier: ${budget}
- Travel Style/Focus: ${style}
- Accessibility Requirements: ${accessibility || 'None specified'}
- Dietary Restrictions: ${dietary || 'None specified'}

The plan must match the following JSON schema:
{
  "destinationInfo": {
    "name": "string (canonical name, e.g. Kyoto, Japan)",
    "summary": "string (compelling overview)",
    "history": "string (historical background)",
    "bestTimeToVisit": "string",
    "currency": "string",
    "localLanguage": "string",
    "safetyTips": "string",
    "culturalDos": ["string"],
    "culturalDonts": ["string"]
  },
  "culturalStory": {
    "title": "string (the title of a famous local legend, history, or myth)",
    "story": "string (a beautifully told, detailed narrative of 2-3 paragraphs about a key historical event, local legend, myth, or cultural concept of the area)",
    "historicalContext": "string (context for this story)",
    "localLegend": "string (details of a folklore or legend)",
    "significance": "string (how it shapes local culture today)"
  },
  "heritageSites": [
    {
      "name": "string",
      "description": "string",
      "history": "string",
      "preservationInfo": "string (how this site is being preserved or how tourists can support it)",
      "artisanRecommendation": "string (local artisans, traditional crafts shops, or workshops nearby)",
      "latitude": number (accurate float, e.g. 35.0394),
      "longitude": number (accurate float, e.g. 135.7292),
      "tips": "string"
    }
  ],
  "localExperiences": {
    "traditionalFoods": [
      {
        "name": "string",
        "description": "string",
        "whereToTry": "string (specific market, street, or area)",
        "dietaryNotes": "string (veg/non-veg status, customized to user's dietary restriction)"
      }
    ],
    "localMarkets": [
      {
        "name": "string",
        "description": "string",
        "whatToBuy": "string",
        "hours": "string"
      }
    ],
    "workshops": [
      {
        "name": "string (traditional craft, cooking, art classes)",
        "description": "string",
        "bookingTip": "string"
      }
    ],
    "musicAndDance": [
      {
        "name": "string",
        "description": "string",
        "culturalSignificance": "string"
      }
    ]
  },
  "localEvents": [
    {
      "name": "string (name of festival or celebration)",
      "dateRange": "string",
      "description": "string",
      "culturalSignificance": "string"
    }
  ],
  "itinerary": [
    {
      "day": number,
      "theme": "string (focus of the day)",
      "activities": [
        {
          "timeOfDay": "string (specific hour in 24h format, e.g. 10:00, 13:00, 17:30, 18:00)",
          "name": "string",
          "type": "string (heritage | dining | hidden_gem | local_experience)",
          "duration": "string (e.g. 2h, 1.5h, 3h)",
          "travelTime": "string (e.g. 0 min, 20 min, 10 min representing transit time from previous location)",
          "cost": "string (e.g. $5 USD, Free, $2 USD)",
          "description": "string",
          "latitude": number (float),
          "longitude": number (float)"
        }
      ]
    }
  ],
  "hiddenGems": [
    {
      "name": "string",
      "description": "string",
      "latitude": number (float),
      "longitude": number (float),
      "whySpecial": "string (why it is off-the-beaten path and its cultural value)"
    }
  ]
}

Strictly follow these rules:
1. Every latitude and longitude MUST be realistic. If you don't know the exact decimal, provide the closest valid coordinates for that landmark.
2. The itinerary MUST contain exactly ${duration} days, matching the number specified in the query.
3. Tailor the itinerary, food recommendations, and pace to the user's budget (${budget}), style (${style}), accessibility requirements (${accessibility}), and dietary restrictions (${dietary}).
4. Do not wrap the JSON output in markdown backticks. Return the JSON object directly.
`;

  const response = await model.generateContent(prompt);
  const responseText = response.response.text().trim();

  // Try parsing the response
  try {
    let cleanedText = responseText;
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();
    
    const parsedData = JSON.parse(cleanedText);
    return parsedData;
  } catch (err) {
    console.error('Failed to parse Gemini response as JSON. Raw text was:', responseText);
    throw new Error('Failed to generate plan. AI returned an invalid response format.');
  }
}
