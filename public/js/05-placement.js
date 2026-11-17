/* ================= PLACEMENT TEST (A1) ================= */
const TOPICS = [
  {id:'order',  name:'Word order',              cat:'Grammar',    icon:'🔀'},
  {id:'be',     name:'Verb “to be”',            cat:'Grammar',    icon:'📘'},
  {id:'do',     name:'Verb “to do”',            cat:'Grammar',    icon:'⚙️'},
  {id:'art',    name:'Articles (a / an / the)', cat:'Grammar',    icon:'🅰️'},
  {id:'can',    name:'Verb “can”',              cat:'Grammar',    icon:'💪'},
  {id:'obj',    name:'Everyday objects',        cat:'Vocabulary', icon:'🔑'},
  {id:'house',  name:'House: rooms & items',    cat:'Vocabulary', icon:'🏠'},
  {id:'func',   name:'Functional English',      cat:'Everyday English', icon:'💬'},
  {id:'listen', name:'Listening',               cat:'Listening',  icon:'🎧'},
];
const TP = id => TOPICS.find(t => t.id === id) || TOPICS[0];
const LISTEN_MIN = 5;
// The correct answer is always stored first; options are shuffled when the test is built.
const Q = (t, q, o, extra) => ({id: uid(), t, q, o, ...(extra || {})});
function defaultBank() { return [
  Q('order','Choose the correct sentence.',['She is a teacher.','Is she teacher a.','A teacher she is.']),
  Q('order','Choose the correct sentence.',['I play football every day.','I every day football play.','Football play I every day.']),
  Q('order','Choose the correct sentence.',['My brother lives in Cairo.','Lives my brother in Cairo.','My brother in Cairo lives.']),
  Q('order','Choose the correct question.',['Where do you live?','Where you do live?','Do you where live?']),
  Q('be','I ___ a student.',['am','is','are'],{tag:'affirmative'}),
  Q('be','My friends ___ at school today.',['are','is','am'],{tag:'affirmative'}),
  Q('be','He is not at home. = He ___ at home.',["isn't","aren't","don't"],{tag:'negative'}),
  Q('be','We ___ hungry. We had a big lunch.',["aren't","isn't","doesn't"],{tag:'negative'}),
  Q('be','___ she your sister?',['Is','Are','Does'],{tag:'question'}),
  Q('be','___ you from Egypt? — Yes, I am.',['Are','Is','Do'],{tag:'question'}),
  Q('do','She ___ to school by bus.',['goes','go','going'],{tag:'affirmative'}),
  Q('do','I ___ like coffee. I drink tea.',["don't","doesn't","am not"],{tag:'negative'}),
  Q('do','My father ___ watch TV in the morning.',["doesn't","don't","isn't"],{tag:'negative'}),
  Q('do','___ you live near here? — Yes, I do.',['Do','Does','Are'],{tag:'question'}),
  Q('do','___ he play tennis?',['Does','Do','Is'],{tag:'question'}),
  Q('art','I eat ___ apple every day.',['an','a','—']),
  Q('art','My mother is ___ doctor.',['a','an','—']),
  Q('art','Look at ___ moon! It is beautiful.',['the','an','—']),
  Q('art','There is ___ umbrella next to the door.',['an','a','—']),
  Q('can','I ___ swim. I love the sea.',['can','cans','can to'],{tag:'affirmative'}),
  Q('can','Penguins ___ fly.',["can't","don't","aren't"],{tag:'negative'}),
  Q('can','___ you speak English?',['Can','Do can','Are'],{tag:'question'}),
  Q('obj','What is this?',['a key','a pen','a spoon'],{pic:'🔑'}),
  Q('obj','You cut paper with ___.',['scissors','a spoon','a towel']),
  Q('obj',"It's raining! Take your ___.",['umbrella','watch','wallet'],{pic:'☂️'}),
  Q('obj','You drink tea from a ___.',['cup','plate','fork']),
  Q('house','You sleep in the ___.',['bedroom','kitchen','garage']),
  Q('house','We cook dinner in the ___.',['kitchen','bathroom','bedroom']),
  Q('house','What is this?',['a sofa','a bed','a fridge'],{pic:'🛋️'}),
  Q('house','The shower is in the ___.',['bathroom','living room','kitchen']),
  Q('house','You keep milk cold in the ___.',['fridge','oven','wardrobe']),
  Q('func','"Thank you very much!" — "___"',["You're welcome.",'Yes, please.','Goodbye.']),
  Q('func','"How are you?" — "___"',["I'm fine, thanks.","I'm twelve.","I'm Ali."]),
  Q('func','You want to know the price. You ask: "___"',['How much is it?','What time is it?','Where is it?']),
  Q('func','"Nice to meet you." — "___"',['Nice to meet you, too.','See you tomorrow.','No, thank you.']),
  Q('func','You are late for class. You say: "___"',["Sorry I'm late.",'Good night.','Help yourself.']),
  Q('listen','Where are the keys?',['On the kitchen table','In the bedroom','In the car'],{listen:'The keys are on the table in the kitchen.'}),
  Q('listen','How old is Sara?',['Twelve','Twenty','Two'],{listen:'Hi! My name is Sara. I am twelve years old.'}),
  Q('listen','What does the speaker like?',['Orange juice','Milk','Coffee'],{listen:"I don't like milk, but I like orange juice."}),
  Q('listen','What does the speaker want?',['Close the window','Open the door','Turn on the light'],{listen:'Can you close the window, please? It is cold.'}),
  Q('listen','How many bedrooms are there?',['Three','One','Two'],{listen:'There are three bedrooms and one bathroom in my house.'}),
  Q('listen','Where is the bathroom?',['Next to the kitchen','Upstairs','Next to the bedroom'],{listen:'Excuse me, where is the bathroom? It is next to the kitchen.'}),
]; }

