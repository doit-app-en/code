/* ================= HOME ================= */
function renderHome() {
  const placed = ls('die_placed'); const pl = placed && LV(placed), sk = streakInfo(), sugg = nextSuggestions();
  // What to open next: the first unfinished lesson of the student's own level, otherwise the first thing not done yet.
  const mine = pl && state.levels[pl.id].lessons.find(s => !lessonsDone[s.id]);
  const next = mine ? {icon: pl.icon, text: `${pl.name}: ${mine.title}`, href: `#/lesson/${pl.id}/${mine.id}`} : sugg[0] || (pl ? {icon: pl.icon, text: pl.name, href: `#/level/${pl.id}`} : null);
  const back = sk.total > 0 || !!pl;   // a returning student
  const step = (n, done, href, title, sub) => `<a class="step3${done ? ' done' : ''}" href="${href}"><b>${done ? '✓' : n}</b><span><strong>${title}</strong><small>${sub}</small></span></a>`;
  app.innerHTML = `
  <section class="hero">
    <div style="position:relative">
      <span class="pill">Watch • Listen • Match • Speak</span>
      <h1>Do it <span class="hl">English</span></h1>
      <p class="lead">${back && student ? `Welcome back, ${esc(student.name.split(' ')[0])}! A little English every day makes a big difference.` : 'Learn English step by step with videos, picture stories, fun matching games and an AI speaking coach that listens to your pronunciation.'}</p>
      <div class="row" style="margin-top:20px">
        ${pl ? `<a class="btn sun" href="${next ? next.href : '#/level/' + pl.id}">▶ Continue learning</a><a class="btn ghost" href="#/progress">📈 My progress</a>`
             : `<a class="btn sun" href="#/placement">📝 Find my level</a><button class="btn ghost" id="toLevels">Explore levels ↓</button>`}
      </div>
    </div>
    <div class="hero-photo"><img src="photos/hero.jpg" srcset="photos/hero-800.jpg 800w, photos/hero-1200.jpg 1200w, photos/hero.jpg 1600w" sizes="(max-width:860px) 100vw, 560px" alt="Students studying English together" loading="eager" fetchpriority="high" width="1600" height="1067"></div>
  </section>
  ${back ? `<section class="today" id="today">
    <div class="tstreak${sk.streak ? ' lit' : ''}"><i>🔥</i><b>${sk.streak}</b><small>day${sk.streak === 1 ? '' : 's'} in a row</small>${sk.next && sk.streak ? `<em id="tnextm">🏅 ${sk.next - sk.streak} to go</em>` : ''}</div>
    <div class="tweek"><strong>${sk.today ? 'Done for today — great work! ✅' : sk.restSaved ? 'Your rest day saved your streak 💤 Practise today!' : sk.streak ? 'Practise today to keep your streak!' : 'Finish one activity today to start a streak.'}</strong>
      ${weekDotsHTML(sk)}<div class="wgoal" id="wgoal"></div><small><span id="wkCount">${sk.weekDays} day${sk.weekDays === 1 ? '' : 's'} this week${pl || student ? ' · ' : ''}</span>${[pl ? `⭐ Your level: <b style="color:${pl.color}">${pl.name}</b>` : '', student ? `📈 ${progressData().overall}% done` : ''].filter(Boolean).join(' · ')}</small></div>
    ${next ? `<a class="tnext" href="${next.href}"><small>${sk.total ? 'Continue where you stopped' : 'Start here'}</small><span>${next.icon} ${esc(next.text)}</span><em>Go →</em></a>` : ''}
  </section>` : ''}
  ${!pl || !sk.total ? `<section class="startp" id="startp"><h2>${back ? 'Your path' : 'New here? Start in 3 steps'}</h2><div class="steps3">
    ${step(1, !!pl, '#/placement', 'Find your level', pl ? `You are ${pl.name}` : 'Take the placement test')}
    ${step(2, sk.total > 0 && !!pl, pl ? '#/level/' + pl.id : '#levels', 'Open your level', 'Videos, picture stories and games')}
    ${step(3, sk.streak >= 3, next ? next.href : '#/listening', 'Practise every day', '5 minutes a day builds your streak 🔥')}
  </div></section>` : ''}
  ${mistLinkHTML()}${mixLinkHTML()}${bsLinkHTML()}
  <section class="features">
    <div class="feat"><div class="fi" style="background:#ffe6e6">🎬</div><div><b>Video lessons</b><small>Meet new phrases on screen</small></div></div>
    <div class="feat"><div class="fi" style="background:#fff2cc">🎧</div><div><b>Listen & See</b><small>Voice tracks with pictures</small></div></div>
    <div class="feat"><div class="fi" style="background:#dff7f4">🧩</div><div><b>Match it</b><small>Pair pictures with words</small></div></div>
    <div class="feat"><div class="fi" style="background:#ebe6ff">🎤</div><div><b>Speak & get scored</b><small>AI checks your pronunciation</small></div></div>
  </section>
  <div class="sec-h" id="practise"><h2>Practise</h2></div>
  <div class="pgrid">
  <a class="ptest" style="--img:url(photos/placement.jpg)" href="#/placement">
    <div class="row" style="gap:18px"><div class="big">🧭</div><div><h2>Placement Test</h2><p>${state.placement.questions.length} A1 questions — grammar, vocabulary, everyday English and listening — to find the right level for you.</p></div></div>
    <span class="btn sun">Start the test →</span>
  </a>
  <a class="ptest" style="--img:url(photos/sm/listening.jpg)" href="#/voicetest">
    <div class="row" style="gap:18px"><div class="big">🎙</div><div><h2>Voice Level Test</h2><p>Talk for 3 minutes — answer a question, describe a picture and repeat sentences — and see your speaking and pronunciation level.</p></div></div>
    <span class="btn sun">Start talking →</span>
  </a>
  <a class="ptest pronb" style="--img:url(photos/sm/pronounce.jpg)" href="#/pronounce">
    <div class="row" style="gap:18px"><div class="big">🗣️</div><div><h2>Pronounce</h2><p>Listen to English words letter by letter, A to Z — then the AI checks your pronunciation and gives you a score.</p></div></div>
    <span class="btn sun">Start pronouncing →</span>
  </a>
  <a class="ptest listenb" style="--img:url(photos/sm/listening.jpg)" href="#/listening">
    <div class="row" style="gap:18px"><div class="big">🎧</div><div><h2>Listening</h2><p>${(state.listen && state.listen.exercises.length) || 18} Starters listening exercises — listen and move things, draw lines, tick, colour and number pictures.</p></div></div>
    <span class="btn sun">Start listening →</span>
  </a>
  <a class="ptest speakb" style="--img:url(photos/sm/level-b2.jpg)" href="#/speaking">
    <div class="row" style="gap:18px"><div class="big">🎤</div><div><h2>Test your speaking</h2><p>Record yourself for up to 3 minutes and get feedback on your fluency, accuracy, vocabulary, and formal and informal English.</p></div></div>
    <span class="btn sun">Test my speaking →</span>
  </a>
  </div>
  <div class="sec-h" id="levels"><h2>Choose your level</h2></div>
  <div class="levels">${LEVELS.map(l => `
    <div class="lvl ${placed === l.id ? 'rec' : ''}" style="--c:${l.color}" data-go="#/level/${l.id}">
      <div class="lphoto" style="background-image:url(photos/sm/level-${l.id}.jpg)"><span class="tag">${l.tag}</span></div>
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
  drawGoal();
  if ($('#exportBtn')) $('#exportBtn').onclick = exportCourse;
  $('#importIn').onchange = e => importCourse(e.target.files[0]);
  if ($('#toLevels')) $('#toLevels').onclick = () => $('#levels').scrollIntoView({behavior: 'smooth'});
  app.querySelectorAll('a[href="#levels"]').forEach(a => a.onclick = e => { e.preventDefault(); $('#levels').scrollIntoView({behavior: 'smooth'}); });
  app.querySelectorAll('[data-go]').forEach(el => el.onclick = () => go(el.dataset.go));
}

