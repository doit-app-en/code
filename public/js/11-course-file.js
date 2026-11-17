/* ================= export / import ================= */
const blobToDataURL = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b); });
function mediaIds(st) {
  const ids = new Set();
  Object.values(st.levels).forEach(lv => lv.lessons.forEach(s => {
    if (s.video && s.video.m) ids.add(s.video.m);
    if (s.audio && s.audio.m) ids.add(s.audio.m);
    [...s.phrases, ...s.matching].forEach(p => p.img && p.img.m && ids.add(p.img.m));
  }));
  if (st.placement && st.placement.settings && st.placement.settings.musicM) ids.add(st.placement.settings.musicM);
  return [...ids];
}
async function exportCourse() {
  const btn = $('#exportBtn'); btn.disabled = true; btn.textContent = '⏳ Preparing…';
  try {
    const media = {};
    for (const id of mediaIds(state)) { const b = await DB.get('media', id); if (b) media[id] = await blobToDataURL(b); }
    const data = {app: 'do-it-english', version: 1, exported: new Date().toISOString(), state, media};
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `do-it-english-course-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    toast(`Course exported (${(blob.size / 1048576).toFixed(1)} MB)`);
  } catch (e) { toast('Export failed: ' + e.message); }
  btn.disabled = false; btn.textContent = '⬇ Export course file';
}
async function importCourse(file) {
  if (!file) return;
  let data;
  try { data = JSON.parse(await file.text()); } catch (e) { return toast('That file is not a Do it English course file'); }
  if (!data || data.app !== 'do-it-english' || !data.state || !data.state.levels) return toast('That file is not a Do it English course file');
  if (!confirm('Importing will replace all the lessons currently on this device. Continue?')) return;
  toast('Importing…');
  try {
    await applyCourse(data);
    const n = Object.values(state.levels).reduce((a, l) => a + l.lessons.length, 0);
    render(true); toast(`Course imported: ${n} lessons 🎉`);
  } catch (e) { toast('Import failed: ' + e.message); }
}
// When the page is a website, a file called course.json next to it is loaded automatically,
// so every student gets the teacher's lessons, exercises and class server without importing anything.
async function autoLoadCourse() {
  if (!/^https?:$/.test(location.protocol)) return;
  try {
    const r = await fetch('course.json', {cache: 'no-cache'}); if (!r.ok) return;
    const data = await r.json();
    if (!data || data.app !== 'do-it-english' || !data.state || !data.state.levels) return;
    const stamp = String(data.exported || '1');
    if ((await DB.get('kv', 'courseStamp')) === stamp) return;   // this version is already on the device
    await applyCourse(data); await DB.put('kv', 'courseStamp', stamp);
  } catch (e) { /* no course file, or offline: keep what is on the device */ }
}
async function applyCourse(data) {
  {
    for (const [id, url] of Object.entries(data.media || {})) {
      const blob = await (await fetch(url)).blob();
      await DB.put('media', id, blob);
      if (urlCache[id]) URL.revokeObjectURL(urlCache[id]);
      urlCache[id] = URL.createObjectURL(blob);
    }
    state = data.state;
    LEVELS.forEach(l => { if (!state.levels[l.id]) state.levels[l.id] = {lessons: []}; });
    upgradeLessons();
    if (!state.placement || !Array.isArray(state.placement.questions)) state.placement = {questions: defaultBank(), v: PLACE_V};
    upgradePlacement();
    if (!state.pron || !Array.isArray(state.pron.sections)) state.pron = {sections: defaultPron()};
    if (!state.listen || !Array.isArray(state.listen.exercises)) state.listen = {exercises: defaultListen(), v: LISTEN_V};
    upgradeListen(); groupListen();
    if (!state.speaking || !Array.isArray(state.speaking.tasks)) state.speaking = {tasks: SP_TASKS_DEFAULT()};
    LS_ = {};
    P = {stage: 'info'}; PR = {};
    await save(); LS = null;
  }
}