/* ---- question generator (A1 templates) ---- */
const pick = a => a[Math.floor(Math.random() * a.length)];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const low = s => s === 'I' ? s : s.charAt(0).toLowerCase() + s.slice(1);
const others = (c, pool, n = 2) => shuffle(pool.filter(x => x !== c)).slice(0, n);
const ing = v => v.endsWith('e') ? v.slice(0, -1) + 'ing' : v + 'ing';
const third = v => /(ch|sh|s|x|o)$/.test(v) ? v + 'es' : v + 's';
const ROOMS = ['kitchen','bedroom','bathroom','living room','garage','garden'];
const NAMES = ['Sara','Omar','Lina','Adam','Mona','Karim','Nour','Sam','Huda','Yusuf'];
const FUNC = [
  ['"Good morning!" — "___"',['Good morning!','Good night!','Goodbye!']],
  ['"What\'s your name?" — "___"',['My name is Omar.',"I'm fine.","I'm from Egypt."]],
  ['"Where are you from?" — "___"',["I'm from Jordan.","I'm ten.","I'm a student."]],
  ['"Can I have some water, please?" — "___"',['Sure, here you are.','No, I am.','Yes, I do.']],
  ['You don\'t understand the teacher. You say: "___"',['Can you repeat that, please?','See you later.','Nice to meet you.']],
  ['"See you tomorrow!" — "___"',['Bye! See you!','Thank you!','Yes, please.']],
  ['You want to walk past someone. You say: "___"',['Excuse me.','Thank you.','Welcome.']],
  ['"Would you like some tea?" — "___"',['Yes, please.','Yes, I like.','Yes, I am.']],
  ['"What time is it?" — "___"',["It's three o'clock.","It's Monday.","It's hot."]],
  ['"Happy birthday!" — "___"',['Thank you!','You too!','Happy birthday!']],
  ['You answer the phone. You say: "___"',['Hello?','Goodbye.','Excuse me.']],
  ['"I\'m sorry!" — "___"',["That's OK.","You're welcome.",'Yes, please.']],
  ['"What do you do?" — "___"',["I'm a teacher.","I'm fine.","I do it."]],
  ['"How old are you?" — "___"',["I'm eleven.","I'm fine.","I'm Sara."]],
  ['You want to borrow a pen. You say: "___"',['Can I borrow your pen, please?','Give pen.','I am a pen.']],
  ['"Let\'s go to the park!" — "___"',["Good idea!","You're welcome.","Nice to meet you."]],
];
const GEN = {
  be() {
    const S = [['I','am'],['He','is'],['She','is'],['My teacher','is'],['It','is'],['We','are'],['They','are'],['You','are'],['My parents','are']];
    const C = ['happy','tired','at home','at school','from Egypt','in the garden','hungry','late','in the classroom','busy','cold'];
    const [s, v] = pick(S), c = pick(C), neg = {am:'am not', is:"isn't", are:"aren't"}, tag = pick(['affirmative','negative','question']);
    if (tag === 'affirmative') return Q('be', `${s} ___ ${c}.`, [v, ...['am','is','are'].filter(x => x !== v)], {tag});
    if (tag === 'negative') return Q('be', `${s} ___ ${c}.`, [neg[v], others(neg[v], Object.values(neg), 1)[0], "don't"], {tag});
    return Q('be', `___ ${low(s)} ${c}?`, [cap(v), others(cap(v), ['Am','Is','Are'], 1)[0], 'Do'], {tag});
  },
  do() {
    const S = [['I',0],['You',0],['We',0],['They',0],['My friends',0],['He',1],['She',1],['My sister',1],['Tom',1],['My dad',1]];
    const V = [['play','football'],['like','pizza'],['watch','TV'],['live','in a big house'],['speak','French'],['drink','coffee'],['eat','breakfast'],['read','books'],['go','to the gym']];
    const [s, t3] = pick(S), [v, o] = pick(V), tag = pick(['affirmative','negative','question']);
    if (tag === 'affirmative') return Q('do', `${s} ___ ${o}${v === 'live' ? '' : ' every day'}.`, t3 ? [third(v), v, ing(v)] : [v, third(v), ing(v)], {tag});
    if (tag === 'negative') return Q('do', `${s} ___ ${v} ${o}.`, t3 ? ["doesn't","don't","isn't"] : ["don't","doesn't","aren't"], {tag});
    return Q('do', `___ ${low(s)} ${v} ${o}?`, t3 ? ['Does','Do','Is'] : ['Do','Does','Are'], {tag});
  },
  can() {
    const S = ['I','You','He','She','My brother','We','They','My grandmother'];
    const A = ['swim','ride a bike','speak English','play the piano','cook pasta','run fast','draw a horse','drive a car'];
    const s = pick(S), a = pick(A), tag = pick(['affirmative','negative','question']);
    if (tag === 'affirmative') return Q('can', `${s} ___ ${a} very well.`, ['can','cans','can to'], {tag});
    if (tag === 'negative') return Q('can', `${s} ___ ${a}. It's too difficult.`, ["can't","doesn't","isn't"], {tag});
    return Q('can', `___ ${low(s)} ${a}?`, ['Can','Does can','Is'], {tag});
  },
  art() {
    const r = Math.random();
    if (r < 0.35) { const n = pick(['apple','orange','egg','umbrella','elephant','ice cream','onion','old car']); return Q('art', pick(['I have ___ ','There is ___ ','She wants ___ ']).trim() + ` ${n}.`.replace(/^ /, ' '), ['an','a','—']); }
    if (r < 0.7) { const n = pick(['book','cat','pen','banana','dog','sandwich','bike','new phone','big house']); return Q('art', pick(['I have ___','There is ___','He wants ___']) + ` ${n}.`, ['a','an','—']); }
    return Q('art', pick(['Look at ___ sun. It is very hot today.','Can you close ___ door, please? It is cold.','Please turn off ___ light in the kitchen.','The keys are on ___ table in the living room.']), ['the','an','—']);
  },
  order() {
    const SENT = ['She drinks coffee every morning','They are in the classroom','My father works in a bank','We play football on Fridays','I have two sisters','He can ride a bike','The cat is under the table',"I don't like cold weather",'My mother cooks dinner every day','Ali goes to school by bus','There is a lamp in my bedroom'];
    const w = pick(SENT).split(' ').map((x, i) => i === 0 && !['I','Ali'].includes(x) ? x.toLowerCase() : x);
    const fmtS = a => cap(a.join(' ')) + '.', good = fmtS(w), seen = new Set([good]), bad = [];
    for (let k = 0; k < 40 && bad.length < 2; k++) {
      const c = [...w], swaps = 1 + Math.floor(Math.random() * 2);
      for (let s = 0; s < swaps; s++) { const i = Math.floor(Math.random() * (c.length - 1)); [c[i], c[i + 1]] = [c[i + 1], c[i]]; }
      const f = fmtS(c); if (!seen.has(f)) { seen.add(f); bad.push(f); }
    }
    return Q('order', 'Choose the correct sentence.', [good, ...bad]);
  },
  obj() {
    const OBJ = [['🔑','a key'],['✂️','scissors'],['☂️','an umbrella'],['📱','a phone'],['⌚','a watch'],['👓','glasses'],['🔦','a torch'],['🥄','a spoon'],['🍴','a fork'],['📚','books'],['🧦','socks'],['👟','shoes'],['🎒','a bag'],['✏️','a pencil'],['☕','a cup'],['🧴','soap']];
    if (Math.random() < 0.5) { const [e, w] = pick(OBJ); return Q('obj', 'What is this?', [w, ...others(w, OBJ.map(o => o[1]))], {pic: e}); }
    const USE = [['You write with a ___.','pencil'],['You tell the time with a ___.','watch'],['You brush your teeth with a ___.','toothbrush'],['You open the door with a ___.','key'],['You call your friend on your ___.','phone'],['You eat soup with a ___.','spoon'],['You carry your books in a ___.','bag'],['You dry your hands with a ___.','towel'],['You drink water from a ___.','glass']];
    const [q, c] = pick(USE); return Q('obj', q, [c, ...others(c, ['pencil','watch','toothbrush','key','phone','spoon','bag','towel','glass','fork','sock'])]);
  },
  house() {
    if (Math.random() < 0.6) {
      const F = [['You cook in the ___.','kitchen'],['You sleep in the ___.','bedroom'],['You take a shower in the ___.','bathroom'],['You watch TV in the ___.','living room'],['You park the car in the ___.','garage'],['The children play outside in the ___.','garden'],['The fridge is in the ___.','kitchen'],['The bed is in the ___.','bedroom'],['The bathtub is in the ___.','bathroom'],['The sofa is in the ___.','living room'],['The oven is in the ___.','kitchen'],['The wardrobe is in the ___.','bedroom']];
      const [q, c] = pick(F); return Q('house', q, [c, ...others(c, ROOMS)]);
    }
    const IT = [['🛏️','a bed'],['🛋️','a sofa'],['🚿','a shower'],['🚪','a door'],['🖼️','a picture'],['🪑','a chair'],['🛁','a bathtub'],['📺','a TV'],['💡','a lamp'],['🧹','a broom'],['⏰','a clock']];
    const [e, w] = pick(IT); return Q('house', 'What is this?', [w, ...others(w, IT.map(i => i[1]))], {pic: e});
  },
  func() { const [q, o] = pick(FUNC); return Q('func', q, [...o]); },
  listen() {
    const n = pick(NAMES);
    const T = [
      () => { const AG = ['eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen']; const a = pick(AG);
        return Q('listen', `How old is ${n}?`, [cap(a), ...others(a, AG).map(cap)], {listen: `Hello! My name is ${n}. I am ${a} years old.`}); },
      () => { const it = pick([['keys','are'],['glasses','are'],['phone','is'],['books','are'],['shoes','are'],['bag','is']]), r = pick(ROOMS);
        return Q('listen', `Where ${it[1]} the ${it[0]}?`, [`In the ${r}`, ...others(r, ROOMS).map(x => `In the ${x}`)], {listen: `The ${it[0]} ${it[1]} in the ${r}.`}); },
      () => { const FD = ['apples','fish','rice','chocolate','eggs','salad','milk','bananas']; const [a, b, c] = shuffle(FD);
        return Q('listen', `What does ${n} like?`, [cap(a), cap(b), cap(c)], {listen: `My name is ${n}. I like ${a}, but I don't like ${b}.`}); },
      () => { const TM = ['six','seven','eight','nine']; const t = pick(TM);
        return Q('listen', `What time does ${n} get up?`, [`At ${t} o'clock`, ...others(t, TM).map(x => `At ${x} o'clock`)], {listen: `${n} gets up at ${t} o'clock every morning.`}); },
      () => { const NU = ['two','three','four','five']; const k = pick(NU), th = pick(['bedrooms','bathrooms','windows','chairs in the kitchen']);
        return Q('listen', `How many ${th.split(' ')[0]} are there?`, [cap(k), ...others(k, NU).map(cap)], {listen: `There are ${k} ${th} in my house.`}); },
      () => { const AB = ['swim','ride a bike','play the guitar','cook','speak French','draw']; const [a, b, c] = shuffle(AB);
        return Q('listen', 'What can the speaker do?', [cap(a), cap(b), cap(c)], {listen: `I can ${a}, but I can't ${b}.`}); },
      () => { const pl = pick(['the park','the market','the library','the cinema']), op = ['the park','the market','the library','the cinema'];
        return Q('listen', `Where is ${n} going?`, [cap(pl), ...others(pl, op).map(cap)], {listen: `Hi, it's ${n}. I'm going to ${pl} now. See you later!`}); },
    ];
    return pick(T)();
  },
};
const qKey = q => q.t + '|' + q.q + '|' + (q.listen || '') + '|' + q.o[0];
function generateQuestions(topic, count) {
  const have = new Set(bank().map(qKey)), out = [];
  const order = shuffle(TOPICS.map(t => t.id));
  for (let i = 0; i < count; i++) {
    const t = topic === 'mix' ? order[i % order.length] : topic;
    for (let k = 0; k < 25; k++) { const q = GEN[t](); if (!have.has(qKey(q))) { have.add(qKey(q)); out.push(q); break; } }
  }
  return out;
}

