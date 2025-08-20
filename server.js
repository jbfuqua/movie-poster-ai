// server.js - Movie Poster AI Backend
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// API Keys (in production, use environment variables)
// NEW (SECURE):
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Anthropic Claude API endpoint
app.post('/api/generate-concept', async (req, res) => {
    try {
        const { genreFilter, eraFilter } = req.body;
        
        // Build prompt based on filters
        let genreConstraint = "The genre must be 'Horror', 'Sci-Fi', or a creative fusion of both";
        if (genreFilter !== 'any') {
            const genreMap = {
                'horror': '"Horror"',
                'sci-fi': '"Sci-Fi"',
                'fusion': 'a creative fusion of Horror and Sci-Fi'
            };
            genreConstraint = `The genre must be ${genreMap[genreFilter]}`;
        }
        
        let eraConstraint = "Randomly select a decade for the movie's style, from the 1950s to the 2020s";
        if (eraFilter !== 'any') {
            eraConstraint = `The decade must be "${eraFilter}"`;
        }
        
        // Add randomization to ensure variety when no filter is specified
        const randomDecades = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
        const forceRandomDecade = eraFilter === 'any' ? randomDecades[Math.floor(Math.random() * randomDecades.length)] : null;
        
        const prompt = `You are a visionary movie concept creator tasked with generating the most INCREDIBLE, JAW-DROPPING movie concept that would make people stop scrolling and say "I NEED to see this movie!" This should be a concept so compelling it would break the internet.

1. **Decade**: ${forceRandomDecade ? `MUST be "${forceRandomDecade}"` : eraConstraint} (e.g., "1980s", "1950s", "2010s")
2. **Genre**: ${genreConstraint} (e.g., "Sci-Fi Horror", "Cosmic Horror")
3. **Title**: Create an absolutely ELECTRIFYING title that's completely original and makes people instantly curious. Think titles that would trend on social media. Avoid boring, generic names. Make it unforgettable and buzzworthy.
4. **Tagline**: A spine-tingling, goosebump-inducing tagline that gives people chills. Think of the most iconic movie taglines that stuck with audiences forever. Make it quotable and shareable.
5. **Synopsis**: A mind-blowing, "holy sh*t" concept that sounds like the most incredible movie never made. Think concepts that would make people say "Why hasn't someone made this already?!" Focus on high-concept, original ideas that blend familiar elements in shocking new ways.
6. **Visual Elements**: Describe the most STUNNING visual style for a movie poster that would make people screenshot and share it instantly. Be VERY specific about the era's unique characteristics:
   - 1950s: Hand-painted illustrations, atomic age motifs, bold primary colors, science fiction pulp art style that screams "retro-cool"
   - 1960s: Psychedelic mind-bending visuals, op-art patterns, mod explosion of colors, experimental photography that looks like a fever dream
   - 1970s: Gritty airbrushed photorealism, earth tones that feel dangerous, stark high-contrast lighting, documentary-style brutality
   - 1980s: Neon-soaked cyberpunk aesthetics, chrome that blinds, synthesizer wave visuals, VHS cover art that screams "totally radical"
   - 1990s: Grunge textures with attitude, alternative rock aesthetics, early digital effects that feel rebellious, dark and edgy vibes
   - 2000s: Y2K digital futurism, heavy Photoshop magic, metallic textures, matrix-style digital compositing
   - 2010s: Instagram-ready minimalism, floating heads composition, orange and blue color schemes that pop
   - 2020s: TikTok-viral aesthetics, diverse representation, streaming service poster perfection, contemporary digital art mastery
7. **Cast**: Generate 3-4 fictional actor names that sound like they could be the hottest stars of that era
8. **Director**: Generate a fictional director name that sounds like a visionary auteur from that time period

CREATIVITY REQUIREMENTS FOR VIRAL-WORTHY CONCEPTS:
- Think of the most mind-bending "what if" scenarios that would blow people's minds
- Combine familiar fears with unexpected twists that make people go "WHOA"
- Create concepts that sound like they could be real lost masterpieces
- Use contemporary anxieties and fears of each decade but amplify them to 11
- Think about what would make film buffs and casual viewers equally excited
- Generate ideas that sound like they belong in "greatest movies never made" lists
- Make concepts that would generate endless discussion and fan theories

DECADE-SPECIFIC CULTURAL FEARS TO AMPLIFY:
- 1950s: Nuclear paranoia, space invasion, atomic mutation, communist infiltration
- 1960s: Mind control, government conspiracy, social breakdown, reality questioning
- 1970s: Corporate evil, environmental disaster, serial killers, urban decay
- 1980s: Technology takeover, body horror, surveillance state, consumer culture gone wrong
- 1990s: Virtual reality nightmares, biotech horror, millennium anxiety, identity crisis
- 2000s: Digital surveillance, bioterrorism, social media manipulation, Y2K aftermath
- 2010s: Climate catastrophe, social media horror, AI uprising, pandemic fears
- 2020s: Reality breakdown, deep fakes, space colonization gone wrong, consciousness transfer

Please respond in valid JSON format with these exact keys: "decade", "genre", "title", "tagline", "synopsis", "visual_elements", "cast" (as an array), "director"

Make this concept so incredible that people would literally pay to see a poster of it, even if the movie doesn't exist. CREATE SOMETHING LEGENDARY.`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 1000,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Claude API request failed: ${response.status} - ${errorData}`);
        }

        const result = await response.json();
        
        if (result.content && result.content[0] && result.content[0].text) {
            // Extract JSON from Claude's response
            const responseText = result.content[0].text;
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            
            if (!jsonMatch) {
                throw new Error("No valid JSON found in Claude's response");
            }
            
            const concept = JSON.parse(jsonMatch[0]);
            res.json({ success: true, concept });
        } else {
            throw new Error("Invalid response structure from Claude API");
        }
        
    } catch (error) {
        console.error('Error generating concept:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to generate movie concept' 
        });
    }
});

// OpenAI DALL-E 3 API endpoint
app.post('/api/generate-image', async (req, res) => {
    try {
        const { visualElements, concept } = req.body;
        
        // Create decade-specific enhancement to the prompt
        const decadeStyles = {
            '1950s': 'Hand-painted illustration style, atomic age design, bold primary colors (red, blue, yellow), retro-futuristic elements, pulp science fiction art style, dramatic perspective, classic Hollywood glamour, painted texture, vintage advertising aesthetic',
            '1960s': 'Psychedelic color palette, op-art patterns, mod design influences, experimental photography, bright saturated colors, geometric shapes, space age design, pop art influences, high contrast black and white with color accents',
            '1970s': 'Airbrushed photorealistic style, earth tone color palette (browns, oranges, burnt sienna), gritty urban photography, stark high-contrast lighting, practical effects look, documentary-style realism, grainy film texture, authentic 70s cinematography',
            '1980s': 'Neon color palette (hot pink, electric blue, bright purple), chrome and metallic effects, synthesizer wave aesthetics, VHS cover art style, bold geometric shapes, laser effects, digital grid patterns, retro-futuristic design, Miami Vice color scheme',
            '1990s': 'Early digital effects, grunge textures, alternative aesthetic, computer-generated imagery style, darker color palette, industrial design influences, CD-ROM game art style, early Photoshop effects, textured backgrounds',
            '2000s': 'Heavy digital compositing, metallic chrome textures, Y2K futurism design, blue and orange color grading, digital lens flares, matrix-style effects, glossy plastic textures, early 2000s digital art style',
            '2010s': 'Minimalist poster design, floating heads composition, orange and blue color scheme dominance, digital painting style, clean typography space, Instagram-ready composition, HDR photography style',
            '2020s': 'Modern digital art with retro revival elements, diverse representation, social media optimized design, mixed media approach, contemporary color palettes, streaming service poster style, authentic photography with digital enhancement'
        };

        const decadeStyle = decadeStyles[concept.decade] || decadeStyles['2020s'];

        const prompt = `Create an absolutely stunning, museum-quality movie poster artwork that perfectly captures the authentic ${concept.decade} aesthetic. This should look exactly like the VISUAL ARTWORK ONLY from a poster that would have been created by professional movie studios in ${concept.decade}.

AUTHENTIC ${concept.decade.toUpperCase()} STYLE REQUIREMENTS:
${decadeStyle}

ORIGINAL VISUAL CONCEPT:
${visualElements}

CRITICAL TEXT EXCLUSION REQUIREMENTS:
- DO NOT include any text, words, letters, titles, names, or typography whatsoever
- DO NOT include movie titles, actor names, studio logos, or credits
- DO NOT include taglines, slogans, or any written language
- DO NOT include numbers, dates, or any alphanumeric characters
- This must be PURE VISUAL ARTWORK with absolutely zero text elements
- Focus entirely on compelling visual storytelling through imagery alone
- Leave natural space where text would typically be placed on a movie poster

TECHNICAL MASTERY:
- Aspect ratio: 2:3 (portrait orientation, standard movie poster format)
- Ultra-high resolution, professional movie poster production quality
- Perfect recreation of ${concept.decade} design techniques and materials
- Authentic color reproduction using ${concept.decade} printing/design methods
- Professional studio-quality artwork that would be indistinguishable from genuine ${concept.decade} poster artwork

GENRE ATMOSPHERE FOR ${concept.genre.toUpperCase()}:
- Masterfully convey genuine ${concept.genre} atmosphere and tension
- Use visual metaphors and symbolism authentic to ${concept.decade} ${concept.genre} films
- Create the exact mood that ${concept.decade} audiences would expect from this genre
- Reference visual language of classic ${concept.decade} ${concept.genre} movies without copying

COMPOSITION EXCELLENCE:
- Use ${concept.decade}-appropriate composition techniques and visual hierarchy
- Strategic use of space and balance typical of that era's design sensibilities
- Authentic lighting and photography/illustration techniques from ${concept.decade}
- Period-correct artistic execution methods
- Natural composition that accommodates text placement without including any text

HISTORICAL ACCURACY:
- Must look like it was actually created in ${concept.decade} using available technology and techniques
- Use only colors, effects, and artistic methods that existed in ${concept.decade}
- Authentic visual design matching actual ${concept.decade} movie poster aesthetics
- Reference genuine ${concept.decade} poster layouts and compositions

EMOTIONAL IMPACT:
- Should evoke the exact emotional response ${concept.decade} moviegoers would have had
- Capture authentic ${concept.decade} cultural fears, hopes, and aesthetics
- Create genuine period nostalgia and authenticity

FINAL EMPHASIS: This poster should be so authentic to ${concept.decade} that movie poster collectors would believe it's a genuine vintage piece from that era. ABSOLUTELY NO TEXT OR LETTERS OF ANY KIND.`;

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
        
        if (result.data && result.data[0] && result.data[0].url) {
            // Convert the image URL to base64 on the backend to avoid CORS issues
            try {
                console.log('Converting DALL-E image to base64...');
                const imageResponse = await fetch(result.data[0].url);
                
                if (!imageResponse.ok) {
                    throw new Error(`Failed to fetch image: ${imageResponse.status}`);
                }
                
                const imageBuffer = await imageResponse.buffer();
                const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
                
                res.json({ 
                    success: true, 
                    imageUrl: base64Image, // Return base64 instead of URL
                    originalUrl: result.data[0].url,
                    revisedPrompt: result.data[0].revised_prompt 
                });
            } catch (conversionError) {
                console.error('Error converting image to base64:', conversionError);
                // Fallback: return the original URL and let frontend handle it
                res.json({ 
                    success: true, 
                    imageUrl: result.data[0].url,
                    revisedPrompt: result.data[0].revised_prompt,
                    note: 'Image conversion failed, returning original URL'
                });
            }
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

module.exports = app;