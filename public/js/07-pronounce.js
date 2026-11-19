/* ================= PRONOUNCE ================= */
const PRON_N = 15;   // words in each pronunciation test
// Words from the teacher's file "النطق.docx", one section per letter, grouped by sound / spelling rule.
const PRON_DEFAULT = [
 ['A', [
  ['aw / war', '', 'law, saw, dawn, dwarf, reward, warm, warn, water'],
  ['au / augh / ough', '', 'caution, taught, August, author, cause, pause, laundry, bought'],
  ['ay', '', 'bay, day, say, pay, hay, may, ray, way, clay, play, spray, sway, tray, stay'],
  ['ai', '', 'rain, nail, tail, wait, sail, mail, fail, jail, rail, pain, gain, main, paid, laid, raid, chain, brain, drain, grain, train, faint, pail, saint'],
  ['a_e (magic e)', '', 'game, cake, name, lake, fake, sake, bake, wave, gate, cave, skate, same, lane, late, wake, safe, grapes, race, came, rate, fade, shape, brave, shave, place, shake, shade'],
  ['short a', '', 'can, man, pan, pat, mat, tap, cat, fat, hat, rat, sat, van, mass'],
  ['ar / long a', '', 'palm, calm, cart, smart, start, jar, arm, pass, class, glass, grass'],
  ['a at the start (ə)', '', 'above, across, ago, around, acquire'],
 ]],
 ['B', [
  ['silent b before t', '', 'debt, doubt, subtle'],
  ['silent b after m', '', 'comb, lamb, tomb, climb, limb, crumb, dumb, thumb'],
 ]],
 ['C', [
  ['ci / ce = sh', '', 'special, electrician, official, social, artificial, financial, crucial, beneficial, politician, magician, technician, optician, appreciate, associate, physician, conscience, ancient, species, science, unconscious, delicious, precious, vicious, suspicious, gracious, ocean'],
  ['ch = sh', 'أغلب الكلمات المتعلقة بالطعام والموضة', 'chef, machine, chauffeur, chandelier, brochure, mustache'],
  ['ch = k', 'في الكلمات ذات الأصل الإغريقي مثل الكلمات الطبية والعلمية والفنية والمتعلقة بالسلطة والجسم تنطق CH مثل K', 'chorus, chaos, character, chemistry, chord, chrome, echo, anchor, stomach, monarch, archive, scheme'],
  ['ch = tʃ', '', 'child, much, church, choice, chicken, March, chair, chat, match, teacher, each, reach, which, rich, such'],
  ['soft c (s)', '', 'city, bicycle, face, mice, rice, place'],
  ['hard c (k)', '', 'picnic, cat, cold, cry'],
  ['ck', '', 'back, pack, neck, lick, black, rock, luck, block'],
 ]],
 ['D', [
  ['d', '', 'dog, door, dream, drum, dinner, dark, duck, desk, ladder, garden, candy, spider, under, window, hidden, body, shadow, bed, red, hand, wind, cold, food, bird, cloud, proud, friend, drive'],
  ['silent d', '', 'Wednesday, handsome, sandwich, grandmother'],
  ['dge', '', 'bridge, edge, badge, judge'],
 ]],
 ['E', [
  ['short e', '', 'pet, hen, red, rest, get, vet, less, mess, bless, chess, dress, led, fed'],
  ['silent e at the end', '', 'place, date, hate, slide, drive, smile'],
  ['long e (e_e)', '', 'evening, even, fever, theme, scene, compete, extreme, concrete, delete, these, here, gene, sincere'],
  ['ee', '', 'see, tree, three, bee, feet, seed, jeep, free, meet, teeth, beef, keep, peel, feel, cheese, teen'],
  ['ei = ee', '', 'ceiling, receipt, receive, deceive, conceive, seize, protein'],
  ['ea', '', 'eat, each, pea, sea, tea, beak, leave, beam, bean, beat, deal, heal, heap, heat, lead, leaf, leak, meal, meat, neat, peak, read, seat, weak, cheat'],
  ['e at the end of short words', '', 'be, he, we, me, the'],
  ['ei / eigh', '', 'eight, weight, vein, beige, height, either, neither'],
 ]],
 ['F', [
  ['f at the start', '', 'fan, fish, five, flag, flower, fox, frozen, family, Friday, forest'],
  ['f in the middle', '', 'after, office, coffee, giraffe, muffin, safety, effort, traffic'],
  ['f at the end', '', 'leaf, roof, stiff, cliff, self, half, golf, scarf, brief'],
 ]],
 ['G', [
  ['silent gh', 'لا تنطق gh إذا سبقها الأحرف i – ou – au', 'sigh, right, high, light, night, bright, through, bought, thought, caught, daughter'],
  ['silent g (gn)', '', 'sign, design, foreign, campaign, resign, assign, reign'],
  ['g at the end', 'إذا جاءت في نهاية الكلمة لا يتبعها شيء', 'egg, leg, good, girl, glass, beginning, bag, dog, pig, big, fog, log'],
  ['g + consonant', 'G إذا تبعها أي حرف ساكن ما عدا H', 'glass, glad, glue, grass, grapes, green, ground'],
  ['hard g (g + a, o, u)', 'G إذا تبعها A, O, or U تنطق مثل الجيم المصرية', 'game, gate, gap, garden, go, goat, gold, got, golf, gum, guy, guitar, guest, guilt'],
  ['soft g (g + e, i, y)', 'إذا تبعها E – Y – I تنطق ثقيلة', 'giant, gym, biology, geology, gently, age, large, village, huge, bridge, generally'],
  ['gh = f', 'يلفظان (ف)', 'enough, cough, rough, laugh, laughter, tough'],
 ]],
 ['H', [
  ['h in the middle', '', 'behave, behind, anyhow, ahead, unhappy, perhaps'],
  ['h at the start', '', 'hat, hen, hello, hippo, help, house, hammer, horse, happy, hundred'],
  ['ph = f', '', 'phone, photo, phrase, physics, phobia, pharmacy'],
  ['gh / ph at the end = f', '', 'laugh, graph, morph, enough, cough, tough, epigraph, telegraph, paragraph'],
  ['silent h', '', 'hour, honest, honour, heir, ghost'],
  ['silent h at the end', '', 'oh, cheetah, pharaoh, savannah'],
  ['silent gh', '', 'though, through, high, dough'],
 ]],
 ['I', [
  ['ie = long i', '', 'pie, tie, lie, die'],
  ['i_e (magic e)', '', 'kite, pine, ripe, fine, lime, bike, time, hike, five, nine, dive, line, mine, ride, side, file, mile, while, ice, rice, mice, size, life, site, spider, item, idea, cried, lied, fried'],
  ['igh', '', 'light, night, high, right, fight, bright, might, fright, sigh, sight, tight, flight, delight, slight, tonight'],
  ['short i', '', 'pit, sit, with, this, wink'],
  ['ie = ee', '', 'chief, thief, piece, niece, field'],
  ['cient = shənt', '', 'patient, efficient, ancient, proficient, deficient, sufficient'],
 ]],
 ['J', [
  ['j at the start', '', 'jump, just, jacket, joy, journey, judge, jungle, joke, justice'],
  ['j in the middle', '', 'enjoy, adjust, project, injure, subject, reject, eject, majestic, injection, object'],
 ]],
 ['K', [
  ['k at the start', '', 'kangaroo, key, kite, king, kitchen, kind, keep, kettle, keyboard, kidney'],
  ['k at the end', '', 'book, milk, pink, bank, desk, fork'],
  ['silent k (kn)', '', 'knife, know, knee, kneel, knock'],
  ['k in the middle', '', 'market, basket, monkey, blanket, turkey, bakery, skating, broken, worker, ticket'],
  ['ck', '', 'back, neck, sick, rock, luck'],
 ]],
 ['L', [
  ['silent l', '', 'talk, walk, half, calf, salmon, could, should, would, palm, calm, balm, yolk'],
  ['l at the start', '', 'lamp, lemon, leaf, listen, lovely, luck, letter, lizard, lunch, library'],
  ['l in the middle', '', 'balloon, helmet, pillow, yellow, dollar, valley, holiday, elbow, colour'],
  ['l at the end', '', 'bell, school, tail, pool, shell, wheel, until, pearl, bowl, evil'],
 ]],
 ['M', [
  ['m at the start', '', 'moon, magic, mouth, music, melt, mouse, mirror, market, monkey, mountain, middle'],
  ['m in the middle', '', 'hammer, summer, camel, lump, famous, amazing, number, time, promise'],
  ['m at the end', '', 'bottom, arm, room, storm, cream, swim, team, drum, calm, form, scream'],
  ['mn (silent n)', '', 'autumn, column, hymn'],
  ['mb (silent b)', '', 'lamb, comb, thumb, climb, bomb, dumb'],
 ]],
 ['N', [
  ['silent n (mn)', '', 'autumn, column, hymn'],
  ['n in the middle', '', 'dinner, pencil, window, animal, planet, under, monster, sunny, candy, finish'],
  ['n at the start', '', 'net, nose, night, number, never, noise, neck, nearly, nature'],
  ['n at the end', '', 'sun, pen, moon, rain, green, train, spoon, clean, ocean, learn'],
  ['kn (silent k)', '', 'knife, knee, know'],
 ]],
 ['O', [
  ['ow = long o', '', 'elbow, window, tow, slow, grow, flow, blow, throw, yellow, show, arrow, bow, row, pillow, snow'],
  ['o_e (magic e)', '', 'cone, pole, hole, role, hose, pose, poke, hope, joke, woke, rose, home, dome, vote, note, broke, slope, alone, smoke, drone, bone, rope, robe, mode, sole, close, phone'],
  ['open o', '', 'go, so, no, pony, donut, focus, total, piano'],
  ['oy', '', 'boy, joy, soy, toy, annoy, enjoy, loyal, royal, oyster, destroy, voyage'],
  ['short o', '', 'lot, cot, dot, pot, on'],
  ['ow = aw', '', 'cow, how, vow, brow, plow, allow, wow, pow, brown, crown, down'],
  ['oa', '', 'boat, coat, soap, road, coal, goat, goal, float, toast, roast, coast, coastal, load'],
  ['ou', '', 'out, loud, count, house, mouse, blouse, found, round, sound, about, shout, proud, ground, bound'],
  ['ower', '', 'power, flower, tower, shower'],
  ['oi', '', 'oil, boil, coil, foil, coin, join, oink, point, joint, voice, noise, choice, avoid, spoil, moist'],
  ['long oo', '', 'moon, zoo, food, boot, mood, zoom, shoot'],
  ['short oo', '', 'foot, cook, look, book, hook, took, wool'],
 ]],
 ['P', [
  ['p at the start', '', 'pen, park, plate, purple, pocket, panda, pizza, planet, puppy, present'],
  ['p in the middle', '', 'apple, happy, supper, helper, open, topic, captain, paper, airport'],
  ['ph = f', '', 'phone, photo, alphabet, phantom, pharmacy, paragraph, graphics'],
  ['silent p (ps)', '', 'psychology, psychic, pseudo'],
  ['p at the end', '', 'cup, stop, help, sleep, jump, clip, map, ship, lamp, soup'],
  ['silent p', '', 'receipt, raspberry, pneumonia'],
 ]],
 ['Q', [
  ['qu at the start', '', 'queen, quiet, quick, question, quarter'],
  ['qu in the middle / end', '', 'equal, liquid, square, request, antique, unique, cheque, banquet'],
 ]],
 ['R', [
  ['r at the start', '', 'red, rain, rabbit, road, river, rule, right, rocket, ring, radio'],
  ['r between vowels', '', 'orange, very, mirror, parent, around'],
  ['r after a vowel', '', 'dark, bird, fork, party, market, car, star, door, flower, tiger, sugar, paper, chair, near, water'],
 ]],
 ['S', [
  ['s at the start', '', 'sun, snake, sleep, small, story, spring, seven, silver, stamp, space'],
  ['sion / ssion = shən', '', 'extension, tension, mission, passion, session, discussion, expression, permission, expansion, diversion'],
  ['sion = ʒən', '', 'television, decision, explosion, confusion, invasion'],
  ['s in the middle', '', 'basket, sister, listen, inside, music, visit, present, desert, season, reason'],
  ['s at the end = s', '', 'bus, glass, less, cats'],
  ['s at the end = z', '', 'dogs, trees, is, was, has, lens'],
  ['silent s', '', 'island, isle, aisle, debris'],
 ]],
 ['T', [
  ['t at the start', '', 'table, tiger, ten, ticket, toast, tomato, turtle, team, time, Tuesday'],
  ['tu = tʃ', 'إذا جاء حرف (t) يليه حرف (u) وبعده re أو al فإنهما غالباً يلفظان (تْشْ)', 'future, adventure, nature, picture, culture, feature, furniture, structure, mixture, signature, actual, punctual, virtual, mutual, intellectual, statue, fortune, virtue'],
  ['th = ð between vowels', 'تنطق (ذ) إذا جاء قبلها وبعدها حرف علة', 'father, weather, feather, leather, another, breathe, clothe, bathe'],
  ['silent t (sten / stle)', 'عند اجتماع sten أو stle لا يتم نطق t', 'listen, fasten, castle, whistle, often, Christmas'],
  ['t in the middle', '', 'butter, letter, doctor, after, mountain, bottle, sister, between, hotel, button'],
  ['th = θ at the end', 'عندما تأتي (th) في نهاية الكلمة ولا يتبعها شيء تنطق (ث)', 'bath, tooth, cloth, mouth, math'],
  ['t at the end', '', 'cat, hot, fast, night, boat, soft, plant, weight, last, start'],
  ['tion / tian = shən', 'التراكيب (tion) / (tian) / (cian) / (ssion) تنطق "شن"', 'station, information, nation, emotion, Egyptian, Italian'],
  ['th = ð (function words)', 'تنطق (ذ) إذا جاء بعدها حرف علة – الكلمات الوظيفية في اللغة', 'the, they, then, than, their, though, with'],
  ['th = θ (numbers)', 'تنطق (ث) مع الأرقام', 'three, third, thirteen, thirty, fourth, fifth'],
 ]],
 ['U', [
  ['u_e = long u', '', 'cube, mute, cute, mule, tube, use, duke, fume, fuse, huge, amuse, excuse, refuse, tune, Tuesday, duty, due, suit'],
  ['short u', '', 'fun, bun, gun, run, sun, cut, but, rush, up, mud, bus, shut'],
  ['ue / u = oo', '', 'blue, glue, clue, June, rule, truth, true, tissue'],
  ['s between vowels = ʒ', 'إذا وقعت S بين حرفي علة تنطق (ج) – خارج القاعدة: assume, suit', 'pleasure, measure, treasure, leisure, usual, assume'],
  ['su = sh', 'إذا جاء حرف (s) يليه حرف (u) فإنهما يلفظان (ش) أو (ج)', 'sugar, sure, pressure, issue, tissue'],
 ]],
 ['V', [
  ['v at the start', '', 'van, vet, vase, voice, visit, video, very, volcano'],
  ['v in the middle', '', 'seven, river, every, haven, travel, clever, oven, driver, never'],
  ['ve at the end', '', 'have, give, live, move, love, above, wave, grave, believe, twelve'],
 ]],
 ['W', [
  ['silent w (wr)', 'إذا جاء حرف (w) يليه حرف (r) فإن حرف (w) لا يلفظ', 'write, wrong, wrap, wrist, wrench'],
  ['wh / w', '', 'what, when, where, why, which, whale, while, white, war, will, would'],
  ['silent w', '', 'who, whom, whose, whole, two, answer'],
  ['ow', '', 'cow, now, town, how'],
  ['aw', '', 'law, saw, draw'],
  ['ew', '', 'few, new, dew'],
 ]],
 ['X', [
  ['x = z at the start', '', 'xenon, Xerox'],
  ['x in the middle', '', 'taxi, exercise, boxer, oxygen, example, exit, examine, maximum, relaxing, sixty, fixing'],
  ['x at the end', '', 'box, six, fox, mix, tax, relax, wax, flex, index, complex'],
  ['x = kʃ', '', 'anxious, luxury'],
 ]],
 ['Y', [
  ['y = i', '', 'gym, myth, system, cycle, type, crystal, lyric, pyramid, style'],
  ['y at the start', '', 'yes, yet, yellow, yard, young, yawn, yesterday'],
  ['y at the end', '', 'happy, sky, fly, party, July, lady, why, sunny, try, only'],
 ]],
 ['Z', [
  ['z at the start', '', 'zoo, zebra, zero, zone, zinc, zigzag, zoom'],
  ['z in the middle / end', '', 'puzzle, hazard, wizard, frozen, lizard, dizzy, freeze, quiz, maze, gaze, prize, size, blaze'],
 ]],
];
function defaultPron() { return PRON_DEFAULT.map(([id, gs]) => ({id, groups: gs.map(([title, note, w]) => ({id: uid(), title, note, words: w.split(',').map(s => s.trim()).filter(Boolean)}))})); }