/* ---- countdown music (generated live with Web Audio, or the teacher's own file) ---- */
const Music = {
  ctx: null, master: null, iv: null, on: false, urgency: 0, step: 0, next: 0, el: null,
  ensure() {
    if (!this.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.connect(this.ctx.destination); }
    if (this.ctx.state === 'suspended') this.ctx.resume(); return true;
  },
  start() {
    const s = ptSet(); if (this.on || s.music === 'off') return; this.on = true;
    if (s.music === 'custom') {
      if (!s.musicM || !urlCache[s.musicM]) { this.on = false; return; }
      this.el = this.el || new Audio(); if (this.el.src !== urlCache[s.musicM]) this.el.src = urlCache[s.musicM];
      this.el.loop = true; this.el.volume = s.vol; this.el.play().catch(() => {}); return;
    }
    if (!this.ensure()) { this.on = false; return; }
    this.master.gain.value = s.vol * 0.6; this.step = 0; this.next = this.ctx.currentTime + 0.05;
    this.iv = setInterval(() => this.schedule(), 25);
  },
  stop() { this.on = false; clearInterval(this.iv); this.iv = null; if (this.el) this.el.pause(); },
  schedule() { const dt = 60 / (96 + this.urgency * 72) / 2; while (this.next < this.ctx.currentTime + 0.12) { this.beat(this.step++, this.next); this.next += dt; } },
  beat(s, t) {
    const r = [45, 45, 48, 43][Math.floor(s / 8) % 4], arp = [12, 19, 24, 19];
    this.tone(t, s % 2 ? 2400 : 3000, 0.025, s % 2 ? 0.04 : 0.08, 'square', true);          // clock tick
    if (s % 4 === 0) this.tone(t, r, 0.28, 0.3, 'sawtooth');                                // bass pulse
    if (s % 2 === 1) this.tone(t, r + arp[(s >> 1) % 4], 0.14, 0.06 + this.urgency * 0.05, 'triangle'); // tension arpeggio
    if (this.urgency > 0.8 && s % 2 === 0) this.tone(t, r + 31, 0.08, 0.05, 'square');      // alarm when time is short
  },
  tone(t, n, dur, g, type, hz) {
    const c = this.ctx, o = c.createOscillator(), a = c.createGain();
    o.type = type; o.frequency.value = hz ? n : 440 * Math.pow(2, (n - 69) / 12);
    a.gain.setValueAtTime(0.0001, t); a.gain.exponentialRampToValueAtTime(g, t + 0.005); a.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(a); a.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  },
  sfx(kind) {
    if (!this.ensure()) return; const t = this.ctx.currentTime; this.master.gain.value = Math.max(0.15, ptSet().vol * 0.6);
    if (kind === 'tick') this.tone(t, 1760, 0.12, 0.25, 'sine', true);
    if (kind === 'up') { this.tone(t, 220, 0.5, 0.35, 'sawtooth', true); this.tone(t + 0.18, 165, 0.7, 0.35, 'sawtooth', true); }
  },
};
let musicMuted = ls('die_mute') === '1', ptIv = null;
const soundOn = () => ptSet().music !== 'off' && !musicMuted;
const fmtDur = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const qLimit = it => ptSet().qsec + (it.q.listen ? 10 : 0);   // listening questions get 10 extra seconds
function watchHTML() {
  const s = ptSet();
  const ticks = Array.from({length: 12}, (_, i) => { const a = i * Math.PI / 6; return `<line x1="${32 + 23 * Math.sin(a)}" y1="${38 - 23 * Math.cos(a)}" x2="${32 + 26 * Math.sin(a)}" y2="${38 - 26 * Math.cos(a)}" class="wtk"/>`; }).join('');
  return `<div class="watch" id="watch" title="Time left">
    <svg viewBox="0 0 64 70"><rect x="27" y="0" width="10" height="7" rx="2" class="wk"/><rect x="47" y="9" width="7" height="5" rx="1.5" class="wk" transform="rotate(40 50 11)"/>
      <circle cx="32" cy="38" r="30" class="wb"/><circle cx="32" cy="38" r="27" class="wf"/>
      <circle cx="32" cy="38" r="27" class="wa" id="wArc" pathLength="100" transform="rotate(-90 32 38)"/>${ticks}
      <line x1="32" y1="38" x2="32" y2="17" class="wh" id="wHand"/><circle cx="32" cy="38" r="3.2" class="wc"/></svg>
    <div><div class="wt" id="wTime">--:--</div><div class="wl">${s.timer === 'question' ? 'for this question' : 'left for the test'}</div></div>
  </div>`;
}
function drawWatch(left, total) {
  const w = $('#watch'); if (!w) return;
  const f = Math.max(0, Math.min(1, left / total));
  $('#wArc').setAttribute('stroke-dasharray', `${f * 100} 100`);
  $('#wHand').setAttribute('transform', `rotate(${((total - left) % 60) * 6} 32 38)`);
  $('#wTime').textContent = fmtDur(Math.ceil(left));
  w.classList.toggle('warn', f <= 0.33 && left > 10); w.classList.toggle('danger', left <= 10);
}
function syncMusic() {
  const it = P.stage === 'test' && P.items[P.i];
  if (it && ptSet().timer !== 'off' && soundOn() && !it.q.listen) Music.start(); else Music.stop();
}
function startPtClock() {
  clearInterval(ptIv); const s = ptSet(); if (s.timer === 'off' || P.stage !== 'test') return;
  const it = P.items[P.i];
  if (s.timer === 'question' && !it.deadline) it.deadline = Date.now() + qLimit(it) * 1000;
  const total = s.timer === 'question' ? qLimit(it) : s.tmin * 60, end = s.timer === 'question' ? it.deadline : P.deadline;
  let lastSec = null;
  const tick = () => {
    const left = Math.max(0, (end - Date.now()) / 1000), sec = Math.ceil(left);
    drawWatch(left, total);
    Music.urgency = left <= 10 ? 1 : left / total < 0.5 ? 0.45 : 0;
    if (sec !== lastSec && sec <= 5 && sec > 0 && soundOn()) Music.sfx('tick');
    lastSec = sec;
    if (left <= 0) { clearInterval(ptIv); timeUp(); }
  };
  tick(); ptIv = setInterval(tick, 200);
}
function timeUp() {
  if (P.stage !== 'test' || P.locked) return;
  if (soundOn()) Music.sfx('up');
  speechSynthesis.cancel();
  if (ptSet().timer === 'test') { toast('⏰ Time is up! The test has ended.'); finishTest(); return; }
  toast('⏰ Time is up for that question');
  if (P.i < P.items.length - 1) { P.i++; renderPlacement(); } else finishTest();
}

