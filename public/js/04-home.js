/* ================= HOME ================= */
function renderHome() {
  const placed = ls('die_placed'); const pl = placed && LV(placed);
  app.innerHTML = `
  <section class="hero">
    <div style="position:relative">
      <span class="pill">Watch • Listen • Match • Speak</span>
      <h1>Do it <span class="hl">English</span></h1>
      <p class="lead">Learn English step by step with videos, picture stories, fun matching games and an AI speaking coach that listens to your pronunciation.</p>
      <div class="row" style="margin-top:20px">
        <a class="btn sun" href="#/placement">📝 Take the placement test</a>
        <button class="btn ghost" id="toLevels">Explore levels ↓</button>
      </div>
      ${student ? `<div class="placed">📈 Your progress: <b style="color:${pcol(progressData().overall)}">${progressData().overall}%</b> <a class="btn sm" href="#/progress">See more →</a></div>` : `<div class="placed">📈 <a href="#/progress" style="font-weight:800">See my progress</a></div>`}
      ${pl ? `<div class="placed">🎯 Your level: <b style="color:${pl.color}">${pl.name}</b> <a class="btn sm" href="#/level/${pl.id}">Continue →</a></div>` : ''}
    </div>
    <div class="hero-photo"><img src="photos/hero.jpg" alt="Students studying English together" loading="eager"></div>
  </section>
  <section class="features">
    <div class="feat"><div class="fi" style="background:#ffe6e6">🎬</div><div><b>Video lessons</b><small>Meet new phrases on screen</small></div></div>
    <div class="feat"><div class="fi" style="background:#fff2cc">🎧</div><div><b>Listen & See</b><small>Voice tracks with pictures</small></div></div>
    <div class="feat"><div class="fi" style="background:#dff7f4">🧩</div><div><b>Match it</b><small>Pair pictures with words</small></div></div>
    <div class="feat"><div class="fi" style="background:#ebe6ff">🎤</div><div><b>Speak & get scored</b><small>AI checks your pronunciation</small></div></div>
  </section>
  <section class="ptest" style="--img:url(photos/placement.jpg)">
    <div class="row" style="gap:18px"><div class="big">🧭</div><div><h2>Placement Test</h2><p>${state.placement.questions.length} A1 questions — grammar, vocabulary, everyday English and listening — to find the right level for you.</p></div></div>
    <a class="btn sun" href="#/placement">Start the test →</a>
  </section>
  <section class="ptest" style="--img:url(photos/listening.jpg)">
    <div class="row" style="gap:18px"><div class="big">🎙</div><div><h2>Voice Level Test</h2><p>Talk for 3 minutes — answer a question, describe a picture and repeat sentences — and see your speaking and pronunciation level.</p></div></div>
    <a class="btn sun" href="#/voicetest">Start talking →</a>
  </section>
  <section class="ptest pronb" style="--img:url(photos/pronounce.jpg)">
    <div class="row" style="gap:18px"><div class="big">🗣️</div><div><h2>Pronounce</h2><p>Listen to English words letter by letter, A to Z — then the AI checks your pronunciation and gives you a score.</p></div></div>
    <a class="btn sun" href="#/pronounce">Start pronouncing →</a>
  </section>
  <section class="ptest listenb" style="--img:url(photos/listening.jpg)">
    <div class="row" style="gap:18px"><div class="big">🎧</div><div><h2>Listening</h2><p>${(state.listen && state.listen.exercises.length) || 18} Starters listening exercises — listen and move things, draw lines, tick, colour and number pictures.</p></div></div>
    <a class="btn sun" href="#/listening">Start listening →</a>
  </section>
  <section class="ptest speakb" style="--img:url(photos/level-b2.jpg)">
    <div class="row" style="gap:18px"><div class="big">🎤</div><div><h2>Test your speaking</h2><p>Record yourself for up to 3 minutes and get feedback on your fluency, accuracy, vocabulary, and formal and informal English.</p></div></div>
    <a class="btn sun" href="#/speaking">Test my speaking →</a>
  </section>
  <div class="sec-h" id="levels"><h2>Choose your level</h2></div>
  <div class="levels">${LEVELS.map(l => `
    <div class="lvl ${placed === l.id ? 'rec' : ''}" style="--c:${l.color}" data-go="#/level/${l.id}">
      <div class="lphoto" style="background-image:url(photos/level-${l.id}.jpg)"><span class="tag">${l.tag}</span></div>
      <div class="lbody"><h3>${l.name}</h3><p>${l.desc}</p>
      <div class="meta">📚 ${state.levels[l.id].lessons.length} lesson${state.levels[l.id].lessons.length === 1 ? '' : 's'}</div></div>
      ${placed === l.id ? '<span class="you">⭐ Your level</span>' : ''}
    </div>`).join('')}</div>`;
  app.insertAdjacentHTML('beforeend', `
  <section class="share">
    <div class="row" style="gap:16px;flex:1;min-width:260px"><div class="si">📦</div><div>
      <h3>${mode === 'teacher' ? 'Share your course' : 'Load your teacher’s course'}</h3>
      <p>${mode === 'teacher'
        ? 'Export all levels, lessons, videos, voice tracks and pictures into one file. Send it to your students — they open this page and press “Import course file”.'
        : 'Got a course file from your teacher? Import it here to get all the lessons on this device.'}</p></div></div>
    <div class="row">
      ${mode === 'teacher' ? `<button class="btn sun" id="exportBtn">⬇ Export course file</button>` : ''}
      <label class="btn ghost">⬆ Import course file<input type="file" accept=".json,application/json" hidden id="importIn"></label>
    </div>
  </section>`);
  if ($('#exportBtn')) $('#exportBtn').onclick = exportCourse;
  $('#importIn').onchange = e => importCourse(e.target.files[0]);
  $('#toLevels').onclick = () => $('#levels').scrollIntoView({behavior: 'smooth'});
  app.querySelectorAll('[data-go]').forEach(el => el.onclick = () => go(el.dataset.go));
}