// Words that sound the same: speech recognition may write any of them, so they all count as correct.
const HOMO = 'pail:pale|tail:tale|sail:sale|mail:male|rain:reign:rein|main:mane|pain:pane|way:weigh:whey|hay:hey|ray:rey|sea:see|tea:tee|pea:pee|bee:be|we:wee|meat:meet|read:reed:red|lead:led|peak:peek:pique|leak:leek|heal:heel|beat:beet|weak:week|seize:seas:sees|scene:seen|gene:jean|here:hear|flower:flour|hour:our|heir:air|night:knight|right:write:rite|sight:site:cite|die:dye|lie:lye|tie:thai|high:hi|eight:ate|weight:wait|aisle:isle|hole:whole|role:roll|sole:soul|rose:rows|so:sew:sow|no:know|new:knew:gnu|dew:due:do|two:to:too|whose:whos|which:witch|whale:wail|while:wile|war:wore|would:wood|cheque:check|tow:toe|row:roe|bow:bough:bo|mode:mowed|vein:vain:vane|pause:paws|dawn:don|dough:doe|though:tho|through:threw:thru|mustache:moustache|colour:color|honour:honor|fourth:forth|pie:pi|side:sighed|size:sighs|sigh:psi|might:mite|slight:sleight|time:thyme|key:quay|kneel:neil|bell:belle|pearl:purl|nose:knows|flow:floe|throw:throe|pole:poll|road:rode:rowed|boy:buoy|coal:cole|load:lode|ring:wring|sun:son|math:maths|their:there:theyre|but:butt|blue:blew|where:wear:ware|weather:whether|wrap:rap|oh:o:owe|maze:maize|freeze:frees:frieze|zinc:zink|tax:tacks|wax:whacks|guest:guessed|guilt:gilt|sign:sine|chord:cord|yolk:yoke|climb:clime|lamb:lam|hymn:him|peel:peal|feet:feat|seed:cede|piece:peace|bean:been|knot:not|plow:plough|cue:queue|gym:jim|xerox:zerox';
const HOMO_MAP = {};
HOMO.split('|').forEach(g => { const ws = g.split(':'); ws.forEach(w => { HOMO_MAP[w] = (HOMO_MAP[w] || []).concat(ws.filter(x => x !== w)); }); });
const NUMW = {two:'2',three:'3',five:'5',six:'6',seven:'7',eight:'8',nine:'9',ten:'10',twelve:'12',thirteen:'13',thirty:'30',sixty:'60',third:'3rd',fourth:'4th',fifth:'5th',zero:'0'};
const pkey = s => norm(s).replace(/'/g, '');
function acceptSet(word) { const t = pkey(word), s = new Set([t]); (HOMO_MAP[t] || []).forEach(x => s.add(x)); if (NUMW[t]) s.add(NUMW[t]); return s; }
function scoreWord(word, alts) {
  const ok = acceptSet(word), tn = pkey(word); let best = {score: 0, heard: alts[0] || ''};
  for (const a of alts) {
    const toks = pkey(a).split(' ').filter(Boolean), whole = toks.join(' ');
    if (ok.has(whole) || toks.some(t => ok.has(t))) return {score: 100, heard: a};
    for (const t of [whole, ...toks]) { const s = 1 - lev(tn, t) / Math.max(tn.length, t.length, 1), sc = Math.round(Math.max(0, s) * 60); if (sc > best.score) best = {score: sc, heard: a}; }
  }
  return best;
}
/* ---------- the speech service (the one the voice level test uses) for the pronunciation test ---------- */
// When the server says it is on (vtSpeechOn() in 10b-voice-test.js: GET /api/voice → speech, and the student is registered), each word is
// recorded as WAV and scored by the service ({action: 'word'}); otherwise, or when the service refuses, the browser's own recognition is used.
const PRON_HARD = ['student limit', 'daily limit', 'no speech', 'not registered', 'speech key', 'speech limit', 'server not configured'];   // answers that will not change today
const PRON_WHY = {'student limit': 'you have reached today\'s limit', 'daily limit': 'the class has reached today\'s limit', offline: 'the server could not be reached'};
let pronNoSvc = false, pronFails = 0, prRec = null;   // pronNoSvc: use the browser's recognition for the rest of this visit
const pronSvc = () => !pronNoSvc && typeof vtSpeechOn === 'function' && vtSpeechOn() && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
function prClean(r) {
  clearInterval(r.timer);
  try { r.proc && (r.proc.onaudioprocess = null, r.proc.disconnect()); } catch (e) {}
  try { r.stream.getTracks().forEach(t => t.stop()); } catch (e) {} try { r.ac && r.ac.close(); } catch (e) {}
}
function prAbort() { const r = prRec; if (!r) return; prRec = null; prClean(r); r.res(null); }
// Records one word. Stops by itself about a second after the student stops speaking, after 5 s of silence or after 6 s; r.stop() stops it now.
// Gives {wav, peak} (peak = the loudest moment, to tell silence from speech), or null when the page was left.
function prRecord(stream) {
  return new Promise(res => {
    const r = prRec = {stream, res, chunks: [], rate: 48000, rms: 0, peak: 0, ref: 0.02, first: null, quiet: 0, t0: performance.now()};
    try {
      const AC = window.AudioContext || window.webkitAudioContext; r.ac = new AC(); r.rate = r.ac.sampleRate;
      const src = r.ac.createMediaStreamSource(stream), mute = r.ac.createGain(); mute.gain.value = 0;
      r.proc = r.ac.createScriptProcessor(4096, 1, 1);
      r.proc.onaudioprocess = e => { const d = e.inputBuffer.getChannelData(0); r.chunks.push(new Float32Array(d)); let s = 0; for (let i = 0; i < d.length; i++) s += d[i] * d[i]; r.rms = Math.sqrt(s / d.length); r.peak = Math.max(r.peak, r.rms); };
      src.connect(r.proc); r.proc.connect(mute); mute.connect(r.ac.destination);
    } catch (e) { prRec = null; prClean(r); return res({wav: null, peak: 0}); }
    r.stop = () => { if (prRec !== r) return; prRec = null; prClean(r); res({wav: r.chunks.length ? vtWav(r.chunks, r.rate) : null, peak: r.peak}); };
    r.timer = setInterval(() => {
      const el = (performance.now() - r.t0) / 1000; r.ref = Math.max(0.02, r.ref * 0.997, r.rms);
      if (r.rms > Math.max(0.012, r.ref * 0.15)) { if (r.first === null) r.first = el; r.quiet = 0; } else if (r.first !== null) r.quiet += 0.1;
      if ((r.first !== null && r.quiet >= 0.9 && el >= 1.2) || el >= (r.first === null ? 5 : 6)) r.stop();
    }, 100);
  });
}
// The service's answer for one word → {score, heard}. A different word (the service marks ours as left out) can get 60% at most, by how close it is.
function pronSvcScore(word, d) {
  const ws = (d.words || []).filter(x => x.err !== 'Insertion'), s = d.scores || {}, heard = String(d.heard || '').replace(/[.?!]+$/, '');
  let score = s.accuracy != null ? s.accuracy : s.pron != null ? s.pron : 0;
  if (ws.length && ws.every(x => x.err === 'Omission')) score = Math.min(60, scoreWord(word, [heard]).score);
  return {score: Math.max(0, Math.min(100, Math.round(score))), heard};
}
// The small line under the test that says which check is in use.
function pronHow() {
  const el = $('#pHow'); if (!el) return;
  el.innerHTML = pronSvc() ? '✓ Full pronunciation check'
    : typeof vtCaps !== 'undefined' && vtCaps && vtCaps.speech && !pronNoSvc && !vtRegistered() ? 'Basic check · <a href="#/progress">Save your name on “My progress”</a> for the full pronunciation check' : '';
  const st = $('#pStat'); if (st && st.dataset.no && pronSvc()) { st.textContent = 'Press the microphone and say the word'; delete st.dataset.no; }
}

const pcol = p => p >= 90 ? '#1b9e5a' : p >= 60 ? '#f0a500' : '#e63946';
const pword = p => p >= 90 ? 'Excellent pronunciation! 🌟' : p >= 60 ? 'Good — keep practising! 👍' : 'Needs more practice 💪';
function scaleHTML(p, label, big) {
  const has = p !== null && p !== undefined;
  return `<div class="pscale ${big ? 'big' : ''}">
    <div class="psh"><span>${label}</span><b style="color:${has ? pcol(p) : 'var(--muted)'}">${has ? p + '%' : '—'}</b></div>
    <div class="pbar3"><span class="z r"></span><span class="z y"></span><span class="z g"></span>
      ${has ? `<i class="pfill" style="width:${p}%;background:${pcol(p)}"></i><i class="pmark" style="left:${p}%;border-color:${pcol(p)}"></i>` : ''}</div>
    <div class="pticks"><span style="left:0">0</span><span style="left:60%">60</span><span style="left:90%">90</span><span style="left:100%">100</span></div>
  </div>`;
}

let pronBest = {}, PR = {}, pronSlow = false;
const pronSecs = () => state.pron.sections;
const secWords = sec => [...new Map(sec.groups.flatMap(g => g.words).map(w => [w.toLowerCase(), w])).values()];
const pronHeard = {};   // letter -> Set of words listened to; kept on the device (IndexedDB 'pronHeard': {letter: [words]}) so a reload does not lose them
const saveHeard = () => DB.put('kv', 'pronHeard', Object.fromEntries(Object.entries(pronHeard).filter(([, v]) => v.size).map(([k, v]) => [k, [...v]])));
function loadHeard(o) { if (o && typeof o === 'object') for (const k in o) if (Array.isArray(o[k])) pronHeard[k] = new Set(o[k].map(String)); }
// Back to the letter's own page from its test or result (same address, so the router does not see a change).
function pronLeave() {
  if (PR.mode === 'test' && PR.scores && PR.scores.length && !confirm('Leave the test? Your answers so far will not be saved.')) return;
  stopAll(); PR = {sec: PR.sec, mode: 'listen'}; renderPron(PR.sec); window.scrollTo(0, 0);
}
app.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href]'); if (!a || !PR.sec || (PR.mode !== 'test' && PR.mode !== 'done')) return;
  if (a.getAttribute('href') === '#/pronounce/' + PR.sec && location.hash === '#/pronounce/' + PR.sec) { e.preventDefault(); pronLeave(); }
});