/* ---- placement state ---- */
let P = {stage: 'info'}, ptTab = 'test', results = [], editQ = null, freshIds = new Set();
const bank = () => state.placement.questions;
const ptSet = () => (state.placement.settings = Object.assign({timer: 'off', qsec: 30, tmin: 30, music: 'builtin', musicM: null, musicName: '', vol: 0.5}, state.placement.settings || {}));
const saveResults = () => DB.put('kv', 'results', results);
function levelFor(pct) { return pct < 35 ? 'f1' : pct < 55 ? 'f2' : pct < 80 ? 'a1' : 'a2'; }
function levelNote(pct) { return pct < 35 ? 'Start from the very beginning to build strong basics.' : pct < 55 ? 'You know some basics. Foundation 2 will make them strong.' : pct < 80 ? 'Good A1 knowledge — keep practising at Level A1.' : 'Excellent! You are strong at A1 and ready for Level A2.'; }
function buildItems() {
  const rank = id => TOPICS.findIndex(t => t.id === id);
  return [...bank()].sort((a, b) => rank(a.t) - rank(b.t))
    .map(q => ({q, opts: shuffle(q.o.filter(x => String(x).trim()).map((t, k) => ({t, ok: k === 0})))}));
}

function renderPlacement() {
  const T = mode === 'teacher';
  if (!T) ptTab = 'test';
  const tabs = T ? `<div class="tabs no-print" style="--c:var(--navy);grid-template-columns:repeat(3,1fr)">
      ${[['test','📝','Take the test'],['bank','🗂',`Questions (${bank().length})`],['results','📊',`Results (${results.length})`]]
        .map(t => `<button class="tab ${ptTab === t[0] ? 'on' : ''}" data-pt="${t[0]}">${t[1]} ${t[2]}</button>`).join('')}</div>` : '';
  const V = ptTab === 'bank' ? [ptBank, bindBank] : ptTab === 'results' ? [ptResults, bindResults] : [ptTest, bindTest];
  app.innerHTML = `<div class="pt-wrap ${ptTab !== 'test' ? 'wide' : ''}"><div class="crumbs no-print"><a href="#/">Home</a> › Placement Test</div>${tabs}${ptTab === 'test' && P.stage === 'info' ? '<div class="banner photo slim" style="--ac:#ffb703;--img:url(photos/placement.jpg)"><div><h1>Placement Test</h1><p>Answer a few questions to find the right level for you.</p></div></div><div style="height:16px"></div>' : ''}${V[0]()}</div>`;
  app.querySelectorAll('[data-pt]').forEach(b => b.onclick = () => { stopAll(); ptTab = b.dataset.pt; editQ = null; renderPlacement(); });
  V[1]();
}

