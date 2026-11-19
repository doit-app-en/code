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
  await loadMedia(ptSet().musicM);
  if (!state.pron || !Array.isArray(state.pron.sections)) { state.pron = {sections: defaultPron()}; await save(); }
  if (!state.listen || !Array.isArray(state.listen.exercises)) { state.listen = {exercises: defaultListen(), v: LISTEN_V}; await save(); }
  if (upgradeListen() | groupListen()) await save();
  student = (await DB.get('kv', 'student')) || null; tkey = (await DB.get('kv', 'tkey')) || '';
  if (!state.speaking || !Array.isArray(state.speaking.tasks)) { state.speaking = {tasks: SP_TASKS_DEFAULT()}; await save(); }
  await mineLoad();   // the student's own practice saved on this device (11b-accounts.js)
  await autoLoadCourse();
  await authInit();   // accounts: who is signed in (sets `student` from the account and lays that account's own practice)
  if (student) syncProgress();
  render();
})();
