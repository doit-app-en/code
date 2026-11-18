/* ================= start ================= */
(async () => {
  setModeButtons();
  if ('speechSynthesis' in window) speechSynthesis.getVoices();
  await DB.open();
  state = await DB.get('kv', 'state');
  if (!state || !state.levels) { state = seedState(); await save(); }
  LEVELS.forEach(l => { if (!state.levels[l.id]) state.levels[l.id] = {lessons: []}; });
  if (upgradeLessons()) await save();
  if (!state.placement || !Array.isArray(state.placement.questions)) { state.placement = {questions: defaultBank(), v: PLACE_V}; await save(); }
  if (upgradePlacement()) await save();
  results = (await DB.get('kv', 'results')) || [];
  await loadMedia(ptSet().musicM);
  if (!state.pron || !Array.isArray(state.pron.sections)) { state.pron = {sections: defaultPron()}; await save(); }
  pronBest = (await DB.get('kv', 'pron')) || {}; loadHeard(await DB.get('kv', 'pronHeard'));
  if (!state.listen || !Array.isArray(state.listen.exercises)) { state.listen = {exercises: defaultListen(), v: LISTEN_V}; await save(); }
  if (upgradeListen() | groupListen()) await save();
  listenBest = (await DB.get('kv', 'listenById')) || {};
  student = (await DB.get('kv', 'student')) || null; activity = (await DB.get('kv', 'activity')) || {last: null, days: {}}; lessonsDone = (await DB.get('kv', 'lessonsDone')) || {}; mistakes = (await DB.get('kv', 'mistakes')) || {}; mixBest = (await DB.get('kv', 'mixBest')) || {best: 0, plays: 0}; tkey = (await DB.get('kv', 'tkey')) || '';
  if (!state.speaking || !Array.isArray(state.speaking.tasks)) { state.speaking = {tasks: SP_TASKS_DEFAULT()}; await save(); }
  spHistory = (await DB.get('kv', 'speakHistory')) || []; await Promise.all(spHistory.map(r => loadMedia(r.media)));
  await autoLoadCourse();
  if (student) syncProgress();
  render();
})();