/* ---- student: info form, questions, result ---- */
function ptTest() {
  const n = bank().length, nl = bank().filter(q => q.t === 'listen').length;
  if (P.stage === 'done') return ptResultHTML(P.rec, true);
  if (P.stage === 'test') {
    const it = P.items[P.i], tp = TP(it.q.t), N = P.items.length, s = ptSet(), timed = s.timer !== 'off';
    return `<div class="panel">
      <div class="tbar">
        <div><span class="tbadge">${tp.icon} ${tp.cat} · ${esc(tp.name)}${it.q.tag ? ' · ' + esc(it.q.tag) : ''}</span><div class="prog" style="margin-top:8px">Question ${P.i + 1} of ${N}</div></div>
        ${timed ? `<div class="row" style="gap:8px">${watchHTML()}${s.music !== 'off' ? `<button class="btn ghost sm" id="muteBtn" title="Countdown music on/off">${musicMuted ? '🔇' : '🎵'}</button>` : ''}</div>` : ''}
      </div>
      ${timed && it.q.listen && soundOn() ? '<div class="lbl" style="margin-top:6px">🎵 Music is paused so you can listen.</div>' : ''}
      <div class="pbar"><i style="width:${P.i / N * 100}%"></i></div>
      ${it.q.listen ? `<div class="listenbox"><button class="btn teal" data-pa="play">🔊 Play</button><button class="btn ghost sm" data-pa="slow">🐢 Slowly</button><span class="hint" style="margin:0">Listen carefully, then choose the answer.</span></div>` : ''}
      ${it.q.pic ? `<div class="qpic">${esc(it.q.pic)}</div>` : ''}
      <div class="q">${esc(it.q.q)}</div>
      <div class="opts">${it.opts.map((o, k) => `<button class="opt ${P.ans[P.i] === k ? 'chosen' : ''}" data-k="${k}"><span class="k">${'ABCD'[k]}</span>${esc(o.t)}</button>`).join('')}</div>
      <div class="row" style="justify-content:space-between;margin-top:18px"><button class="btn ghost sm" data-pa="back" ${P.i && ptSet().timer !== 'question' ? '' : 'disabled'}>← Back</button><span class="hint" style="margin:0">👤 ${esc(P.info.name)} · ${esc(P.info.cls)}</span></div>
    </div>`;
  }
  const inf = P.info || {};
  return `<div class="panel">
    <div class="pt-hero"><div class="big">🧭</div><div><h2>A1 Placement Test</h2><p>${n} questions · Grammar · Vocabulary · Everyday English · ${nl} listening questions</p></div></div>
    <div class="sects">${TOPICS.map(t => `<span class="badge">${t.icon} ${esc(t.name)}</span>`).join('')}</div>
    ${(() => { const s = ptSet(); if (s.timer === 'off') return '';
      return `<div class="note" style="margin:0 0 16px">⏱ ${s.timer === 'question' ? `You have <b>${s.qsec} seconds</b> for each question (listening questions get 10 seconds more). When the time ends, the test moves to the next question.` : `You have <b>${s.tmin} minute${s.tmin === 1 ? '' : 's'}</b> for the whole test. Watch the clock!`}
        ${s.music !== 'off' ? '<br>🎵 Countdown music will play during the test — you can turn it off with the 🎵 button.' : ''}</div>`; })()}
    <form id="infoForm" class="form" novalidate>
      <label class="field"><span>Student name</span><input class="in" name="name" autocomplete="off" placeholder="e.g. Sara Ahmed" value="${esc(inf.name || '')}"></label>
      <label class="field"><span>Class</span><input class="in" name="cls" autocomplete="off" placeholder="e.g. Grade 5 – A" value="${esc(inf.cls || '')}"></label>
      <label class="field"><span>Phone number</span><input class="in" name="phone" type="tel" autocomplete="off" placeholder="e.g. 0790 123 4567" value="${esc(inf.phone || '')}"></label>
      <div class="err" id="ierr"></div>
      <div><button class="btn sun" type="submit">Start the test →</button></div>
    </form>
    ${nl < LISTEN_MIN ? `<div class="warn">⚠️ This test should have at least ${LISTEN_MIN} listening questions (it has ${nl}). ${mode === 'teacher' ? 'Add more in the Questions tab.' : 'Please tell your teacher.'}</div>` : ''}
  </div>`;
}
function bindTest() {
  const f = $('#infoForm');
  if (f) f.onsubmit = e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f)), info = {name: d.name.trim(), cls: d.cls.trim(), phone: d.phone.trim()};
    const digits = info.phone.replace(/\D/g, '');
    const err = info.name.length < 2 ? 'Please write the student’s full name.' : !info.cls ? 'Please write the class.'
      : !/^[+\d\s\-()]+$/.test(info.phone) || digits.length < 7 || digits.length > 15 ? 'Please write a valid phone number (7–15 digits).' : '';
    if (err) { $('#ierr').textContent = err; return; }
    if (!bank().length) { $('#ierr').textContent = 'There are no questions yet. Ask your teacher to add some.'; return; }
    const st = ptSet();
    if (st.timer !== 'off' && st.music === 'builtin') Music.ensure();   // unlock audio on this click
    P = {stage: 'test', info, items: buildItems(), i: 0, ans: [], started: Date.now(), deadline: st.timer === 'test' ? Date.now() + st.tmin * 60000 : null};
    renderPlacement();
  };
  if (P.stage === 'test') {
    const it = P.items[P.i];
    P.locked = false;
    syncMusic(); startPtClock();
    if (it.q.listen && !it.played) { it.played = true; setTimeout(() => say(it.q.listen, null, 0.85), 450); }
    if ($('#muteBtn')) $('#muteBtn').onclick = () => { musicMuted = !musicMuted; ls('die_mute', musicMuted ? '1' : '0'); $('#muteBtn').textContent = musicMuted ? '🔇' : '🎵'; syncMusic(); };
    app.querySelectorAll('[data-pa]').forEach(b => b.onclick = () => {
      if (b.dataset.pa === 'play') say(it.q.listen, null, 0.85);
      if (b.dataset.pa === 'slow') say(it.q.listen, null, 0.6);
      if (b.dataset.pa === 'back' && P.i) { speechSynthesis.cancel(); P.i--; renderPlacement(); }
    });
    app.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      if (P.locked) return;
      P.locked = true; if (ptSet().timer === 'question') clearInterval(ptIv);
      P.ans[P.i] = +b.dataset.k;
      app.querySelectorAll('.opt').forEach(x => x.classList.toggle('chosen', x === b));
      setTimeout(() => { speechSynthesis.cancel(); if (P.i < P.items.length - 1) { P.i++; renderPlacement(); } else finishTest(); }, 280);
    });
  }
  if (P.stage === 'done') bindResultButtons();
}
async function finishTest() {
  if (P.stage !== 'test') return;
  clearInterval(ptIv); Music.stop(); P.stage = 'saving';
  const topics = {}; let score = 0;
  const unanswered = P.items.filter((_, i) => P.ans[i] === undefined).length, time = Math.round((Date.now() - P.started) / 1000);
  P.items.forEach((it, i) => { const ok = P.ans[i] !== undefined && it.opts[P.ans[i]].ok; if (ok) score++;
    topics[it.q.t] = topics[it.q.t] || [0, 0]; topics[it.q.t][1]++; if (ok) topics[it.q.t][0]++; });
  const total = P.items.length, pct = Math.round(score / total * 100);
  const rec = {id: uid(), ...P.info, date: new Date().toISOString(), score, total, pct, level: levelFor(pct), topics, time, unanswered, timer: ptSet().timer};
  results.unshift(rec); await saveResults(); ls('die_placed', rec.level); onActivity();
  P = {stage: 'done', rec, info: {cls: P.info.cls}}; renderPlacement();
}
function ptResultHTML(rec, student) {
  const L = LV(rec.level), col = rec.pct >= 80 ? 'var(--green)' : rec.pct >= 55 ? 'var(--sun)' : 'var(--coral)';
  const rows = TOPICS.filter(t => rec.topics[t.id]).map(t => { const [c, n] = rec.topics[t.id], p = Math.round(c / n * 100);
    return {t, c, n, p, html: `<div class="brow"><span>${t.icon} ${esc(t.name)}</span><div class="bt"><i style="width:${p}%;background:${p >= 80 ? 'var(--green)' : p >= 50 ? 'var(--sun)' : 'var(--coral)'}"></i></div><b>${c}/${n}</b></div>`}; });
  const weak = rows.filter(r => r.p < 60).map(r => r.t.name);
  return `<div class="panel res-card" style="--c:${L.color}">
    <div class="stud"><div><div class="lbl">STUDENT</div><b style="font-size:22px">${esc(rec.name)}</b><div class="hint" style="margin:2px 0 0">🏫 Class ${esc(rec.cls)} · 📞 ${esc(rec.phone)}</div></div>
      <div class="hint" style="margin:0;text-align:right">A1 Placement Test<br>${new Date(rec.date).toLocaleString()}</div></div>
    <div class="res-top">
      <div class="ring" style="--p:${rec.pct};--rc:${col};width:140px;height:140px"><span style="width:108px;height:108px;font-size:34px">${rec.pct}%</span></div>
      <div><div class="hint" style="margin:0">${rec.score} of ${rec.total} correct · Recommended level</div>
        <h1 class="baloo" style="margin:0;color:${L.color};font-size:44px;line-height:1.05">${L.icon} ${L.name}</h1>
        <p style="margin:4px 0 0;font-weight:700">${levelNote(rec.pct)}</p>
        ${rec.time !== undefined ? `<p class="hint" style="margin:6px 0 0">⏱ Time taken: <b>${fmtDur(rec.time)}</b>${rec.unanswered ? ` · <b style="color:var(--coral)">${rec.unanswered} not answered</b> (time ran out)` : ''}</p>` : ''}</div>
    </div>
    <h3 class="baloo" style="margin:22px 0 8px;font-size:22px;color:var(--navy)">Skills breakdown</h3>
    <div class="bars">${rows.map(r => r.html).join('')}</div>
    ${weak.length ? `<div class="note">📌 Practise more: <b>${weak.map(esc).join(', ')}</b></div>` : `<div class="note">🌟 Great work in every section!</div>`}
    ${student ? `<div class="row no-print" style="justify-content:center;margin-top:20px">
      <a class="btn sun" href="#/level/${L.id}">Start learning →</a>
      <button class="btn ghost" data-ra="print">🖨 Print / save as PDF</button>
      <button class="btn ghost" data-ra="new">👤 Next student</button></div>` : ''}
  </div>`;
}
function bindResultButtons() {
  app.querySelectorAll('[data-ra]').forEach(b => b.onclick = () => {
    if (b.dataset.ra === 'print') window.print();
    if (b.dataset.ra === 'new') { P = {stage: 'info', info: {cls: (P.info || {}).cls || ''}}; renderPlacement(); }
    if (b.dataset.ra === 'close') renderPlacement();
  });
}

