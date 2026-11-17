// Azure AI Speech — "Speech to text REST API for short audio".
// Docs: https://learn.microsoft.com/azure/ai-services/speech-service/rest-speech-to-text-short
// Audio must be WAV, PCM 16-bit, 16 kHz, mono. Limits: 60 s without, 30 s with pronunciation assessment.
import { env } from './server.js';

const PATH = '/speech/recognition/conversation/cognitiveservices/v1';
export const azureOn = () => !!env('AZURE_SPEECH_KEY') && !!(env('AZURE_SPEECH_REGION') || env('AZURE_SPEECH_ENDPOINT'));

function endpoint() {
  // AZURE_SPEECH_ENDPOINT: the resource's own address (https://NAME.cognitiveservices.azure.com). Otherwise the region is used.
  const own = env('AZURE_SPEECH_ENDPOINT').replace(/\/+$/, '');
  if (/^https:\/\/[a-z0-9-]+\.cognitiveservices\.azure\.com$/i.test(own)) return own + '/stt' + PATH;
  const region = env('AZURE_SPEECH_REGION').toLowerCase().replace(/[^a-z0-9]/g, '');
  return 'https://' + region + '.stt.speech.microsoft.com' + PATH;
}

async function call(wav, assessment) {
  const headers = { 'Ocp-Apim-Subscription-Key': env('AZURE_SPEECH_KEY'), 'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000', Accept: 'application/json' };
  if (assessment) headers['Pronunciation-Assessment'] = Buffer.from(JSON.stringify(assessment), 'utf8').toString('base64');
  return fetch(endpoint() + '?language=' + encodeURIComponent(env('AZURE_SPEECH_LANGUAGE', 'en-GB')) + '&format=detailed', { method: 'POST', headers, body: wav });
}
const fail = resp => ({ ok: false, error: resp.status === 401 || resp.status === 403 ? 'speech key' : resp.status === 429 ? 'speech limit' : 'speech error ' + resp.status });
const round = v => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : null);

// Plain transcription of free speech (up to 60 s).
export async function transcribe(wav) {
  let resp; try { resp = await call(wav, null); } catch (e) { return { ok: false, error: 'busy' }; }
  if (resp.status !== 200) return fail(resp);
  const d = await resp.json(), best = (d.NBest || [])[0];
  if (d.RecognitionStatus !== 'Success' || !best) return { ok: true, text: '', confidence: null };
  return { ok: true, text: String(best.Display || best.Lexical || '').slice(0, 4000), confidence: typeof best.Confidence === 'number' ? best.Confidence : null };
}

// Scores how the student read / repeated `text` (up to 30 s).
export async function assess(wav, text) {
  const base = { ReferenceText: text, GradingSystem: 'HundredMark', Granularity: 'Word', Dimension: 'Comprehensive', EnableMiscue: 'True' };
  let resp;
  try {
    resp = await call(wav, { ...base, EnableProsodyAssessment: 'True' });
    if (resp.status === 400) resp = await call(wav, base);   // prosody is not available for every language
  } catch (e) { return { ok: false, error: 'busy' }; }
  if (resp.status !== 200) return fail(resp);
  const d = await resp.json(), best = (d.NBest || [])[0];
  if (d.RecognitionStatus !== 'Success' || !best) return { ok: true, heard: '', scores: null, words: [] };
  return {
    ok: true, heard: String(best.Display || best.Lexical || '').slice(0, 600),
    scores: { pron: round(best.PronScore), accuracy: round(best.AccuracyScore), fluency: round(best.FluencyScore), completeness: round(best.CompletenessScore), prosody: round(best.ProsodyScore) },
    words: (best.Words || []).slice(0, 60).map(w => ({ w: String(w.Word || '').slice(0, 40), score: round(w.AccuracyScore), err: ['Omission', 'Insertion', 'Mispronunciation'].includes(w.ErrorType) ? w.ErrorType : '' })),
  };
}
