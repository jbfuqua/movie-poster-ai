<!DOCTYPE html>

<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Generative Movie Poster AI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Lato:wght@300;400;700&family=Montserrat:wght@400;700;900&family=Oswald:wght@400;700&family=Poppins:wght@400;600;700&family=Orbitron:wght@700;900&family=Cinzel:wght@600&display=swap" rel="stylesheet" />
  <style>
    body { font-family: 'Lato', sans-serif; background: linear-gradient(135deg,#0c0c0c 0%,#1a1a2e 50%,#16213e 100%); }
    .font-oswald{font-family:'Oswald',sans-serif}.font-bebas{font-family:'Bebas Neue',sans-serif}
    .font-montserrat{font-family:'Montserrat',sans-serif}.font-poppins{font-family:'Poppins',sans-serif}
    .glass{background:rgba(255,255,255,.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.1)}
    .poster-shadow{box-shadow:0 10px 40px rgba(0,0,0,.8)}
    .gradient-text{background:linear-gradient(45deg,#3b82f6,#8b5cf6,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,.6);border-radius:3px}
  </style>
</head>
<body class="text-gray-200 min-h-screen p-4 sm:p-6 lg:p-8">
  <div class="w-full max-w-7xl mx-auto">
    <header class="text-center mb-8">
      <h1 class="text-5xl sm:text-7xl font-bebas tracking-wider gradient-text mb-2">Generative Movie Poster AI</h1>
      <p class="text-gray-400">Cinematic one-sheets, generated with AI</p>
      <div class="flex justify-center gap-4 text-sm text-gray-500 mt-2">
        <span id="status">Ready</span>
        <span>•</span>
        <span id="count">0 posters created</span>
      </div>
    </header>

```
<main class="grid grid-cols-1 xl:grid-cols-4 gap-8">
  <!-- Poster -->
  <section class="xl:col-span-3 glass p-6 rounded-2xl">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-montserrat font-bold">Current Generation</h2>
      <div class="flex gap-2">
        <button id="save-btn" class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50" disabled>Save</button>
        <button id="share-btn" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50" disabled>Share</button>
      </div>
    </div>

    <div id="poster-wrap" class="w-full max-w-lg mx-auto aspect-[2/3] rounded-xl overflow-hidden poster-shadow relative">
      <div id="loader" class="absolute inset-0 bg-gray-900/80 flex items-center justify-center z-10 hidden">
        <div class="text-center">
          <svg class="w-14 h-14 mx-auto mb-3 animate-spin text-gray-600" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          <p id="phase" class="text-blue-400">Generating…</p>
        </div>
      </div>
      <img id="poster-img" alt="Generated poster" class="w-full h-full object-cover hidden" />
    </div>
  </section>

  <!-- Controls + Details -->
  <aside class="xl:col-span-1 space-y-6">
    <div class="glass p-6 rounded-2xl">
      <h3 class="text-xl font-montserrat font-bold mb-4">Controls</h3>
      <button id="gen-btn" class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl">Generate Poster</button>

      <div class="mt-4">
        <label class="text-sm text-gray-300">Genre</label>
        <select id="genre" class="w-full mt-1 bg-gray-700 border border-gray-600 rounded px-3 py-2">
          <option value="any">Any</option>
          <option value="horror">Horror</option>
          <option value="sci-fi">Sci-Fi</option>
          <option value="fusion">Sci-Fi Horror</option>
        </select>
      </div>

      <div class="mt-3">
        <label class="text-sm text-gray-300">Era</label>
        <select id="era" class="w-full mt-1 bg-gray-700 border border-gray-600 rounded px-3 py-2">
          <option value="any">Any</option>
          <option>1950s</option><option>1960s</option><option>1970s</option><option>1980s</option>
          <option>1990s</option><option>2000s</option><option>2010s</option><option>2020s</option>
        </select>
      </div>

      <div class="mt-3">
        <label class="text-sm text-gray-300">Art Style</label>
        <select id="style" class="w-full mt-1 bg-gray-700 border border-gray-600 rounded px-3 py-2">
          <option value="authentic">Era Authentic</option>
          <option value="b-movie">B-Movie Exaggerated</option>
          <option value="photo">Modern Photography</option>
          <option value="painted">Classic Painted</option>
        </select>
      </div>
    </div>

    <div class="glass p-6 rounded-2xl custom-scrollbar max-h-96 overflow-y-auto">
      <h3 class="text-xl font-montserrat font-bold mb-4">Movie Details</h3>
      <div class="space-y-3 text-sm">
        <p><span class="text-gray-400">Era:</span> <span id="d-decade">—</span></p>
        <p><span class="text-gray-400">Genre:</span> <span id="d-genre">—</span></p>
        <p class="text-yellow-400 font-bebas text-2xl leading-tight" id="d-title">—</p>
        <p class="italic text-gray-300" id="d-tagline">—</p>
        <p class="text-gray-200" id="d-synopsis">—</p>
      </div>
    </div>

    <!-- Song Recommendation -->
    <div class="glass p-6 rounded-2xl">
      <h3 class="text-xl font-montserrat font-bold mb-4">🎵 Soundtrack Rec</h3>
      <div id="song-container" class="space-y-2">
        <div class="flex items-center space-x-2">
          <span class="text-lg">🎵</span>
          <div class="flex-1">
            <p id="song-title" class="text-sm font-medium text-white">—</p>
            <p id="song-artist" class="text-xs text-gray-400">—</p>
          </div>
        </div>
        <p id="song-reason" class="text-xs text-gray-300 italic">—</p>
        <button id="copy-song-btn" class="w-full mt-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs transition-all disabled:opacity-50" disabled>
          Copy Song Info
        </button>
      </div>
    </div>

    <!-- Instagram Caption -->
    <div class="glass p-6 rounded-2xl">
      <h3 class="text-xl font-montserrat font-bold mb-4">📱 Instagram Caption</h3>
      <div class="bg-gray-800 p-3 rounded-lg">
        <textarea id="instagram-caption" class="w-full bg-transparent text-xs text-gray-300 resize-none border-none outline-none" rows="6" readonly placeholder="Generate a poster to see Instagram caption..."></textarea>
        <button id="copy-caption-btn" class="w-full mt-2 px-3 py-1 bg-pink-600 hover:bg-pink-700 rounded text-xs transition-all disabled:opacity-50" disabled>
          Copy Caption
        </button>
      </div>
    </div>

    <div class="glass p-6 rounded-2xl">
      <h3 class="text-xl font-montserrat font-bold mb-4">Recent</h3>
      <div id="recent" class="grid grid-cols-2 gap-2"></div>
    </div>
  </aside>
</main>
```

  </div>

<canvas id="canvas" class="hidden"></canvas>

  <script>
    // ---------- Simple state ----------
    const els = {
      genBtn: document.getElementById('gen-btn'),
      saveBtn: document.getElementById('save-btn'),
      shareBtn: document.getElementById('share-btn'),
      posterImg: document.getElementById('poster-img'),
      loader: document.getElementById('loader'),
      phase: document.getElementById('phase'),
      status: document.getElementById('status'),
      count: document.getElementById('count'),
      genre: document.getElementById('genre'),
      era: document.getElementById('era'),
      style: document.getElementById('style'),
      dDecade: document.getElementById('d-decade'),
      dGenre: document.getElementById('d-genre'),
      dTitle: document.getElementById('d-title'),
      dTagline: document.getElementById('d-tagline'),
      dSynopsis: document.getElementById('d-synopsis'),
      songTitle: document.getElementById('song-title'),
      songArtist: document.getElementById('song-artist'),
      songReason: document.getElementById('song-reason'),
      copySongBtn: document.getElementById('copy-song-btn'),
      instagramCaption: document.getElementById('instagram-caption'),
      copyCaptionBtn: document.getElementById('copy-caption-btn'),
      recent: document.getElementById('recent'),
      canvas: document.getElementById('canvas'),
    };
    const ctx = els.canvas.getContext('2d');
    let currentConcept = null;
    let generationCount = 0;

    // ---------- UI helpers ----------
    function setLoading(on, phaseText = 'Generating…') {
      els.loader.classList.toggle('hidden', !on);
      els.phase.textContent = phaseText;
      els.status.textContent = on ? 'Generating' : 'Ready';
      els.genBtn.disabled = on;
      els.saveBtn.disabled = on;
      els.shareBtn.disabled = on;
      if (!on) { els.saveBtn.disabled = !els.posterImg.src; els.shareBtn.disabled = !els.posterImg.src; }
    }

    function updateDetails(c) {
      els.dDecade.textContent = c.decade || '—';
      els.dGenre.textContent = c.genre || '—';
      els.dTitle.textContent = c.title || '—';
      els.dTagline.textContent = c.tagline || '—';
      els.dSynopsis.textContent = c.synopsis || '—';
    }

    function addGradientPlates() {
      const w = els.canvas.width, h = els.canvas.height;
      // top
      let gTop = ctx.createLinearGradient(0,0,0,h*0.18);
      gTop.addColorStop(0,'rgba(0,0,0,0.45)'); gTop.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = gTop; ctx.fillRect(0,0,w,h*0.18);
      // bottom
      let gBot = ctx.createLinearGradient(0,h,0,h*0.82);
      gBot.addColorStop(0,'rgba(0,0,0,0.60)'); gBot.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = gBot; ctx.fillRect(0,h*0.82,w,h*0.18);
    }

    // Smart crop tall (1024x1792) → 2:3 window focusing on subject density
    function smartCropToTwoThirds(img) {
      const targetW = 1024, targetH = Math.floor(targetW * 1.5); // 2:3
      const step = 32;
      let best = { y: 0, score: -Infinity };

      // Draw the source to a temp canvas to sample pixels
      const t = document.createElement('canvas'), tc = t.getContext('2d');
      t.width = img.width; t.height = img.height; tc.drawImage(img,0,0);

      for (let y=0; y<=img.height-targetH; y+=step) {
        const data = tc.getImageData(0, y + Math.floor(targetH*0.25), targetW, Math.floor(targetH*0.5)).data; // mid-band
        // score = edge density proxy using brightness variance
        let sum=0, sum2=0, n=0;
        for (let i=0;i<data.length;i+=16){ // sample sparsely
          const r=data[i], g=data[i+1], b=data[i+2];
          const br = 0.299*r + 0.587*g + 0.114*b;
          sum += br; sum2 += br*br; n++;
        }
        const mean = sum/n, variance = sum2/n - mean*mean;
        const score = variance;
        if (score > best.score) best = { y, score };
      }

      els.canvas.width = targetW; els.canvas.height = targetH;
      ctx.clearRect(0,0,targetW,targetH);
      ctx.drawImage(img, 0, best.y, targetW, targetH, 0, 0, targetW, targetH);
    }

    function drawTitleAndCredits(concept) {
      const w = els.canvas.width, h = els.canvas.height;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

      // Title zone (top third)
      const title = (concept.title || '').toUpperCase();
      if (title) {
        let fontSize = Math.min(120, w/8); ctx.font = `bold ${fontSize}px Bebas Neue`;
        while (ctx.measureText(title).width > w*0.88) { fontSize -= 2; ctx.font = `bold ${fontSize}px Bebas Neue`; }
        
        // Enhanced professional text rendering
        ctx.fillStyle = '#000'; ctx.globalAlpha = .8;
        ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = Math.max(fontSize/6,10);
        ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 3;
        
        // Multiple passes for depth
        ctx.fillStyle = '#fff'; ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = Math.max(fontSize/20, 2);
        ctx.strokeText(title, w/2, h*0.15);
        ctx.fillText(title, w/2, h*0.15);
        
        // Add subtle highlight
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText(title, w/2, h*0.15 - 1);
        
        ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
      }

      // Tagline (below title)
      if (concept.tagline) {
        const tagline = concept.tagline;
        let fs = Math.max(20, Math.floor(w/35)); ctx.font = `italic ${fs}px Lato`;
        ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.strokeStyle = 'rgba(0,0,0,.85)';
        ctx.lineWidth = 3; ctx.strokeText(tagline, w/2, h*0.24); ctx.fillText(tagline, w/2, h*0.24);
      }

      // Enhanced bottom credits
      const credits = [
        concept.cast && concept.cast.length ? concept.cast.slice(0,3).join('    ').toUpperCase() : '',
        concept.director ? `DIRECTED BY ${concept.director.toUpperCase()}` : '',
        'A SYNTHETIC CINEMA FILM', 
        `${concept.rating || 'NR'}  •  ${concept.runtime || 120} MINUTES`, 
        `© ${(new Date).getFullYear()} SYNTHETIC ENTERTAINMENT`
      ].filter(Boolean);

      let fs = Math.max(16, Math.floor(w/45)); ctx.font = `bold ${fs}px Lato`;
      ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.lineWidth = 3;
      const startY = h*0.86, lh = fs*1.6;
      
      credits.forEach((line,i)=>{
        const y = startY + i*lh;
        ctx.strokeText(line,w/2,y);
        ctx.fillText(line,w/2,y);
      });
    }

    // Song recommendation
    async function fetchSongRecommendation(concept) {
      try {
        const response = await fetch('/api/get-song-recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ concept })
        });

        if (!response.ok) throw new Error('Song request failed');
        
        const result = await response.json();
        const song = result.song;
        
        els.songTitle.textContent = song.title;
        els.songArtist.textContent = song.artist;
        els.songReason.textContent = song.reason;
        els.copySongBtn.disabled = false;
        
      } catch (error) {
        console.error('Song recommendation error:', error);
        els.songTitle.textContent = 'Unable to load';
        els.songArtist.textContent = 'recommendation';
        els.songReason.textContent = 'Try generating again';
        els.copySongBtn.disabled = true;
      }
    }

    // Instagram caption
    async function fetchInstagramCaption(concept) {
      try {
        const response = await fetch('/api/generate-instagram-caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ concept })
        });

        if (!response.ok) throw new Error('Caption request failed');
        
        const result = await response.json();
        els.instagramCaption.value = result.caption;
        els.copyCaptionBtn.disabled = false;
        
      } catch (error) {
        console.error('Instagram caption error:', error);
        els.instagramCaption.value = 'Unable to generate caption. Try again.';
        els.copyCaptionBtn.disabled = true;
      }
    }

    async function handleGenerate() {
      try {
        setLoading(true,'Concept…');
        
        // 1) Concept
        const cRes = await fetch('/api/generate-concept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ genreFilter: els.genre.value, eraFilter: els.era.value })
        });

        if (!cRes.ok) {
          const err = await cRes.json().catch(() => ({}));
          throw new Error(err.error || `Concept request failed (${cRes.status})`);
        }
        
        const cJson = await cRes.json();
        currentConcept = cJson.concept || {};
        currentConcept.artStyle = els.style.value;
        updateDetails(currentConcept);

        // Generate song recommendation and Instagram caption in parallel
        fetchSongRecommendation(currentConcept);
        fetchInstagramCaption(currentConcept);

        // 2) Image
        setLoading(true,'Artwork…');
        const iRes = await fetch('/api/generate-image', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            concept: currentConcept,
            visualElements: currentConcept.visual_elements
          })
        });
        
        if (!iRes.ok) {
          const err = await iRes.json().catch(() => ({}));
          throw new Error(err.error || 'Image generation failed');
        }
        
        const iJson = await iRes.json();
        const base64 = iJson.imageUrl;

        // 3) Compose: smart-crop to 2:3, gradient plates, then text
        setLoading(true,'Typography…');
        const img = new Image();
        img.onload = () => {
          smartCropToTwoThirds(img);
          addGradientPlates();
          drawTitleAndCredits(currentConcept);
          const out = els.canvas.toDataURL('image/png');
          els.posterImg.src = out;
          els.posterImg.classList.remove('hidden');
          addRecent(out);
          generationCount++; 
          els.count.textContent = `${generationCount} poster${generationCount===1?'':'s'} created`;
          setLoading(false);
        };
        img.onerror = () => { 
          setLoading(false); 
          alert('Failed to load generated image'); 
        };
        img.src = base64;
        
      } catch (e) {
        setLoading(false);
        console.error('Generation error:', e);
        alert(`Error: ${e.message}`);
      }
    }

    function addRecent(url) {
      const cell = document.createElement('div');
      cell.className = 'aspect-[2/3] bg-gray-700 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition';
      cell.innerHTML = `<img src="${url}" class="w-full h-full object-cover" />`;
      cell.onclick = ()=>{ els.posterImg.src = url; els.posterImg.classList.remove('hidden'); };
      els.recent.prepend(cell);
      while (els.recent.children.length > 6) els.recent.lastChild.remove();
      els.saveBtn.disabled = false; els.shareBtn.disabled = false;
    }

    // Copy functions
    async function copySongInfo() {
      if (!els.songTitle.textContent || els.songTitle.textContent === '—') return;
      
      const songInfo = `🎵 Soundtrack Recommendation:\n"${els.songTitle.textContent}" by ${els.songArtist.textContent}\n\n${els.songReason.textContent}`;
      
      try {
        await navigator.clipboard.writeText(songInfo);
        const originalText = els.copySongBtn.textContent;
        els.copySongBtn.textContent = 'Copied! ✓';
        els.copySongBtn.classList.add('bg-green-600');
        els.copySongBtn.classList.remove('bg-indigo-600');
        
        setTimeout(() => {
          els.copySongBtn.textContent = originalText;
          els.copySongBtn.classList.remove('bg-green-600');
          els.copySongBtn.classList.add('bg-indigo-600');
        }, 2000);
      } catch (error) {
        console.error('Error copying song info:', error);
        alert('Failed to copy song info');
      }
    }

    async function copyInstagramCaption() {
      if (!els.instagramCaption.value) return;
      
      try {
        await navigator.clipboard.writeText(els.instagramCaption.value);
        const originalText = els.copyCaptionBtn.textContent;
        els.copyCaptionBtn.textContent = 'Copied! ✓';
        els.copyCaptionBtn.classList.add('bg-green-600');
        els.copyCaptionBtn.classList.remove('bg-pink-600');
        
        setTimeout(() => {
          els.copyCaptionBtn.textContent = originalText;
          els.copyCaptionBtn.classList.remove('bg-green-600');
          els.copyCaptionBtn.classList.add('bg-pink-600');
        }, 2000);
      } catch (error) {
        console.error('Error copying caption:', error);
        alert('Failed to copy caption');
      }
    }

    // Event listeners
    els.genBtn.addEventListener('click', handleGenerate);
    els.copySongBtn.addEventListener('click', copySongInfo);
    els.copyCaptionBtn.addEventListener('click', copyInstagramCaption);
    
    els.saveBtn.addEventListener('click', ()=>{
      if (!els.posterImg.src) return;
      const a = document.createElement('a');
      const t = currentConcept?.title ? currentConcept.title.replace(/\s+/g,'-') : 'poster';
      a.download = `poster-${t}.png`; a.href = els.posterImg.src; a.click();
    });
    
    els.shareBtn.addEventListener('click', async ()=>{
      if (!els.posterImg.src) return;
      const text = `AI poster: "${currentConcept?.title||''}" — ${currentConcept?.tagline||''}`;
      if (navigator.share) { 
        try { 
          await navigator.share({ 
            title: 'Movie Poster', 
            text, 
            url: location.href 
          }); 
        } catch{} 
      } else { 
        await navigator.clipboard.writeText(text); 
        alert('Poster info copied to clipboard!');
      }
    });

    // Generate on filter change
    els.genre.addEventListener('change', () => {
      if (!els.genBtn.disabled) handleGenerate();
    });
    
    els.era.addEventListener('change', () => {
      if (!els.genBtn.disabled) handleGenerate();
    });
    
    els.style.addEventListener('change', () => {
      if (!els.genBtn.disabled) handleGenerate();
    });
  </script>

</body>
</html>