/* ---- teacher: question bank ---- */
function ptBank() {
  const nl = bank().filter(q => q.t === 'listen').length, e = editQ ? bank().find(q => q.id === editQ) : null, et = e ? e.t : ($('#fTopic') || {}).value || 'order';
  return `<div class="panel">
      <h2 class="sec-t">🗂 Question bank</h2>
      <p class="hint">All questions are A1 level. Every student answers all the questions below; answer options are shuffled each time.</p>
      <div class="sects">${TOPICS.map(t => { const c = bank().filter(q => q.t === t.id).length; return `<span class="badge ${c ? '' : 'zero'}">${t.icon} ${esc(t.name)}: <b>${c}</b></span>`; }).join('')}</div>
      ${nl < LISTEN_MIN ? `<div class="warn">⚠️ The test needs at least ${LISTEN_MIN} listening questions — it has ${nl}. Generate or add more below.</div>` : ''}
    </div>
    <div class="panel" style="margin-top:16px">
      <h3 class="sec-t" style="font-size:24px">⏱ Timer & countdown music</h3>
      <p class="hint" style="margin-bottom:12px">Optional. A stopwatch shows students how much time is left, and countdown music helps them keep the pace.</p>
      <div class="setg">
        <label class="field"><span>Timer</span><select class="in" id="sTimer"><option value="off">No timer</option><option value="question">Time for each question</option><option value="test">Time for the whole test</option></select></label>
        <label class="field" id="fQsec"><span>Seconds per question</span><input class="in" type="number" id="sQsec" min="5" max="600"></label>
        <label class="field" id="fTmin"><span>Minutes for the whole test</span><input class="in" type="number" id="sTmin" min="1" max="180"></label>
        <label class="field"><span>Countdown music</span><select class="in" id="sMusic"><option value="off">Off</option><option value="builtin">Built-in countdown music</option><option value="custom">My own music file</option></select></label>
        <label class="field"><span>Volume</span><input type="range" id="sVol" min="0.05" max="1" step="0.05"></label>
      </div>
      <div class="row" style="margin-top:12px">
        <label class="btn sm ghost" id="upMusic">📁 Upload music<input type="file" accept="audio/*" hidden id="sMusicFile"></label>
        <span class="lbl" id="musicName"></span>
        <button class="btn sm teal" id="sPreview">▶ Preview music</button>
      </div>
      <p class="lbl" style="margin:10px 0 0">Music plays only while a timer is on. It pauses during listening questions, gets faster in the last seconds, and students can switch it off with the 🎵 button. With “time for each question”, listening questions get 10 extra seconds and students can't go back.</p>
    </div>
    <div class="panel gen" style="margin-top:16px">
      <h3 class="sec-t" style="font-size:24px">✨ Generate new questions</h3>
      <p class="hint" style="margin-bottom:12px">Creates new A1 questions automatically. They appear in the list marked <span class="new">NEW</span> — check them and delete any you don't want.</p>
      <div class="row">
        <select class="in" id="gTopic"><option value="mix">🎲 Mixed — all topics</option>${TOPICS.map(t => `<option value="${t.id}">${t.icon} ${t.cat}: ${esc(t.name)}</option>`).join('')}</select>
        <label class="row" style="gap:6px"><span class="lbl">How many</span><input class="in" id="gNum" type="number" min="1" max="30" value="5" style="width:80px"></label>
        <button class="btn sun" id="gBtn">✨ Generate</button>
      </div>
    </div>
    <div class="panel" style="margin-top:16px">
      <h3 class="sec-t" style="font-size:24px">${e ? '✏️ Edit question' : '➕ Write your own question'}</h3>
      <form id="qForm" class="qform" novalidate>
        <label class="field"><span>Topic</span><select class="in" name="t" id="fTopic">${TOPICS.map(t => `<option value="${t.id}" ${et === t.id ? 'selected' : ''}>${t.icon} ${t.cat}: ${esc(t.name)}</option>`).join('')}</select></label>
        <label class="field"><span>Grammar form (optional)</span><select class="in" name="tag">${['','affirmative','negative','question'].map(x => `<option value="${x}" ${e && (e.tag || '') === x ? 'selected' : ''}>${x || '—'}</option>`).join('')}</select></label>
        <label class="field wide"><span>Question (use ___ for the gap)</span><input class="in" name="q" value="${esc(e ? e.q : '')}" placeholder="e.g. She ___ a teacher."></label>
        <label class="field wide lrow" ${et === 'listen' ? '' : 'hidden'}><span>🔊 What the student hears</span><input class="in" name="listen" value="${esc(e && e.listen || '')}" placeholder="e.g. My name is Omar. I am ten years old."></label>
        <label class="field"><span>Picture (optional emoji)</span><input class="in" name="pic" value="${esc(e && e.pic || '')}" placeholder="e.g. 🔑" maxlength="12"></label>
        <label class="field ok"><span>✓ Correct answer</span><input class="in" name="o0" value="${esc(e ? e.o[0] : '')}"></label>
        <label class="field"><span>✗ Wrong answer 1</span><input class="in" name="o1" value="${esc(e && e.o[1] || '')}"></label>
        <label class="field"><span>✗ Wrong answer 2</span><input class="in" name="o2" value="${esc(e && e.o[2] || '')}"></label>
        <label class="field"><span>✗ Wrong answer 3 (optional)</span><input class="in" name="o3" value="${esc(e && e.o[3] || '')}"></label>
        <div class="err wide" id="qerr"></div>
        <div class="row wide"><button class="btn" type="submit">${e ? '💾 Save changes' : '➕ Add question'}</button>${e ? '<button class="btn ghost" type="button" id="cancelEdit">Cancel</button>' : ''}${e && e.listen ? '' : ''}<button class="btn ghost sm" type="button" id="hearForm" ${et === 'listen' ? '' : 'hidden'}>▶ Hear it</button></div>
      </form>
    </div>
    <div class="panel" style="margin-top:16px">
      <div class="row" style="justify-content:space-between"><h3 class="sec-t" style="font-size:24px">📋 All questions (${bank().length})</h3><button class="btn ghost sm" id="resetBank">↺ Restore default questions</button></div>
      ${TOPICS.map(t => { const qs = bank().filter(q => q.t === t.id); if (!qs.length) return '';
        return `<h4 class="qgroup">${t.icon} ${t.cat} · ${esc(t.name)} <span class="lbl">(${qs.length})</span></h4>` + qs.map(q => `
        <div class="qrow ${freshIds.has(q.id) ? 'fresh' : ''} ${editQ === q.id ? 'editing' : ''}">
          <div class="qmain">${freshIds.has(q.id) ? '<span class="new">NEW</span> ' : ''}${q.pic ? esc(q.pic) + ' ' : ''}<b>${esc(q.q)}</b>${q.tag ? ` <span class="badge">${esc(q.tag)}</span>` : ''}
            ${q.listen ? `<div class="lt">🔊 “${esc(q.listen)}” <button class="btn sm ghost" data-hq="${q.id}">▶</button></div>` : ''}
            <div class="qo">${q.o.filter(x => String(x).trim()).map((o, k) => `<span class="${k ? 'w' : 'c'}">${k ? '✗' : '✓'} ${esc(o)}</span>`).join('')}</div></div>
          <div class="qbtns"><button class="btn sm ghost" data-eq="${q.id}" title="Edit">✏️</button><button class="btn sm ghost" data-dq="${q.id}" title="Delete">🗑</button></div>
        </div>`).join(''); }).join('')}
    </div>`;
}
function bindSettings() {
  const s = ptSet();
  const show = () => { $('#fQsec').hidden = s.timer !== 'question'; $('#fTmin').hidden = s.timer !== 'test';
    $('#upMusic').hidden = s.music !== 'custom'; $('#musicName').textContent = s.music === 'custom' ? (s.musicM ? '🎵 ' + (s.musicName || 'Your music file') : 'No file uploaded yet') : '';
    $('#sPreview').hidden = s.music === 'off'; };
  $('#sTimer').value = s.timer; $('#sQsec').value = s.qsec; $('#sTmin').value = s.tmin; $('#sMusic').value = s.music; $('#sVol').value = s.vol;
  const upd = async () => {
    s.timer = $('#sTimer').value; s.music = $('#sMusic').value; s.vol = +$('#sVol').value;
    s.qsec = Math.min(600, Math.max(5, parseInt($('#sQsec').value) || 30)); s.tmin = Math.min(180, Math.max(1, parseInt($('#sTmin').value) || 30));
    show(); await save();
  };
  ['sTimer', 'sQsec', 'sTmin', 'sMusic', 'sVol'].forEach(id => $('#' + id).onchange = upd);
  $('#sMusicFile').onchange = async e => { const f = e.target.files[0]; if (!f) return; s.musicM = await storeMedia(f); s.musicName = f.name; await save(); show(); toast('Music file saved 🎵'); };
  let pv = null;
  $('#sPreview').onclick = () => {
    if (pv) { clearTimeout(pv); pv = null; Music.stop(); $('#sPreview').textContent = '▶ Preview music'; return; }
    if (s.music === 'custom' && !s.musicM) return toast('Upload a music file first');
    Music.stop(); Music.urgency = 0; Music.start(); $('#sPreview').textContent = '⏹ Stop';
    setTimeout(() => { if (pv) Music.urgency = 1; }, 5000);
    pv = setTimeout(() => { pv = null; Music.stop(); $('#sPreview').textContent = '▶ Preview music'; }, 9000);
  };
  show();
}
function bindBank() {
  bindSettings();
  $('#gBtn').onclick = async () => {
    const t = $('#gTopic').value, n = Math.min(30, Math.max(1, parseInt($('#gNum').value) || 5));
    const qs = generateQuestions(t, n); if (!qs.length) return toast('No new questions could be made for this topic — try another');
    bank().push(...qs); qs.forEach(q => freshIds.add(q.id)); await save(); renderPlacement();
    $('#gTopic').value = t; toast(`✨ Added ${qs.length} new question${qs.length === 1 ? '' : 's'}`);
    const first = document.querySelector('.qrow.fresh'); if (first) first.scrollIntoView({block: 'center'});
  };
  const fT = $('#fTopic'); fT.onchange = () => { const l = fT.value === 'listen'; app.querySelector('.lrow').hidden = !l; $('#hearForm').hidden = !l; };
  $('#hearForm').onclick = () => { const v = $('#qForm').listen.value.trim(); if (v) say(v, null, 0.85); };
  $('#qForm').onsubmit = async ev => {
    ev.preventDefault();
    const d = Object.fromEntries(new FormData($('#qForm'))), o = [d.o0, d.o1, d.o2, d.o3].map(x => (x || '').trim()).filter(Boolean);
    const err = !d.q.trim() ? 'Write the question.' : !d.o0.trim() ? 'Write the correct answer.' : o.length < 3 ? 'Write the correct answer and at least 2 wrong answers.'
      : new Set(o.map(x => x.toLowerCase())).size !== o.length ? 'The answers must all be different.' : d.t === 'listen' && !d.listen.trim() ? 'Write what the student will hear.' : '';
    if (err) { $('#qerr').textContent = err; return; }
    const data = {t: d.t, q: d.q.trim(), o, tag: d.tag || undefined, pic: d.pic.trim() || undefined, listen: d.t === 'listen' ? d.listen.trim() : undefined};
    if (editQ) { const q = bank().find(x => x.id === editQ); Object.keys(data).forEach(k => data[k] === undefined ? delete q[k] : q[k] = data[k]); toast('Question saved'); }
    else { const q = Q(data.t, data.q, data.o); ['tag','pic','listen'].forEach(k => data[k] && (q[k] = data[k])); bank().push(q); freshIds.add(q.id); toast('Question added'); }
    editQ = null; await save(); renderPlacement();
  };
  if ($('#cancelEdit')) $('#cancelEdit').onclick = () => { editQ = null; renderPlacement(); };
  $('#resetBank').onclick = async () => { if (!confirm('Replace all questions with the default question set?')) return; state.placement.questions = defaultBank(); freshIds.clear(); await save(); renderPlacement(); toast('Default questions restored'); };
  app.querySelectorAll('[data-hq]').forEach(b => b.onclick = () => say(bank().find(q => q.id === b.dataset.hq).listen, null, 0.85));
  app.querySelectorAll('[data-eq]').forEach(b => b.onclick = () => { editQ = b.dataset.eq; renderPlacement(); $('#qForm').scrollIntoView({block: 'center'}); });
  app.querySelectorAll('[data-dq]').forEach(b => b.onclick = async () => { const q = bank().find(x => x.id === b.dataset.dq);
    if (q.t === 'listen' && bank().filter(x => x.t === 'listen').length <= LISTEN_MIN && !confirm(`The test needs at least ${LISTEN_MIN} listening questions. Delete anyway?`)) return;
    state.placement.questions = bank().filter(x => x.id !== q.id); if (editQ === q.id) editQ = null; await save(); renderPlacement(); });
}