function renderPron(id, arrived) {   // arrived: the student came here from another page (not a redraw of this one)
  if (!id) return renderPronIndex();
  const sec = pronSecs().find(s => s.id === id); if (!sec) return go('#/pronounce');
  if (PR.sec !== id || (arrived && PR.mode === 'done')) PR = {sec: id, mode: 'listen'};   // an old result is not shown again; an unfinished test goes on
  pronHeard[id] = pronHeard[id] || new Set();
  if (PR.mode === 'test') return renderPronTest(sec);
  if (PR.mode === 'done') return renderPronDone(sec);
  renderPronListen(sec);
}
function renderPronIndex() {
  app.innerHTML = `
  <div class="crumbs"><a href="#/">Home</a> › Pronounce</div>
  <div class="banner photo prban" style="--img:url(photos/pronounce.jpg)"><div class="bi">🗣️</div><div><h1>Pronounce</h1>
    <p>Choose a letter. Listen to all its words, then the AI checks your pronunciation with ${PRON_N} random words.</p></div></div>
  <div class="pkey"><span><i style="background:#e63946"></i>Below 60% · needs practice</span><span><i style="background:#f0a500"></i>60–89% · good</span><span><i style="background:#1b9e5a"></i>90–100% · excellent</span></div>
  <div class="pgrid">${pronSecs().map(s => { const b = pronBest[s.id], n = secWords(s).length; return `
    <div class="pcard" data-go="#/pronounce/${s.id}">
      <div class="pl">${s.id}<small>${s.id.toLowerCase()}</small></div>
      <div class="pm">${s.groups.length} sound${s.groups.length === 1 ? '' : 's'} · ${n} words</div>
      ${b ? `<span class="pbest" style="background:${pcol(b.best)}">⭐ ${b.best}%</span>` : '<span class="pbest none">Not tested yet</span>'}
    </div>`; }).join('')}</div>`;
  app.querySelectorAll('[data-go]').forEach(el => el.onclick = () => go(el.dataset.go));
}
function renderPronListen(sec) {
  const words = secWords(sec), heard = pronHeard[sec.id], T = mode === 'teacher';
  const left = words.filter(w => !heard.has(w.toLowerCase())).length, b = pronBest[sec.id], none = !words.length;
  const ready = !none && (!left || T || !!b);   // a letter tested before can be tested again without listening to every word again
  const all = pronSecs(), idx = all.indexOf(sec), prev = all[idx - 1], next = all[idx + 1];
  const nTest = Math.min(PRON_N, words.length);
  app.innerHTML = `
  <div class="crumbs"><a href="#/">Home</a> › <a href="#/pronounce">Pronounce</a> › Letter ${sec.id}</div>
  <div class="lhead prhead"><div><span class="lv" style="background:#f15bb5">🗣️ Pronounce</span><h1>Letter ${sec.id}${sec.id.toLowerCase()}</h1></div>
    <div class="row prnav">${prev ? `<a class="btn ghost sm" href="#/pronounce/${prev.id}">← ${prev.id}</a>` : ''}${next ? `<a class="btn ghost sm" href="#/pronounce/${next.id}">${next.id} →</a>` : ''}</div></div>
  <div class="panel prlist">
    <div class="row prtop" style="justify-content:space-between;align-items:flex-start">
      <div><h3 class="sec-t">🎧 Step 1 · Listen to the words</h3><p class="hint" style="margin:0">Tap a word to hear it, or press “Listen to all”. Listened: <b id="hcount">${words.length - left}</b> / ${words.length}</p></div>
      <div class="row prplay"><button class="btn teal" id="playAll">▶ Listen to all</button><button class="btn ghost sm" id="slowT">${pronSlow ? '🐢 Slow: on' : '🐢 Slow: off'}</button></div>
    </div>
    <div class="pbar" style="margin:14px 0 6px"><i id="hbar" style="width:${(words.length - left) / Math.max(1, words.length) * 100}%"></i></div>
    ${sec.groups.map((g, gi) => `<div class="pgroup">
      <div class="pgh"><b>${esc(g.title)}</b><button class="btn sm ghost" data-pg="${gi}">▶ Play</button>${g.note ? `<span class="ar" dir="rtl">${esc(g.note)}</span>` : ''}</div>
      <div class="pwords">${g.words.map(w => `<button class="pw ${heard.has(w.toLowerCase()) ? 'done' : ''}" data-w="${esc(w)}">${esc(w)}</button>`).join('')}</div></div>`).join('')}
  </div>
  <div class="panel pcta ${ready ? 'ready' : ''}" style="margin-top:16px">
    <div><h3 class="sec-t">🎤 Step 2 · AI pronunciation test</h3>
      <p class="hint" style="margin:0">${none ? 'There are no words for this letter yet.' : ready ? `Say ${nTest} random words from this letter. The AI listens and gives you a score out of 100%.` : `Listen to all the words first — <b id="leftN">${left}</b> word${left === 1 ? '' : 's'} left.`}</p>
      ${b ? `<div style="margin-top:10px;max-width:420px">${scaleHTML(b.best, 'Your best score')}</div>` : ''}</div>
    <button class="btn sun" id="startPT" ${ready ? '' : 'disabled'}>${ready ? '🎤 Start the test' : none ? '🔒 No words yet' : '🔒 Listen first'}</button>
  </div>
  ${T ? pronEditor(sec) : ''}`;
  const markHeard = w => {
    if (heard.has(w.toLowerCase())) return; heard.add(w.toLowerCase()); saveHeard();
    const n = words.filter(x => heard.has(x.toLowerCase())).length;
    $('#hcount').textContent = n; $('#hbar').style.width = n / words.length * 100 + '%';
    app.querySelectorAll('.pw').forEach(b => { if (b.dataset.w.toLowerCase() === w.toLowerCase()) b.classList.add('done'); });
    if (n === words.length && !T && !ready) renderPronListen(sec);
    else if ($('#leftN')) $('#leftN').textContent = words.length - n;
  };
  const speakW = (w, cb) => { app.querySelectorAll('.pw').forEach(b => b.classList.toggle('now', b.dataset.w === w)); say(w, () => { markHeard(w); cb && cb(); }, pronSlow ? 0.6 : 0.85); };
  const playList = list => { const tok = ++playToken; let i = 0; const nx = () => { if (tok !== playToken || i >= list.length) { app.querySelectorAll('.pw.now').forEach(b => b.classList.remove('now')); return; } const w = list[i++]; speakW(w, () => setTimeout(() => tok === playToken && nx(), 450)); }; nx(); };
  app.querySelectorAll('.pw').forEach(b => b.onclick = () => { playToken++; speakW(b.dataset.w); });
  app.querySelectorAll('[data-pg]').forEach(b => b.onclick = () => playList(sec.groups[+b.dataset.pg].words));
  $('#playAll').onclick = () => playList(sec.groups.flatMap(g => g.words));
  $('#slowT').onclick = () => { pronSlow = !pronSlow; $('#slowT').textContent = pronSlow ? '🐢 Slow: on' : '🐢 Slow: off'; };
  $('#startPT').onclick = () => { if (!ready) return; stopAll(); PR = {sec: sec.id, mode: 'test', words: shuffle(words).slice(0, PRON_N), i: 0, scores: [], tries: 0, best: null}; renderPron(sec.id); window.scrollTo(0, 0); };
  if (T) bindPronEditor(sec);
}
function renderPronTest(sec) {
  const w = PR.words[PR.i], N = PR.words.length, done = PR.scores.length;
  const avg = done ? Math.round(PR.scores.reduce((a, b) => a + b, 0) / done) : null;
  app.innerHTML = `
  <div class="crumbs"><a href="#/">Home</a> › <a href="#/pronounce">Pronounce</a> › <a href="#/pronounce/${sec.id}">Letter ${sec.id}</a> › Test</div>
  <div class="panel ptc">
    <div class="row pthd" style="justify-content:space-between"><b class="baloo ptt">🎤 Pronunciation test · Letter ${sec.id}</b><span class="prog">Word ${PR.i + 1} of ${N}</span></div>
    <div class="pbar"><i style="width:${PR.i / N * 100}%"></i></div>
    ${scaleHTML(avg, 'Your score so far')}
    <div class="pbig" id="pbig">${esc(w)}</div>
    <div class="row pthear" style="justify-content:center"><button class="btn ghost sm" id="pHear">🔊 Listen</button><button class="btn ghost sm" id="pSlow">🐢 Slowly</button></div>
    <button class="mic" id="pMic" title="Press and say the word">🎤</button>
    <div class="status" id="pStat" ${SR || pronSvc() ? '' : 'data-no="1"'}>${SR || pronSvc() ? 'Press the microphone and say the word' : '⚠️ Speech recognition needs Google Chrome or Microsoft Edge.'}</div>
    <div id="pRes"></div>
    <div class="row ptacts" style="justify-content:center;margin-top:16px">
      <button class="btn ghost" id="pSkip">Skip</button>
      <button class="btn" id="pNext" style="background:#7b61ff" disabled>${PR.i < N - 1 ? 'Next word →' : 'See my result →'}</button>
    </div>
    <p class="lbl ptnote" style="text-align:center;margin:10px 0 0">You can try each word up to 3 times — your best try counts.</p>
    <p class="lbl" id="pHow" style="text-align:center;margin:4px 0 0"></p>
  </div>`;
  PR.tries = 0; PR.best = null; PR.busy = false;
  pronHow(); if (typeof vtLoadCaps === 'function') vtLoadCaps().then(pronHow);
  $('#pHear').onclick = () => say(w, null, 0.85);
  $('#pSlow').onclick = () => say(w, null, 0.55);
  const advance = () => { stopAll(); PR.scores.push(PR.best ? PR.best.score : 0);
    // said, but not clearly: remembered for "Practise my mistakes" (a skipped word is not)
    if (PR.best && PR.best.score < MIST_PASS && noteWord(w)) PR.noted = (PR.noted || 0) + 1;
    PR.log = PR.log || []; PR.log.push({w, score: PR.best ? PR.best.score : 0, heard: PR.best ? PR.best.heard : ''});
    if (PR.i < N - 1) { PR.i++; renderPronTest(sec); } else finishPron(sec); };
  $('#pNext').onclick = advance; $('#pSkip').onclick = advance;
  // One try has been scored (by the service or by the browser): show it.
  const show = r => {
    const mic = $('#pMic'), st = $('#pStat'); PR.tries++;
    if (!PR.best || r.score > PR.best.score) PR.best = r;
    const c = pcol(r.score);
    $('#pbig').style.color = c;
    $('#pRes').innerHTML = `<div class="result"><div class="ring" style="--p:${r.score};--rc:${c}"><span>${r.score}%</span></div>
      <div class="fb"><b style="color:${c}">${r.score >= 90 ? 'Excellent! 🌟' : r.score >= 60 ? 'Good! 👍' : 'Not quite — try again 🔁'}</b>
      <div class="hint" style="margin:6px 0 0">I heard: “${esc(r.heard)}”</div>
      ${PR.tries > 1 ? `<div class="hint" style="margin:4px 0 0">Best try: <b style="color:${pcol(PR.best.score)}">${PR.best.score}%</b></div>` : ''}</div></div>`;
    $('#pNext').disabled = false;
    st.textContent = PR.best.score === 100 ? 'Perfect! Press “Next word”.' : PR.tries < 3 ? `Try again (${3 - PR.tries} ${3 - PR.tries === 1 ? 'try' : 'tries'} left) or press “Next word”.` : 'No tries left — press “Next word”.';
    if (PR.tries >= 3 || PR.best.score === 100) mic.disabled = true;
    if (r.score >= 90) say('Excellent!', null, 1);
    // on a small screen the score must not push "Next word" under the tab bar (.ptacts has a scroll margin for it)
    const acts = $('#pNext').parentNode, bar = $('.tabbar'), low = bar && bar.offsetHeight ? bar.getBoundingClientRect().top : innerHeight;
    if (acts.getBoundingClientRect().bottom > low - 4) acts.scrollIntoView({block: 'end', behavior: 'smooth'});
  };
  // The speech service: record the word, send it, show the score. A silent recording or an answer the service could not give is not a try.
  const viaSvc = async () => {
    const mic = $('#pMic'), st = $('#pStat'), live = () => document.contains(mic) && PR.mode === 'test';
    const quiet = '🤔 I didn\'t hear anything. Try again a little louder.';
    PR.busy = true; speechSynthesis.cancel();
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true}}); }
    catch (e) { if (live()) { PR.busy = false; st.textContent = e && e.name === 'NotFoundError' ? '🎤 No microphone was found. Check that your device has one and that it is switched on.' : '🚫 Microphone blocked — allow microphone access in your browser.'; } return; }
    if (!live()) { stream.getTracks().forEach(t => t.stop()); return; }
    mic.classList.add('rec'); st.textContent = '🎙 Listening… say the word now';
    const cap = await prRecord(stream);
    if (!cap || !live()) return;
    mic.classList.remove('rec');
    if (!cap.wav || cap.peak < 0.004) { PR.busy = false; st.textContent = quiet; return; }
    mic.disabled = true; st.textContent = '⏳ Checking your pronunciation…';
    const d = await vtPost({action: 'word', student, text: w, audio: await vtB64(cap.wav)}, 20000);
    if (!live()) return;
    PR.busy = false; mic.disabled = false;
    if (!d || !d.ok) {
      const why = d && d.error; pronFails++;
      if (PRON_HARD.includes(why) || pronFails >= 2) pronNoSvc = true;
      const because = PRON_WHY[why] ? ' (' + PRON_WHY[why] + ')' : '';
      st.textContent = !pronNoSvc ? 'That could not be checked' + because + '. Press the microphone and try again.'
        : SR ? 'The full check is not available now' + because + '. Press the microphone again for the basic check.'
        : 'The pronunciation check is not available now' + because + '. Try again later, or use Google Chrome or Microsoft Edge.';
      pronHow(); return;
    }
    pronFails = 0;
    if (!d.scores || !d.heard) { st.textContent = quiet; return; }
    show(pronSvcScore(w, d));
  };
  $('#pMic').onclick = () => {
    if (prRec) { prRec.stop(); return; }   // a second press: "I have finished"
    if (PR.busy) return;
    if (pronSvc()) { if (PR.tries < 3) viaSvc(); return; }
    if (!SR) { toast('Please open this page in Chrome or Edge for speech recognition'); return; }
    if (recog) { recog.stop(); return; }
    if (PR.tries >= 3) return;
    speechSynthesis.cancel();
    const mic = $('#pMic'), st = $('#pStat'); let got = false;
    recog = new SR(); recog.lang = LANG; recog.interimResults = false; recog.maxAlternatives = 5;
    recog.onstart = () => { mic.classList.add('rec'); st.textContent = '🎙 Listening… say the word now'; };
    recog.onresult = e => { got = true; show(scoreWord(w, [...e.results[0]].map(a => a.transcript))); };
    recog.onerror = e => { st.textContent = e.error === 'not-allowed' || e.error === 'service-not-allowed' ? '🚫 Microphone blocked — allow microphone access in your browser.' : e.error === 'no-speech' ? '🤔 I didn\'t hear anything. Try again a little louder.' : e.error === 'audio-capture' ? '🎤 No microphone was found. Check that your device has one and that it is switched on.' : e.error === 'network' ? '🌐 Speech recognition needs an internet connection.' : e.error === 'aborted' ? 'Press the microphone and say the word' : 'Something went wrong (' + e.error + '). Try again.'; };
    recog.onend = () => { mic.classList.remove('rec'); recog = null; if (!got && st.textContent.startsWith('🎙')) st.textContent = 'Press the microphone and say the word'; };
    try { recog.start(); } catch (e) { recog = null; }
  };
}
async function finishPron(sec) {
  if (!PR.scores.length) { PR = {sec: sec.id, mode: 'listen'}; return renderPron(sec.id); }
  const avg = Math.round(PR.scores.reduce((a, b) => a + b, 0) / PR.scores.length);
  const prev = pronBest[sec.id];
  pronBest[sec.id] = {best: Math.max(avg, prev ? prev.best : 0), last: avg, date: new Date().toISOString()};
  await DB.put('kv', 'pron', pronBest); onActivity();
  PR.mode = 'done'; PR.avg = avg; PR.newBest = !prev || avg > prev.best; renderPron(sec.id); window.scrollTo(0, 0);
}
function renderPronDone(sec) {
  const all = pronSecs(), next = all[all.indexOf(sec) + 1], avg = PR.avg;
  app.innerHTML = `
  <div class="crumbs"><a href="#/">Home</a> › <a href="#/pronounce">Pronounce</a> › <a href="#/pronounce/${sec.id}">Letter ${sec.id}</a> › Result</div>
  <div class="panel prdone" style="text-align:center">
    <div class="premo">${avg >= 90 ? '🏆' : avg >= 60 ? '👏' : '💪'}</div>
    <h2 class="baloo prdt">Letter ${sec.id} · Your pronunciation</h2>
    <p class="hint">${pword(avg)}${PR.newBest && pronBest[sec.id] ? ' · New best score!' : ''}</p>
    <div style="max-width:640px;margin:10px auto 0;text-align:left">${scaleHTML(avg, 'Pronunciation score', true)}</div>
    <h3 class="baloo" style="text-align:left;margin:26px 0 10px;font-size:22px;color:var(--navy)">Your words</h3>
    <div class="plog">${PR.log.map(l => `<button class="plw" data-say="${esc(l.w)}" style="--pc:${pcol(l.score)}"><span>🔊 ${esc(l.w)}</span><b>${l.score}%</b>${l.score < 100 && l.heard ? `<small>heard: “${esc(l.heard)}”</small>` : l.score === 0 ? '<small>skipped</small>' : ''}</button>`).join('')}</div>
    ${PR.noted && mistLinkHTML() ? `<p class="hint prnoted" id="prNoted" style="text-align:left;margin:16px 0 0">${PR.noted === 1 ? '<b>1 word</b> was not clear. It is' : `<b>${PR.noted} words</b> were not clear. They are`} in “Practise my mistakes” now, so you can say ${PR.noted === 1 ? 'it' : 'them'} again.</p><div style="text-align:left">${mistLinkHTML()}</div>` : ''}
    <div class="row prfoot" style="justify-content:center;margin-top:22px">
      <button class="btn sun" id="again">↻ Try ${Math.min(PRON_N, secWords(sec).length)} new words</button>
      <button class="btn ghost" id="relisten">🎧 Listen again</button>
      ${next ? `<a class="btn" style="background:#7b61ff" href="#/pronounce/${next.id}">Letter ${next.id} →</a>` : ''}
    </div>
  </div>`;
  app.querySelectorAll('[data-say]').forEach(b => b.onclick = () => say(b.dataset.say, null, 0.85));
  $('#again').onclick = () => { PR = {sec: sec.id, mode: 'test', words: shuffle(secWords(sec)).slice(0, PRON_N), i: 0, scores: []}; renderPron(sec.id); };
  $('#relisten').onclick = () => { PR = {sec: sec.id, mode: 'listen'}; renderPron(sec.id); };
}
function pronEditor(sec) {
  return `<div class="edit"><h4>🧑‍🏫 Teacher tools · Words for letter ${sec.id}</h4>
    <p class="lbl" style="margin:0 0 10px">Separate words with commas. In Teacher mode you can start the test without listening first.</p>
    ${sec.groups.map((g, gi) => `<div class="erow" style="align-items:flex-start">
      <div class="grow" style="display:grid;gap:6px">
        <input class="in" data-gf="title" data-gi="${gi}" value="${esc(g.title)}" placeholder="Sound or rule, e.g. ai">
        <input class="in" data-gf="note" data-gi="${gi}" dir="auto" value="${esc(g.note || '')}" placeholder="Note (optional — Arabic or English)">
        <textarea class="in" rows="2" data-gf="words" data-gi="${gi}" placeholder="word, word, word">${esc(g.words.join(', '))}</textarea>
      </div>
      <button class="btn sm ghost" data-gdel="${gi}">🗑</button></div>`).join('')}
    <div class="row"><button class="btn sm" id="gAdd">➕ Add sound group</button><button class="btn sm ghost" id="pReset">↺ Restore this letter from the file</button></div>
  </div>`;
}
function bindPronEditor(sec) {
  const keep = () => { const y = window.scrollY; renderPronListen(sec); window.scrollTo(0, y); };
  app.querySelectorAll('[data-gf]').forEach(el => el.onchange = async () => {
    const g = sec.groups[+el.dataset.gi], f = el.dataset.gf;
    g[f] = f === 'words' ? el.value.split(/[,\n،]+/).map(s => s.trim()).filter(Boolean) : el.value.trim();
    await save(); keep();
  });
  app.querySelectorAll('[data-gdel]').forEach(b => b.onclick = async () => { if (!confirm('Delete this sound group?')) return; sec.groups.splice(+b.dataset.gdel, 1); await save(); keep(); });
  $('#gAdd').onclick = async () => { sec.groups.push({id: uid(), title: 'New sound', note: '', words: []}); await save(); keep(); };
  $('#pReset').onclick = async () => { if (!confirm(`Restore the words for letter ${sec.id} from the original file?`)) return;
    const d = defaultPron().find(s => s.id === sec.id); if (d) { sec.groups = d.groups; await save(); keep(); toast('Letter ' + sec.id + ' restored'); } };
}

