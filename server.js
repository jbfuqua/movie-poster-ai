// server.js - Enhanced Movie Poster AI Backend
const express = require(‘express’);
const cors = require(‘cors’);
const fetch = require(‘node-fetch’);
const path = require(‘path’);
const { Readable } = require(‘stream’);
const FormData = require(‘form-data’);
const rateLimit = require(‘express-rate-limit’);

const app = express();
const PORT = process.env.PORT || 3000;

// Environment variables with validation
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!ANTHROPIC_API_KEY || !OPENAI_API_KEY) {
console.error(‘Missing required API keys in environment variables’);
console.error(‘Required: ANTHROPIC_API_KEY, OPENAI_API_KEY’);
if (process.env.NODE_ENV !== ‘production’) {
console.error(‘Make sure you have a .env file with your API keys’);
}
}

// Rate limiting
const limiter = rateLimit({
windowMs: 15 * 60 * 1000, // 15 minutes
max: 20, // limit each IP to 20 requests per windowMs
message: { success: false, error: ‘Too many requests, please try again later.’ },
standardHeaders: true,
legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(express.json({ limit: ‘10mb’ }));
app.use(express.static(‘public’));
app.use(’/api/’, limiter);

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
const item = cache.get(key);
if (item && Date.now() - item.timestamp < CACHE_TTL) {
return item.data;
}
cache.delete(key);
return null;
}

function setCache(key, data) {
cache.set(key, { data, timestamp: Date.now() });
// Clean old entries periodically
if (cache.size > 100) {
const now = Date.now();
for (const [k, v] of cache.entries()) {
if (now - v.timestamp > CACHE_TTL) cache.delete(k);
}
}
}

// Enhanced prompt building helpers
function getEraAuthenticMedium(decade) {
const styles = {
‘1950s’: ‘hand-painted gouache poster art, classic Hollywood illustration’,
‘1960s’: ‘painted poster art, psychedelic illustration style’,
‘1970s’: ‘airbrush poster art, painted illustration’,
‘1980s’: ‘painted poster art with photographic elements’,
‘1990s’: ‘professional movie poster photography’,
‘2000s’: ‘digital photography, high-end commercial photography’,
‘2010s’: ‘IMAX quality photography, modern cinematography’,
‘2020s’: ‘ultra-high definition photography, premium commercial’
};
return styles[decade] || ‘professional movie poster art’;
}

function getCinematicTerms(genre) {
const terms = {
horror: ‘chiaroscuro lighting, practical effects makeup, gothic atmosphere’,
‘sci-fi’: ‘volumetric lighting, metallic surfaces, lens flares, clean futuristic design’,
thriller: ‘noir lighting, urban decay, dramatic shadows’,
action: ‘dynamic composition, motion blur, explosive lighting’,
drama: ‘natural portrait lighting, emotional depth’,
comedy: ‘bright lighting, warm tones, approachable composition’
};

for (const [key, value] of Object.entries(terms)) {
if (genre.toLowerCase().includes(key)) return value;
}
return ‘dramatic cinematic lighting’;
}

// Song recommendation database
function getSongDatabase() {
return {
‘1950s’: {
horror: [
{ title: ‘Monster Mash’, artist: ‘Bobby Pickett’, reason: ‘Classic 50s horror novelty song with vintage charm’ },
{ title: ‘Fever’, artist: ‘Peggy Lee’, reason: ‘Sultry jazz that captures 50s psychological thriller atmosphere’ },
{ title: ‘Cry Me a River’, artist: ‘Julie London’, reason: ‘Dark, moody jazz perfect for film noir horror’ }
],
‘sci-fi’: [
{ title: ‘Flying Purple People Eater’, artist: ‘Sheb Wooley’, reason: ‘Whimsical 50s sci-fi novelty hit’ },
{ title: ‘Mr. Sandman’, artist: ‘The Chordettes’, reason: ‘Dreamy harmony with otherworldly quality’ },
{ title: ‘Space Oddity’, artist: ‘David Bowie’, reason: ‘Timeless space exploration anthem’ }
],
default: [
{ title: ‘Only You’, artist: ‘The Platters’, reason: ‘Quintessential 50s romance and drama’ },
{ title: ‘Great Balls of Fire’, artist: ‘Jerry Lee Lewis’, reason: ‘High-energy 50s rock perfect for action scenes’ },
{ title: ‘Blue Moon’, artist: ‘Billie Holiday’, reason: ‘Timeless jazz standard with emotional depth’ }
]
},
‘1980s’: {
horror: [
{ title: ‘Thriller’, artist: ‘Michael Jackson’, reason: ‘The ultimate 80s horror anthem with iconic video’ },
{ title: ‘Somebody's Watching Me’, artist: ‘Rockwell’, reason: ‘Paranoid 80s synth-pop perfect for psychological horror’ },
{ title: ‘Love Song for a Vampire’, artist: ‘Annie Lennox’, reason: ‘Gothic new wave with dark romantic themes’ }
],
‘sci-fi’: [
{ title: ‘Blue Monday’, artist: ‘New Order’, reason: ‘Futuristic synth-pop defining 80s electronic sound’ },
{ title: ‘Cars’, artist: ‘Gary Numan’, reason: ‘Robotic new wave about technology and isolation’ },
{ title: ‘Sweet Dreams’, artist: ‘Eurythmics’, reason: ‘Synth-pop classic with dystopian undertones’ }
],
default: [
{ title: ‘Don't Stop Believin'’, artist: ‘Journey’, reason: ‘Anthemic 80s rock with emotional crescendo’ },
{ title: ‘Take On Me’, artist: ‘a-ha’, reason: ‘Upbeat synth-pop with innovative production’ },
{ title: ‘Every Breath You Take’, artist: ‘The Police’, reason: ‘Haunting pop with dark surveillance themes’ }
]
},
‘2020s’: {
horror: [
{ title: ‘bad guy’, artist: ‘Billie Eilish’, reason: ‘Dark pop with minimalist horror aesthetic’ },
{ title: ‘Therefore I Am’, artist: ‘Billie Eilish’, reason: ‘Menacing pop with psychological edge’ },
{ title: ‘Bury a Friend’, artist: ‘Billie Eilish’, reason: ‘Haunting electropop perfect for modern horror’ }
],
‘sci-fi’: [
{ title: ‘Blinding Lights’, artist: ‘The Weeknd’, reason: ‘Synthwave hit with retro-futuristic sound’ },
{ title: ‘Levitating’, artist: ‘Dua Lipa’, reason: ‘Disco-pop with space-age production’ },
{ title: ‘Physical’, artist: ‘Dua Lipa’, reason: ‘Electronic dance perfect for action sequences’ }
],
default: [
{ title: ‘drivers license’, artist: ‘Olivia Rodrigo’, reason: ‘Emotional ballad defining 2020s storytelling’ },
{ title: ‘Good 4 U’, artist: ‘Olivia Rodrigo’, reason: ‘Pop-punk energy perfect for dramatic moments’ },
{ title: ‘Industry Baby’, artist: ‘Lil Nas X’, reason: ‘Genre-blending hit with bold production’ }
]
}
// Add more decades as needed
};
}

function generateSongRecommendation(concept) {
const database = getSongDatabase();
const decade = concept.decade || ‘2020s’;
const genre = (concept.genre || ‘’).toLowerCase();

// Get songs for decade
const decadeSongs = database[decade] || database[‘2020s’];

// Determine genre category
let genreCategory = ‘default’;
if (genre.includes(‘horror’)) genreCategory = ‘horror’;
else if (genre.includes(‘sci-fi’)) genreCategory = ‘sci-fi’;

// Get genre songs with fallback
const genreSongs = decadeSongs[genreCategory] || decadeSongs[‘default’] || database[‘2020s’][‘default’];

// Select random song
const selectedSong = genreSongs[Math.floor(Math.random() * genreSongs.length)];

// Add context to reason
let contextReason = selectedSong.reason;
if (concept.title) {
contextReason += ’ - Perfect for “’ + concept.title + ‘”’;
}
if (concept.decade && concept.genre) {
contextReason += ‘, captures ’ + concept.decade + ’ ’ + concept.genre.toLowerCase() + ’ atmosphere’;
}

return {
title: selectedSong.title,
artist: selectedSong.artist,
reason: contextReason
};
}

// –––––––– Concept Generation (Claude) ––––––––
app.post(’/api/generate-concept’, async (req, res) => {
try {
console.log(‘🎬 Concept generation request:’, req.body);

```
const { genreFilter = 'any', eraFilter = 'any' } = req.body;

// Check cache first
const cacheKey = `concept-${genreFilter}-${eraFilter}`;
const cached = getCached(cacheKey);
if (cached) {
  console.log('📦 Returning cached concept');
  return res.json(cached);
}

const genreMap = {
  horror: '"Horror"',
  'sci-fi': '"Sci-Fi"',
  fusion: 'a creative fusion of Horror and Sci-Fi'
};

const decades = ['1950s','1960s','1970s','1980s','1990s','2000s','2010s','2020s'];
const randomDecade = decades[Math.floor(Math.random() * decades.length)];
const eraConstraint = eraFilter === 'any' ? `MUST be "${randomDecade}"` : `MUST be "${eraFilter}"`;
const genreConstraint = genreFilter === 'any'
  ? `The genre MUST be 'Horror', 'Sci-Fi', or a creative fusion of both`
  : `The genre MUST be ${genreMap[genreFilter]}`;

const prompt = `Return ONLY valid JSON with keys "decade","genre","title","tagline","synopsis","visual_elements","cast","director".
```

STRICT RULES:

- ${eraConstraint}
- ${genreConstraint}
- Title: short and striking (2-4 words max)
- “visual_elements”: 1 focal subject + 2–3 concise scene elements
- Cast: array of 3-4 fictional actor names
- Director: one fictional director name
- Synopsis: 1-2 sentences max

EXAMPLE FORMAT:
{
“decade”:“1980s”,
“genre”:“Sci-Fi Horror”,
“title”:“Neon Parallax”,
“tagline”:“The city blinked—and forgot you existed.”,
“synopsis”:“A detective discovers reality glitches in a neon-soaked city where digital surveillance has merged with human consciousness.”,
“visual_elements”:“lone detective silhouette; rain-slicked neon streets; towering digital billboards; distant city lights”,
“cast”:[“Mira Reeves”,“Dakota Chen”,“Alexander Thorne”],
“director”:“Cameron Reed Sullivan”
}

Return ONLY the JSON, no other text.`;

```
console.log('🤖 Calling Anthropic API...');

// Enhanced error handling for Vercel
const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'User-Agent': 'MoviePosterAI/1.0'
  },
  body: JSON.stringify({
    model: 'claude-3-5-sonnet-20241022', // Updated to latest model
    max_tokens: 1000,
    temperature: 0.8,
    messages: [
      {
        role: 'user',
        content: [{ type: 'text', text: prompt }]
      }
    ]
  }),
  timeout: 30000 // 30 second timeout
});

if (!anthropicResponse.ok) {
  const errorText = await anthropicResponse.text();
  console.error('❌ Anthropic API error:', anthropicResponse.status, errorText);
  
  // Provide detailed error for debugging on Vercel
  return res.status(anthropicResponse.status).json({
    success: false,
    error: `Anthropic API error ${anthropicResponse.status}`,
    details: errorText,
    hasApiKey: !!ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString()
  });
}

const anthropicData = await anthropicResponse.json();
console.log('✅ Anthropic response received');

const text = anthropicData?.content?.[0]?.text || '';
if (!text) {
  console.error('❌ No text in Anthropic response:', anthropicData);
  return res.status(502).json({
    success: false,
    error: 'No content returned from Anthropic',
    response: anthropicData
  });
}

// Extract JSON from response
const jsonMatch = text.match(/\{[\s\S]*\}/);
if (!jsonMatch) {
  console.error('❌ No JSON found in response:', text);
  return res.status(502).json({
    success: false,
    error: 'No parsable JSON in Anthropic response',
    responseText: text
  });
}

let concept;
try {
  concept = JSON.parse(jsonMatch[0]);
  console.log('✅ Concept parsed successfully:', concept.title);
} catch (parseError) {
  console.error('❌ JSON parse error:', parseError, jsonMatch[0]);
  return res.status(502).json({
    success: false,
    error: 'Failed to parse JSON from Anthropic',
    jsonString: jsonMatch[0],
    parseError: parseError.message
  });
}

// Validate required fields
const required = ['decade', 'genre', 'title', 'visual_elements'];
const missing = required.filter(field => !concept[field]);
if (missing.length > 0) {
  console.error('❌ Missing required fields:', missing);
  return res.status(502).json({
    success: false,
    error: `Missing required fields: ${missing.join(', ')}`,
    concept
  });
}

const result = { success: true, concept };
setCache(cacheKey, result);

console.log('🎉 Concept generation successful');
return res.json(result);
```

} catch (error) {
console.error(‘💥 Concept generation exception:’, error);
return res.status(500).json({
success: false,
error: error.message || ‘Failed to generate movie concept’,
stack: process.env.NODE_ENV === ‘development’ ? error.stack : undefined,
hasApiKey: !!ANTHROPIC_API_KEY
});
}
});

// –––––––– Image Generation (DALL-E) ––––––––
function createPosterPrompt(concept, visualElements) {
const genre = (concept.genre || ‘’).toLowerCase();
const decade = concept.decade || ‘1980s’;
const artStyle = concept.artStyle || ‘authentic’;

const medium =
artStyle === ‘painted’ ? ‘hand-painted movie poster, visible brushwork, artistic illustration’ :
artStyle === ‘b-movie’ ? ‘exaggerated B-movie poster art, pulp magazine style, over-the-top dramatic, sensationalized imagery’ :
artStyle === ‘photo’ ? ‘cinematic portrait photograph, professional movie lighting’ :
artStyle === ‘authentic’ ? getEraAuthenticMedium(decade) :
‘era-authentic movie poster art’;

const cinematicTerms = getCinematicTerms(genre);

const eraCue = {
‘1950s’: ‘vintage film grain, classic Hollywood glamour’,
‘1960s’: ‘retro palettes, psychedelic color schemes’,
‘1970s’: ‘earth tones, gritty realism’,
‘1980s’: ‘high contrast rim lighting, neon accents’,
‘1990s’: ‘MTV aesthetics, bold composition’,
‘2000s’: ‘digital clarity, modern color grading’,
‘2010s’: ‘IMAX quality, contemporary cinematography’,
‘2020s’: ‘ultra-high definition, premium production value’
}[decade] || ‘modern cinematic style’;

const beats = (visualElements || ‘’).replace(/\s+/g,’ ’).slice(0, 180);
const controls = ‘single cohesive scene, strong focal subject, negative space at top and bottom for title placement, no text, no letters, no watermarks, no logos, no borders’;

return `${medium}. ${cinematicTerms}. ${beats}. ${eraCue}. ${controls}.`.slice(0, 400);
}

app.post(’/api/generate-image’, async (req, res) => {
try {
console.log(‘🎨 Image generation request’);

```
const { visualElements = '', concept = {} } = req.body;

// Check cache
const cacheKey = `image-${JSON.stringify({concept, visualElements})}`;
const cached = getCached(cacheKey);
if (cached) {
  console.log('📦 Returning cached image');
  return res.json(cached);
}

const prompt = createPosterPrompt(concept, visualElements);
console.log('🎯 Generated prompt:', prompt);

const requestBody = {
  model: 'dall-e-3',
  prompt,
  size: '1024x1792',
  quality: 'hd',
  style: 'vivid',
  response_format: 'b64_json'
};

console.log('🤖 Calling OpenAI API...');

const response = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
    'User-Agent': 'MoviePosterAI/1.0'
  },
  body: JSON.stringify(requestBody),
  timeout: 60000 // 60 second timeout for image generation
});

if (!response.ok) {
  const errorText = await response.text();
  console.error('❌ OpenAI API error:', response.status, errorText);
  throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
}

const result = await response.json();
console.log('✅ Image generated successfully');

let b64 = result.data?.[0]?.b64_json;
const url = result.data?.[0]?.url;

if (!b64 && url) {
  console.log('📥 Fetching image from URL...');
  const imgResponse = await fetch(url);
  if (!imgResponse.ok) throw new Error(`Image fetch failed: ${imgResponse.status}`);
  const buffer = await imgResponse.buffer();
  b64 = buffer.toString('base64');
}

if (!b64) {
  throw new Error('No image data returned from OpenAI');
}

const responseData = {
  success: true,
  imageUrl: `data:image/png;base64,${b64}`,
  originalUrl: url,
  revisedPrompt: result.data?.[0]?.revised_prompt
};

setCache(cacheKey, responseData);
console.log('🎉 Image generation successful');

res.json(responseData);
```

} catch (error) {
console.error(‘💥 Image generation exception:’, error);
res.status(500).json({
success: false,
error: error.message || ‘Failed to generate image’,
hasApiKey: !!OPENAI_API_KEY
});
}
});

// –––––––– Song Recommendation ––––––––
app.post(’/api/get-song-recommendation’, async (req, res) => {
try {
const { concept } = req.body;

```
if (!concept) {
  return res.status(400).json({
    success: false,
    error: 'Concept is required'
  });
}

const song = generateSongRecommendation(concept);

res.json({
  success: true,
  song
});
```

} catch (error) {
console.error(‘Song recommendation error:’, error);
res.status(500).json({
success: false,
error: error.message || ‘Failed to get song recommendation’
});
}
});

// –––––––– Instagram Caption Generator ––––––––
app.post(’/api/generate-instagram-caption’, async (req, res) => {
try {
const { concept } = req.body;

```
if (!concept || !concept.title) {
  return res.status(400).json({
    success: false,
    error: 'Concept with title is required'
  });
}

// Generate hashtags
const hashtags = generateHashtags(concept);

// Create caption
let caption = '';
caption += '🎬 New AI-generated movie poster alert! ✨\n\n';
caption += `📽️ "${concept.title}" (${concept.decade || 'Unknown Era'})\n`;
caption += `🎭 ${concept.tagline || 'An unforgettable cinematic experience'}\n\n`;

// Shortened synopsis
const synopsis = concept.synopsis || 'A groundbreaking film that will leave you on the edge of your seat.';
const shortSynopsis = synopsis.length > 120 ? synopsis.substring(0, 120) + '...' : synopsis;
caption += shortSynopsis + '\n\n';

// Cast and crew
if (concept.cast && concept.cast.length > 0) {
  caption += `⭐ Starring: ${concept.cast.slice(0, 2).join(', ')}\n`;
}
if (concept.director) {
  caption += `🎥 Directed by: ${concept.director}\n`;
}

caption += '\n🤖 Created with AI • What movie should I generate next?\n\n';
caption += hashtags;

res.json({
  success: true,
  caption
});
```

} catch (error) {
console.error(‘Instagram caption error:’, error);
res.status(500).json({
success: false,
error: error.message || ‘Failed to generate Instagram caption’
});
}
});

function generateHashtags(concept) {
const tags = [
‘#AIart’, ‘#MoviePoster’, ‘#GenerativeAI’, ‘#FilmDesign’,
‘#CinematicArt’, ‘#ArtificialIntelligence’, ‘#DigitalArt’, ‘#MovieMagic’
];

// Add genre-specific tags
if (concept.genre) {
const genreLower = concept.genre.toLowerCase();
if (genreLower.includes(‘horror’)) {
tags.push(’#Horror’, ‘#ScaryMovies’, ‘#HorrorArt’);
}
if (genreLower.includes(‘sci-fi’) || genreLower.includes(‘science fiction’)) {
tags.push(’#SciFi’, ‘#ScienceFiction’, ‘#Futuristic’);
}
if (genreLower.includes(‘thriller’)) {
tags.push(’#Thriller’, ‘#Suspense’);
}
if (genreLower.includes(‘action’)) {
tags.push(’#Action’, ‘#ActionMovies’);
}
}

// Add decade-specific tags
if (concept.decade) {
tags.push(`#${concept.decade}`);
if (concept.decade === ‘1980s’) {
tags.push(’#Retro’, ‘#80sAesthetic’, ‘#Neon’);
}
if (concept.decade === ‘1950s’) {
tags.push(’#Vintage’, ‘#Classic’, ‘#FilmNoir’);
}
}

// Add creative tags
tags.push(’#PosterDesign’, ‘#ConceptArt’, ‘#VisualEffects’, ‘#CreativeAI’);
tags.push(’#Cinema’, ‘#Entertainment’, ‘#ArtLovers’, ‘#DesignInspiration’);

// Shuffle and limit to ~25 tags
const shuffled = tags.sort(() => 0.5 - Math.random()).slice(0, 25);

return shuffled.join(’ ’);
}

// –––––––– Health & Static Routes ––––––––
app.get(’/api/health’, (req, res) => {
res.json({
status: ‘OK’,
timestamp: new Date().toISOString(),
environment: process.env.NODE_ENV || ‘development’,
hasAnthropicKey: !!ANTHROPIC_API_KEY,
hasOpenAIKey: !!OPENAI_API_KEY,
version: ‘2.0.0’
});
});

app.get(’/’, (req, res) => {
res.sendFile(path.join(__dirname, ‘public’, ‘index.html’));
});

// Error handling middleware
app.use((error, req, res, next) => {
console.error(‘💥 Unhandled error:’, error);
res.status(500).json({
success: false,
error: ‘Internal server error’,
timestamp: new Date().toISOString()
});
});

// 404 handler
app.use((req, res) => {
res.status(404).json({
success: false,
error: ‘Endpoint not found’,
path: req.path
});
});

// Graceful shutdown
process.on(‘SIGTERM’, () => {
console.log(‘🛑 SIGTERM received, shutting down gracefully…’);
process.exit(0);
});

app.listen(PORT, () => {
console.log(`🎬 Movie Poster AI Backend v2.0 running on http://localhost:${PORT}`);
console.log(`📁 Serving static files from /public`);
console.log(`🔑 API Keys: Anthropic ${ANTHROPIC_API_KEY ? '✅' : '❌'}, OpenAI ${OPENAI_API_KEY ? '✅' : '❌'}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;