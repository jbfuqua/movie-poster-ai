// server.js - Movie Poster AI Backend (Express)
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const { Readable } = require('stream');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3000;

// Set your keys via environment variables in production
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// ---------------- Concept (Claude) ----------------
app.post('/api/generate-concept', async (req, res) => {
  try {
    const { genreFilter = 'any', eraFilter = 'any' } = req.body;

    const genreMap = {
      horror: '"Horror"',
      'sci-fi': '"Sci-Fi"',
      fusion: 'a creative fusion of Horror and Sci-Fi'
    };

    const decades = ['1950s','1960s','1970s','1980s','1990s','2000s','2010s','2020s'];
    const randomDecade = decades[Math.floor(Math.random()*decades.length)];
    const eraConstraint = eraFilter === 'any' ? `MUST be "${randomDecade}"` : `MUST be "${eraFilter}"`;
    const genreConstraint = genreFilter === 'any'
      ? `The genre MUST be 'Horror', 'Sci-Fi', or a creative fusion of both`
      : `The genre MUST be ${genreMap[genreFilter]}`;

    const prompt = `Return ONLY valid JSON with keys "decade","genre","title","tagline","synopsis","visual_elements","cast","director".
Rules:
- ${eraConstraint}
- ${genreConstraint}
- Title short and striking.
- "visual_elements" should be: 1 focal subject + 2–3 concise scene beats.

Example:
{
  "decade":"1980s",
  "genre":"Sci-Fi Horror",
  "title":"Neon Parallax",
  "tagline":"The city blinked—and forgot you existed.",
  "synopsis":"One paragraph, high-concept, original.",
  "visual_elements":"single subject; low-angle; neon rain; reflective pavement; distant drones",
  "cast":["Mira Reeves","Dakota Chen","Alexander Thorne"],
  "director":"Cameron Reed Sullivan"
}`;

    // IMPORTANT: use a stable, known-good model + content block array
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 800,
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: prompt }]
          }
        ]
      })
    });

    // If Anthropic errors, forward full detail so the client can show it
    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Claude error:', resp.status, errText);
      return res.status(resp.status).json({
        success: false,
        error: `Claude API error ${resp.status}: ${errText}`
      });
    }

    const data = await resp.json();

    const text = data?.content?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Claude returned no JSON:', text);
      return res.status(502).json({
        success: false,
        error: 'Claude returned no parsable JSON'
      });
    }

    let concept;
    try {
      concept = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('JSON parse fail:', e, jsonMatch[0]);
      return res.status(502).json({
        success: false,
        error: 'Failed to parse JSON from Claude'
      });
    }

    return res.json({ success: true, concept });
  } catch (e) {
    console.error('Concept route exception:', e);
    return res.status(500).json({
      success: false,
      error: e.message || 'Failed to generate movie concept'
    });
  }
});

// ---------------- Image (gpt-image-1) ----------------
app.post('/api/generate-image', async (req, res) => {
  try {
    const { visualElements = '', concept = {}, styleRefs = null, editMode = 'generate', baseImageBase64 = null, maskBase64 = null } = req.body;

    // compact, poster-aware prompt
    function createPosterPrompt(c, visual) {
      const g = (c.genre || '').toLowerCase();
      const decade = c.decade || '1980s';

      const eraCue =
        decade === '1950s' ? 'vintage film grain, hand-painted poster art' :
        decade === '1960s' ? 'retro palettes, subtle halftone poster texture' :
        decade === '1970s' ? 'airbrush realism, muted film stock' :
        decade === '1980s' ? 'high contrast rim light, neon accents' :
        decade === '1990s' ? 'photographic one-sheet look' :
        'modern premium cinematography';

      const medium =
        c.artStyle === 'painted' ? 'hand-painted movie poster, visible brushwork' :
        c.artStyle === 'b-movie' ? 'sensational pulp B-movie poster art' :
        c.artStyle === 'photo' ? 'cinematic portrait photograph, professional movie lighting' :
        'era-authentic movie poster art';

      const mood =
        g.includes('horror') ? 'ominous atmosphere, suspense, tension' :
        g.includes('sci-fi') ? 'uncanny futuristic mood, clean tech details' :
        'dramatic, cinematic tone';

      const beats = (visual || '').replace(/\s+/g,' ').slice(0,220);
      const controls = 'single cohesive scene, strong focal subject, negative space at top and bottom for title/credits, no text, no letters, no watermark, no logos, no border';

      return `${medium}. ${mood}. ${beats}. ${eraCue}. ${controls}.`;
    }

    const prompt = createPosterPrompt(concept, visualElements);

    const baseBody = {
      model: 'gpt-image-1',
      prompt,
      size: '1024x1792', // tall: better fidelity; client smart-crops to 2:3
      quality: 'hd',
      style: 'vivid'
    };

    // Normal generation (JSON API). If you later want edit+mask, see buildEditFormData below.
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(baseBody)
    });

    if (!response.ok) throw new Error(`gpt-image-1 error ${response.status}: ${await response.text()}`);

    const result = await response.json();
    let b64 = result.data?.[0]?.b64_json;
    let url = result.data?.[0]?.url;
    if (!b64 && url) {
      const imgResp = await fetch(url);
      if (!imgResp.ok) throw new Error(`Image fetch ${imgResp.status}`);
      const buf = await imgResp.buffer();
      b64 = buf.toString('base64');
    }
    if (!b64) throw new Error('No image returned');

    res.json({ success:true, imageUrl:`data:image/png;base64,${b64}`, originalUrl:url, revisedPrompt: result.data?.[0]?.revised_prompt });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, error: e.message || 'Failed to generate image' });
  }
});

// (Optional) multipart builder for future edit+mask pass
async function buildEditFormData(baseBody, baseImageBase64, maskBase64, styleRefs) {
  const form = new FormData();
  form.append('model', baseBody.model);
  form.append('prompt', baseBody.prompt);
  form.append('size', baseBody.size);
  form.append('quality', baseBody.quality);
  form.append('style', baseBody.style);

  const base = baseImageBase64.split(',')[1];
  form.append('image', Readable.from(Buffer.from(base,'base64')), { filename:'base.png', contentType:'image/png' });

  const mask = maskBase64.split(',')[1];
  form.append('mask', Readable.from(Buffer.from(mask,'base64')), { filename:'mask.png', contentType:'image/png' });

  if (Array.isArray(styleRefs)) {
    styleRefs.forEach((dataUrl,i)=>{
      const b = dataUrl.split(',')[1];
      form.append('image[]', Readable.from(Buffer.from(b,'base64')), { filename:`style_${i}.png`, contentType:'image/png' });
    });
  }
  return form;
}

// Health + static
app.get('/api/health', (_req,res)=> res.json({ status:'OK', timestamp:new Date().toISOString() }));
app.get('/', (_req,res)=> res.sendFile(path.join(__dirname,'public','index.html')));

app.listen(PORT, ()=> {
  console.log(`🎬 Movie Poster AI Backend on http://localhost:${PORT}`);
  console.log('➡️  Put index.html in /public');
});

module.exports = app;