/* ================= basics ================= */
const $ = s => document.querySelector(s);
const app = $('#app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600); }
const fmt = t => { t = +t || 0; return Math.floor(t / 60) + ':' + (t % 60).toFixed(1).padStart(4, '0'); };

const LEVELS = [
  {id:'f1', name:'Foundation 1', tag:'Starter',            icon:'🌱', color:'#2ec4b6', desc:'First words, letters, numbers & greetings'},
  {id:'f2', name:'Foundation 2', tag:'Starter+',           icon:'🌿', color:'#06b67a', desc:'Colours, animals, family & simple sentences'},
  {id:'a1', name:'Level A1',     tag:'Beginner',           icon:'🚀', color:'#3fa9f5', desc:'Daily routines, likes, simple questions'},
  {id:'a2', name:'Level A2',     tag:'Elementary',         icon:'🧭', color:'#4361ee', desc:'Past events, travel, shopping & plans'},
  {id:'b1', name:'Level B1',     tag:'Intermediate',       icon:'🌍', color:'#7b61ff', desc:'Opinions, feelings, stories & experiences'},
  {id:'b2', name:'Level B2',     tag:'Upper-Intermediate', icon:'🏆', color:'#ff6b6b', desc:'Work, debate, fluent natural conversation'},
];
const LV = id => LEVELS.find(l => l.id === id);

/* ================= storage (IndexedDB, with in-memory fallback) ================= */
const mem = {kv:{}, media:{}};
const DB = {
  db: null,
  open() { return new Promise(res => { try { const r = indexedDB.open('doitenglish', 1);
    r.onupgradeneeded = () => { r.result.createObjectStore('kv'); r.result.createObjectStore('media'); };
    r.onsuccess = () => { this.db = r.result; res(); }; r.onerror = () => res(); } catch (e) { res(); } }); },
  get(store, key) { if (!this.db) return Promise.resolve(mem[store][key]);
    return new Promise(res => { try { const q = this.db.transaction(store).objectStore(store).get(key); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); } catch (e) { res(undefined); } }); },
  put(store, key, val) { if (!this.db) { mem[store][key] = val; return Promise.resolve(); }
    return new Promise(res => { try { const tx = this.db.transaction(store, 'readwrite'); tx.objectStore(store).put(val, key); tx.oncomplete = () => res(); tx.onerror = () => res(); } catch (e) { mem[store][key] = val; res(); } }); },
};
const urlCache = {};
async function storeMedia(blob) { const id = 'm_' + uid(); await DB.put('media', id, blob); urlCache[id] = URL.createObjectURL(blob); return id; }
async function loadMedia(id) { if (!id || urlCache[id]) return; const b = await DB.get('media', id); if (b) urlCache[id] = URL.createObjectURL(b); }
let state;
const save = () => DB.put('kv', 'state', state);

/* ================= sample content ================= */
const SEED = {
  f1:{title:'Fruits I Like', items:[['apple','🍎','This is an apple.'],['banana','🍌','I like bananas.'],['grapes','🍇','Grapes are purple.'],['orange','🍊','The orange is sweet.']],
      speak:['apple','banana','I like bananas.','Hello, my name is Sam.']},
  f2:{title:'Animals Around Us', items:[['cat','🐱','The cat is sleeping.'],['dog','🐶','My dog is friendly.'],['bird','🐦','The bird can fly.'],['fish','🐟','The fish is in the water.']]},
  a1:{title:'My Daily Routine', items:[['wake up','⏰','I wake up at seven o\'clock.'],['brush my teeth','🦷','I brush my teeth every morning.'],['have breakfast','🍳','I have breakfast with my family.'],['go to school','🏫','I go to school by bus.']]},
  a2:{title:'Going on a Trip', items:[['airport','✈️','We arrived at the airport early.'],['hotel','🏨','The hotel was near the beach.'],['ticket','🎫','I bought a return ticket.'],['passport','🛂','Don\'t forget your passport!']]},
  b1:{title:'Talking About Feelings', items:[['excited','🤩','I\'m really excited about the trip.'],['worried','😟','She was worried about the exam.'],['surprised','😲','We were surprised by the news.'],['exhausted','😩','I\'m exhausted after a long day.']]},
  b2:{title:'At Work', items:[['job interview','🤝','I\'ve got a job interview tomorrow.'],['deadline','⏳','We need to meet the deadline by Friday.'],['promotion','📈','She was offered a promotion last month.'],['presentation','📊','I\'ll give a presentation to the board.']]},
};
function newLesson(title, s) {
  s = s || {items:[]};
  return { id: uid(), title, video: null, audio: null,
    phrases: s.items.map((it, i) => ({id: uid(), text: it[2], img: {e: it[1]}, time: i * 3})),
    matching: s.items.map(it => ({id: uid(), word: it[0], img: {e: it[1]}})),
    speaking: (s.speak || s.items.map(i => i[2])).map(t => ({id: uid(), text: t})) };
}
// Lessons added to the default course after version 1. Default lessons are copied into each device once, so bump LESSON_V when
// you add one here (with {v: N} and a fixed id, the same on every device): upgradeLessons() gives it to devices that already have a course.
const LESSON_V = 3;
const SEED_MORE = [
  {v:2, level:'a1', id:'a1-after-school', title:'After School', items:[['have lunch','🍽️','I have lunch at one o\'clock.'],['do my homework','📝','I do my homework in the afternoon.'],['play football','⚽','I play football with my friends.'],['go to bed','🛏️','I go to bed at nine o\'clock.']]},
  {v:2, level:'a1', id:'a1-things-i-like', title:'Things I Like', items:[['reading','📖','I like reading books.'],['swimming','🏊','My sister likes swimming.'],['pizza','🍕','Do you like pizza? Yes, I do.'],['spiders','🕷️','I don\'t like spiders.']]},
  {v:3, level:'a2', id:'a2-at-the-shops', title:'At the Shops', items:[['trainers','👟','How much are these trainers?'],['cash','💷','Can I pay in cash, please?'],['receipt','🧾','I kept the receipt in my bag.'],['shopping bags','🛍️','She carried two heavy shopping bags.']]},
  {v:3, level:'a2', id:'a2-weekend-plans', title:'Weekend Plans', items:[['cinema','🎬','We\'re going to the cinema on Saturday.'],['picnic','🧺','We\'re going to have a picnic in the park.'],['visit my grandparents','👵','I\'m going to visit my grandparents next week.'],['stay at home','🏠','I think I\'ll stay at home on Sunday.']]},
];
function seedLesson(m) { const s = newLesson(m.title, m); s.id = m.id; return s; }
function seedState() {
  const st = {levels: {}, lessonsV: LESSON_V};
  LEVELS.forEach(l => st.levels[l.id] = {lessons: [newLesson(SEED[l.id].title, SEED[l.id]), ...SEED_MORE.filter(m => m.level === l.id).map(seedLesson)]});
  return st;
}
// A new default lesson is added only where the level still has its first default lesson (so a teacher who replaced the default
// course with their own lessons is left alone) and no lesson with that id or title is there yet.
function upgradeLessons() {
  const v = state.lessonsV || 1; if (v >= LESSON_V) return false;
  SEED_MORE.filter(m => m.v > v).forEach(m => { const ls = state.levels[m.level].lessons;
    if (ls.some(s => s.title === SEED[m.level].title) && !ls.some(s => s.id === m.id || s.title === m.title)) ls.push(seedLesson(m)); });
  state.lessonsV = LESSON_V; return true;
}