/* ---- teacher: results ---- */
let viewRes = null;
function ptResults() {
  if (viewRes) { const r = results.find(x => x.id === viewRes); if (r) return `<div class="row no-print" style="margin-bottom:12px"><button class="btn ghost sm" id="backRes">← All results</button><button class="btn ghost sm" id="printRes">🖨 Print / save as PDF</button></div>` + ptResultHTML(r, false); viewRes = null; }
  return `<div class="panel">
    <div class="row" style="justify-content:space-between"><h2 class="sec-t">📊 Test results</h2>
      <div class="row"><button class="btn sun sm" id="csvBtn" ${results.length ? '' : 'disabled'}>⬇ Download Excel (CSV)</button><button class="btn ghost sm" id="clearRes" ${results.length ? '' : 'disabled'}>🗑 Clear all</button></div></div>
    <p class="hint">Results of tests taken on this device. Results are never included in exported course files.</p>
    ${!results.length ? `<div class="empty"><div class="e">📭</div>No results yet.</div>` : `<div class="tablewrap"><table class="rtable">
      <thead><tr><th>Student</th><th>Class</th><th>Phone</th><th>Date</th><th>Score</th><th>Level</th><th></th></tr></thead>
      <tbody>${results.map(r => { const L = LV(r.level); return `<tr>
        <td><b>${esc(r.name)}</b></td><td>${esc(r.cls)}</td><td>${esc(r.phone)}</td><td>${new Date(r.date).toLocaleDateString()}</td>
        <td><b>${r.pct}%</b> <span class="lbl">(${r.score}/${r.total})</span></td><td><span class="lvpill" style="background:${L.color}">${L.name}</span></td>
        <td class="nowrap"><button class="btn sm ghost" data-vr="${r.id}">View</button> <button class="btn sm ghost" data-dr="${r.id}">🗑</button></td></tr>`; }).join('')}</tbody></table></div>`}
  </div>`;
}
function bindResults() {
  if ($('#backRes')) { $('#backRes').onclick = () => { viewRes = null; renderPlacement(); }; $('#printRes').onclick = () => window.print(); return; }
  app.querySelectorAll('[data-vr]').forEach(b => b.onclick = () => { viewRes = b.dataset.vr; renderPlacement(); window.scrollTo(0, 0); });
  app.querySelectorAll('[data-dr]').forEach(b => b.onclick = async () => { if (!confirm('Delete this result?')) return; results = results.filter(r => r.id !== b.dataset.dr); await saveResults(); renderPlacement(); });
  if ($('#clearRes')) $('#clearRes').onclick = async () => { if (!confirm('Delete ALL results on this device?')) return; results = []; await saveResults(); renderPlacement(); };
  if ($('#csvBtn')) $('#csvBtn').onclick = () => {
    const c = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = ['Name','Class','Phone','Date','Score','Total','Percent','Level','Time taken','Not answered', ...TOPICS.map(t => t.name)];
    const rows = results.map(r => [r.name, r.cls, r.phone, new Date(r.date).toLocaleString(), r.score, r.total, r.pct + '%', LV(r.level).name,
      r.time !== undefined ? fmtDur(r.time) : '', r.unanswered ?? '',
      ...TOPICS.map(t => r.topics[t.id] ? `${r.topics[t.id][0]}/${r.topics[t.id][1]}` : '')]);
    const csv = '﻿' + [head, ...rows].map(row => row.map(c).join(',')).join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8'}));
    a.download = `placement-results-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(a); a.click(); a.remove();
  };
}

