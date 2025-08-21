const express = require(‘express’);
const cors = require(‘cors’);

const app = express();

app.use(cors());
app.use(express.json());

app.get(’/api/health’, (req, res) => {
res.json({
status: ‘OK’,
timestamp: new Date().toISOString(),
nodeVersion: process.version,
hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
hasOpenAIKey: !!process.env.OPENAI_API_KEY
});
});

app.post(’/api/generate-concept’, (req, res) => {
const concept = {
decade: ‘1980s’,
genre: ‘Sci-Fi Horror’,
title: ‘Test Movie’,
tagline: ‘Testing the system’,
synopsis: ‘A test movie to verify the API works.’,
visual_elements: ‘dark corridors, neon lights, mysterious figure’,
cast: [‘Test Actor 1’, ‘Test Actor 2’, ‘Test Actor 3’],
director: ‘Test Director’
};

res.json({ success: true, concept });
});

app.post(’/api/generate-image’, (req, res) => {
res.json({
success: true,
imageUrl: ‘data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==’,
message: ‘Test image endpoint’
});
});

app.get(’/’, (req, res) => {
res.send(’<h1>Movie Poster AI Backend</h1><p><a href="/api/health">Health Check</a></p>’);
});

app.use((error, req, res, next) => {
console.error(‘Error:’, error);
res.status(500).json({
success: false,
error: error.message
});
});

module.exports = app;