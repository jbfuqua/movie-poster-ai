// server.js - Movie Poster AI Backend (Enhanced)
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// API Keys (use environment variables in production)
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Enhanced Anthropic Claude API endpoint
app.post('/api/generate-concept', async (req, res) => {
    try {
        const { genreFilter = 'any', eraFilter = 'any' } = req.body;
        
        // Enhanced genre mapping
        const genreMap = {
            'horror': '"Horror"',
            'sci-fi': '"Sci-Fi"',
            'fusion': 'a creative fusion of Horror and Sci-Fi'
        };
        
        // Ensure randomness when no filter is specified
        const randomDecades = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
        const forceRandomDecade = eraFilter === 'any' ? randomDecades[Math.floor(Math.random() * randomDecades.length)] : null;
        
        const eraConstraint = eraFilter === 'any' ? `MUST be "${forceRandomDecade}"` : `MUST be "${eraFilter}"`;
        const genreConstraint = genreFilter === 'any' ? 
            `The genre MUST be 'Horror', 'Sci-Fi', or a creative fusion of both` : 
            `The genre MUST be ${genreMap[genreFilter]}`;
        
        // Optimized prompt for better results
        const prompt = `Return ONLY valid JSON with these exact keys: "decade","genre","title","tagline","synopsis","visual_elements","cast","director".

Rules:
- ${eraConstraint}
- ${genreConstraint}
- Title should be short, striking, and original
- Visual_elements should describe 1 focal subject and 2-3 scene elements, be concise
- Synopsis should be 1-2 sentences, high-concept

Example format:
{
  "decade":"1980s",
  "genre":"Sci-Fi Horror",
  "title":"Neon Parallax",
  "tagline":"The city blinked—and forgot you existed.",
  "synopsis":"A tech worker discovers their entire reality is a glitching simulation when neon signs start displaying their deepest fears.",
  "visual_elements":"lone figure silhouetted against massive neon cityscape; rain-slicked streets; distant mechanical drones hovering",
  "cast":["Alex Stone","Morgan Cross","Casey Steel"],
  "director":"Jordan Cipher"
}

Create something completely original and compelling.`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 800,
                messages: [{ role: "user", content: prompt }]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Claude API request failed: ${response.status} - ${errorData}`);
        }

        const result = await response.json();
        const responseText = result?.content?.[0]?.text || '';
        
        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in Claude's response");
        }
        
        const concept = JSON.parse(jsonMatch[0]);
        res.json({ success: true, concept });
        
    } catch (error) {
        console.error('Error generating concept:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to generate movie concept' 
        });
    }
});

// Enhanced OpenAI gpt-image-1 API endpoint
app.post('/api/generate-image', async (req, res) => {
    try {
        const { visualElements = '', concept = {} } = req.body;
        
        // Enhanced prompt construction for gpt-image-1
        function createOptimizedPrompt(concept, visualElements) {
            const genre = (concept.genre || '').toLowerCase();
            const decade = concept.decade || '1980s';
            const artStyle = concept.artStyle || 'authentic';
            
            // Era-specific visual cues (concise but effective)
            const eraCues = {
                '1950s': 'vintage film grain, hand-painted poster art, atomic age design',
                '1960s': 'retro color palettes, subtle halftone poster texture, mod influences',
                '1970s': 'airbrushed realism, muted earth tones, gritty film stock',
                '1980s': 'high contrast rim lighting, neon accents, chrome effects',
                '1990s': 'photographic one-sheet style, early digital effects',
                '2000s': 'digital compositing, metallic textures, Y2K aesthetics',
                '2010s': 'minimalist design, floating heads composition, orange-blue grading',
                '2020s': 'modern premium cinematography, diverse representation'
            };

            // Art style approach
            const styleApproach = {
                'painted': 'hand-painted movie poster art, visible brushwork, artistic illustration',
                'b-movie': 'sensational pulp B-movie poster art, exaggerated melodrama',
                'photo': 'cinematic portrait photography, professional movie lighting',
                'authentic': 'era-authentic movie poster style'
            };

            // Genre mood
            const genreMood = genre.includes('horror') ? 'ominous atmosphere, suspense, tension' :
                             genre.includes('sci-fi') ? 'futuristic mood, clean tech details' :
                             'dramatic cinematic tone';

            // Construct optimized prompt
            const medium = styleApproach[artStyle] || styleApproach['authentic'];
            const eraCue = eraCues[decade] || eraCues['2020s'];
            const visualBeats = (visualElements || '').replace(/\s+/g, ' ').slice(0, 200);
            
            return `${medium}. ${genreMood}. ${visualBeats}. ${eraCue}. Single cohesive scene, strong focal subject, negative space at top and bottom for title placement, no text, no letters, no watermarks, no logos, professional movie poster composition.`;
        }

        const prompt = createOptimizedPrompt(concept, visualElements);
        
        console.log('Optimized prompt length:', prompt.length);

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1792",
                quality: "hd",
                style: "vivid"
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`DALL-E 3 API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const result = await response.json();
        
        if (result.data && result.data[0]) {
            let base64Image = result.data[0].b64_json;
            let originalUrl = result.data[0].url;
            
            // If we got URL instead of base64, fetch and convert
            if (!base64Image && originalUrl) {
                try {
                    console.log('Converting image URL to base64...');
                    const imageResponse = await fetch(originalUrl);
                    if (!imageResponse.ok) {
                        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
                    }
                    const imageBuffer = await imageResponse.buffer();
                    base64Image = imageBuffer.toString('base64');
                } catch (conversionError) {
                    console.error('Error converting image to base64:', conversionError);
                    // Fallback to URL
                    res.json({ 
                        success: true, 
                        imageUrl: originalUrl,
                        revisedPrompt: result.data[0].revised_prompt,
                        note: 'Image conversion failed, returning original URL'
                    });
                    return;
                }
            }
            
            if (!base64Image) {
                throw new Error("No image data returned from API");
            }
            
            res.json({ 
                success: true, 
                imageUrl: `data:image/png;base64,${base64Image}`,
                originalUrl: originalUrl,
                revisedPrompt: result.data[0].revised_prompt 
            });
        } else {
            throw new Error("Invalid image response from DALL-E 3 API");
        }
        
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to generate image' 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🎬 Movie Poster AI Backend running on http://localhost:${PORT}`);
    console.log(`📁 Make sure to put your HTML file in the 'public' folder as 'index.html'`);
});

module.exports = app;// server.js - Movie Poster AI Backend (Enhanced)
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// API Keys (use environment variables in production)
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Enhanced Anthropic Claude API endpoint
app.post('/api/generate-concept', async (req, res) => {
    try {
        const { genreFilter = 'any', eraFilter = 'any' } = req.body;
        
        // Enhanced genre mapping
        const genreMap = {
            'horror': '"Horror"',
            'sci-fi': '"Sci-Fi"',
            'fusion': 'a creative fusion of Horror and Sci-Fi'
        };
        
        // Ensure randomness when no filter is specified
        const randomDecades = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
        const forceRandomDecade = eraFilter === 'any' ? randomDecades[Math.floor(Math.random() * randomDecades.length)] : null;
        
        const eraConstraint = eraFilter === 'any' ? `MUST be "${forceRandomDecade}"` : `MUST be "${eraFilter}"`;
        const genreConstraint = genreFilter === 'any' ? 
            `The genre MUST be 'Horror', 'Sci-Fi', or a creative fusion of both` : 
            `The genre MUST be ${genreMap[genreFilter]}`;
        
        // Optimized prompt for better results
        const prompt = `Return ONLY valid JSON with these exact keys: "decade","genre","title","tagline","synopsis","visual_elements","cast","director".

Rules:
- ${eraConstraint}
- ${genreConstraint}
- Title should be short, striking, and original
- Visual_elements should describe 1 focal subject and 2-3 scene elements, be concise
- Synopsis should be 1-2 sentences, high-concept

Example format:
{
  "decade":"1980s",
  "genre":"Sci-Fi Horror",
  "title":"Neon Parallax",
  "tagline":"The city blinked—and forgot you existed.",
  "synopsis":"A tech worker discovers their entire reality is a glitching simulation when neon signs start displaying their deepest fears.",
  "visual_elements":"lone figure silhouetted against massive neon cityscape; rain-slicked streets; distant mechanical drones hovering",
  "cast":["Alex Stone","Morgan Cross","Casey Steel"],
  "director":"Jordan Cipher"
}

Create something completely original and compelling.`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 800,
                messages: [{ role: "user", content: prompt }]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Claude API request failed: ${response.status} - ${errorData}`);
        }

        const result = await response.json();
        const responseText = result?.content?.[0]?.text || '';
        
        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in Claude's response");
        }
        
        const concept = JSON.parse(jsonMatch[0]);
        res.json({ success: true, concept });
        
    } catch (error) {
        console.error('Error generating concept:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to generate movie concept' 
        });
    }
});

// Enhanced OpenAI gpt-image-1 API endpoint
app.post('/api/generate-image', async (req, res) => {
    try {
        const { visualElements = '', concept = {} } = req.body;
        
        // Enhanced prompt construction for gpt-image-1
        function createOptimizedPrompt(concept, visualElements) {
            const genre = (concept.genre || '').toLowerCase();
            const decade = concept.decade || '1980s';
            const artStyle = concept.artStyle || 'authentic';
            
            // Era-specific visual cues (concise but effective)
            const eraCues = {
                '1950s': 'vintage film grain, hand-painted poster art, atomic age design',
                '1960s': 'retro color palettes, subtle halftone poster texture, mod influences',
                '1970s': 'airbrushed realism, muted earth tones, gritty film stock',
                '1980s': 'high contrast rim lighting, neon accents, chrome effects',
                '1990s': 'photographic one-sheet style, early digital effects',
                '2000s': 'digital compositing, metallic textures, Y2K aesthetics',
                '2010s': 'minimalist design, floating heads composition, orange-blue grading',
                '2020s': 'modern premium cinematography, diverse representation'
            };

            // Art style approach
            const styleApproach = {
                'painted': 'hand-painted movie poster art, visible brushwork, artistic illustration',
                'b-movie': 'sensational pulp B-movie poster art, exaggerated melodrama',
                'photo': 'cinematic portrait photography, professional movie lighting',
                'authentic': 'era-authentic movie poster style'
            };

            // Genre mood
            const genreMood = genre.includes('horror') ? 'ominous atmosphere, suspense, tension' :
                             genre.includes('sci-fi') ? 'futuristic mood, clean tech details' :
                             'dramatic cinematic tone';

            // Construct optimized prompt
            const medium = styleApproach[artStyle] || styleApproach['authentic'];
            const eraCue = eraCues[decade] || eraCues['2020s'];
            const visualBeats = (visualElements || '').replace(/\s+/g, ' ').slice(0, 200);
            
            return `${medium}. ${genreMood}. ${visualBeats}. ${eraCue}. Single cohesive scene, strong focal subject, negative space at top and bottom for title placement, no text, no letters, no watermarks, no logos, professional movie poster composition.`;
        }

        const prompt = createOptimizedPrompt(concept, visualElements);
        
        console.log('Optimized prompt length:', prompt.length);

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-image-1",
                prompt: prompt,
                n: 1,
                size: "1024x1792",
                quality: "hd",
                style: "vivid"
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`gpt-image-1 API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const result = await response.json();
        
        if (result.data && result.data[0]) {
            let base64Image = result.data[0].b64_json;
            let originalUrl = result.data[0].url;
            
            // If we got URL instead of base64, fetch and convert
            if (!base64Image && originalUrl) {
                try {
                    console.log('Converting image URL to base64...');
                    const imageResponse = await fetch(originalUrl);
                    if (!imageResponse.ok) {
                        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
                    }
                    const imageBuffer = await imageResponse.buffer();
                    base64Image = imageBuffer.toString('base64');
                } catch (conversionError) {
                    console.error('Error converting image to base64:', conversionError);
                    // Fallback to URL
                    res.json({ 
                        success: true, 
                        imageUrl: originalUrl,
                        revisedPrompt: result.data[0].revised_prompt,
                        note: 'Image conversion failed, returning original URL'
                    });
                    return;
                }
            }
            
            if (!base64Image) {
                throw new Error("No image data returned from API");
            }
            
            res.json({ 
                success: true, 
                imageUrl: `data:image/png;base64,${base64Image}`,
                originalUrl: originalUrl,
                revisedPrompt: result.data[0].revised_prompt 
            });
        } else {
            throw new Error("Invalid image response from gpt-image-1 API");
        }
        
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to generate image' 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🎬 Movie Poster AI Backend running on http://localhost:${PORT}`);
    console.log(`📁 Make sure to put your HTML file in the 'public' folder as 'index.html'`);
});

module.exports = app;
