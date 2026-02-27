/* ThyroidAI - Alejo Malia . 2026 */
/* "The software code is provided for research purposes under the spirit of the CC BY-NC 4.0 license."*/


import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import enquirer from 'enquirer';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

console.clear();
console.log(chalk.bold.white.bgMagenta('   THYROIDAI CLI v1.2.1   '));
console.log(chalk.dim('   Professional Metabolic Triangulation + Medication\n'));

const TRANSLATIONS = {
  en: {
    chooseLang: '🌍 Choose language',
    chooseAI: '🤖 Choose AI provider',
    enterKey: '🔑 Enter your API Key',
    detecting: '🔍 Detecting models...',
    chooseModel: '🤖 Available models',
    chooseCondition: '🦋 Select your thyroid condition',
    manageMeds: '💊 Manage current medication?',
    addMed: 'Add new medication',
    noMeds: 'No medication registered yet',
    processing: '⏳ Processing PDF...',
    resultsTitle: '📊 METABOLIC ASSESSMENT',
    markersTitle: '🔬 MARKERS',
    medImpactTitle: '💊 MEDICATION IMPACT',
    triangTitle: '🔬 ADVANCED TRIANGULATION v2.0',
    patternsTitle: '🎯 PATTERNS',
    fullReport: '📋 FULL REPORT',
    saved: '✅ Saved to thyroid-db.json'
  }
};

const t = (key) => TRANSLATIONS.en[key];

const THYROID_LIST = [
  "Hypothyroidism (Slow gland)",
  "Hyperthyroidism (Overactive gland)",
  "Subclinical Hypothyroidism",
  "Hashimoto's Thyroiditis",
  "Graves' Disease",
  "Goiter / Thyroid Nodule",
  "Thyroiditis",
  "General Checkup"
];

const PROTOCOLO_MAESTRO = `You are an elite functional endocrinologist. MASTER PROTOCOL OF METABOLIC TRIANGULATION v2.1:

1. Pituitary-Thyroid Axis
2. Peripheral conversion and brake (FT3, rT3, ratios)
3. Autoimmunity and transport
4. Optimal functional ranges
5. SPECIFIC MEDICATION IMPACT (mandatory)
6. Advanced patterns

Return ONLY this JSON:

{
  "markers": [{"name":"TSH","score":8,"summary":"..."}],
  "patterns": ["Poor T4→T3 conversion"],
  "medImpact": "Detailed description of current medication impact...",
  "triangulation": "Complete professional triangulation...",
  "fullReport": "Long professional narrative report..."
}`;

const PROVIDER_CONFIG = {
  openai: { name: 'OpenAI', base: 'https://api.openai.com/v1/chat/completions', modelsUrl: 'https://api.openai.com/v1/models', headers: k => ({ Authorization: `Bearer ${k}` }) },
  groq: { name: 'Groq', base: 'https://api.groq.com/openai/v1/chat/completions', modelsUrl: 'https://api.groq.com/openai/v1/models', headers: k => ({ Authorization: `Bearer ${k}` }) },
  anthropic: { name: 'Claude', base: 'https://api.anthropic.com/v1/messages', modelsUrl: 'https://api.anthropic.com/v1/models', headers: k => ({ 'x-api-key': k, 'anthropic-version': '2023-06-01' }) },
  gemini: { name: 'Gemini', base: 'https://generativelanguage.googleapis.com/v1beta/models/', modelsUrl: 'https://generativelanguage.googleapis.com/v1beta/models', headers: () => ({}) },
  xai: { name: 'Grok', base: 'https://api.x.ai/v1/chat/completions', modelsUrl: 'https://api.x.ai/v1/models', headers: k => ({ Authorization: `Bearer ${k}` }) },
  ollama: { name: 'Ollama', base: 'http://127.0.0.1:11434/api/chat', modelsUrl: 'http://127.0.0.1:11434/api/tags', headers: () => ({}) }
};

let currentMeds = [];
const MEDS_FILE = 'thyroid-meds.json';
if (fs.existsSync(MEDS_FILE)) currentMeds = JSON.parse(fs.readFileSync(MEDS_FILE, 'utf8'));

function saveMeds() {
  fs.writeFileSync(MEDS_FILE, JSON.stringify(currentMeds, null, 2));
}

async function getAvailableModels(providerKey, apiKey) {
  if (providerKey === 'ollama') {
    try {
      const r = await fetch('http://127.0.0.1:11434/api/tags');
      const d = await r.json();
      return d.models ? d.models.map(m => m.name) : ['llama3.2', 'qwen2.5'];
    } catch { return ['llama3.2', 'qwen2.5']; }
  }
  const cfg = PROVIDER_CONFIG[providerKey];
  let url = cfg.modelsUrl;
  if (providerKey === 'gemini') url += `?key=${apiKey}`;
  try {
    const res = await fetch(url, { headers: cfg.headers(apiKey) });
    const data = await res.json();
    let models = [];
    if (providerKey === 'gemini') models = data.models ? data.models.map(m => m.name.split('/').pop()) : [];
    else if (data.data) models = data.data.map(m => m.id);
    else if (data.models) models = data.models.map(m => m.id);
    return models.length ? models : [];
  } catch {
    return [];
  }
}

async function callLLM(prompt, providerKey, apiKey, model) {
  const cfg = PROVIDER_CONFIG[providerKey];
  let url = cfg.base;
  let headers = { 'Content-Type': 'application/json', ...cfg.headers(apiKey) };
  let body;
  if (providerKey === 'gemini') {
    url += `${model}:generateContent?key=${apiKey}`;
    body = { contents: [{ parts: [{ text: prompt }] }] };
  } else if (providerKey === 'anthropic') {
    body = { model, max_tokens: 4000, messages: [{ role: 'user', content: prompt }] };
  } else if (providerKey === 'ollama') {
    body = { model, messages: [{ role: 'user', content: prompt }], stream: false };
  } else {
    body = { model, messages: [{ role: 'user', content: prompt }] };
  }
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json();
  if (providerKey === 'gemini') return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (providerKey === 'anthropic') return data.content?.[0]?.text || '';
  if (providerKey === 'ollama') return data.message?.content || '';
  return data.choices?.[0]?.message?.content || '';
}

async function analyzePDF(pdfText, condition, providerKey, apiKey, model) {
  const medsStr = currentMeds.length ? JSON.stringify(currentMeds) : "No medication registered";
  const prompt = `${PROTOCOLO_MAESTRO}

Patient condition: ${condition}
Current medication: ${medsStr}

PDF TEXT: ${pdfText}

Return ONLY valid JSON.`;
  let raw = await callLLM(prompt, providerKey, apiKey, model);
  const jsonStart = raw.indexOf('{');
  const jsonEnd = raw.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) raw = raw.substring(jsonStart, jsonEnd + 1);
  return JSON.parse(raw);
}

function renderScale(name, score = 5, summary = '') {
  console.log(chalk.bold.cyan(`\n${name}`));
  let bar = Array.from({ length: 10 }, (_, i) => (i + 1 <= score ? chalk.green('●') : chalk.gray('○'))).join(chalk.gray(' ─ '));
  console.log(bar);
  console.log(chalk.dim('1   2   3   4   5   6   7   8   9  10'));
  console.log(chalk.white(`📝 ${summary}`));
}

async function saveToDB(entry) {
  const dbPath = 'thyroid-db.json';
  let db = [];
  if (fs.existsSync(dbPath)) db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  db.push(entry);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

async function manageMedications() {
  while (true) {
    console.log(chalk.cyan(`\n💊 Current medication (${currentMeds.length}):`));
    if (currentMeds.length === 0) console.log(chalk.dim('   No medication registered yet'));
    else currentMeds.forEach((m, i) => console.log(chalk.white(`   ${i+1}. ${m.type} - ${m.name} (${m.dose})`)));
    const { action } = await enquirer.prompt({
      type: 'select',
      name: 'action',
      message: t('manageMeds'),
      choices: ['Continue without changes', t('addMed'), 'Delete medication', 'Finish management']
    });
    if (action === 'Continue without changes' || action === 'Finish management') break;
    if (action === t('addMed')) {
      const med = await enquirer.prompt([
        { type: 'input', name: 'type', message: 'Type (e.g. Levothyroxine)' },
        { type: 'input', name: 'name', message: 'Brand name' },
        { type: 'input', name: 'dose', message: 'Dose (e.g. 125 mcg)' },
        { type: 'input', name: 'freq', message: 'Frequency', initial: 'Daily' },
        { type: 'input', name: 'start', message: 'Start date (YYYY-MM-DD)' }
      ]);
      currentMeds.push(med);
      saveMeds();
      console.log(chalk.green('✔ Medication saved'));
    }
    if (action === 'Delete medication' && currentMeds.length > 0) {
      const { idx } = await enquirer.prompt({
        type: 'select',
        name: 'idx',
        message: 'Which one to delete?',
        choices: currentMeds.map((m,i) => `${i+1}. ${m.name}`)
      });
      currentMeds.splice(parseInt(idx.split('.')[0]) - 1, 1);
      saveMeds();
    }
  }
}

async function main() {
  const { providerName } = await enquirer.prompt({
    type: 'select',
    name: 'providerName',
    message: t('chooseAI'),
    choices: Object.values(PROVIDER_CONFIG).map(p => p.name)
  });
  const providerKey = Object.keys(PROVIDER_CONFIG).find(k => PROVIDER_CONFIG[k].name === providerName);
  let apiKey = '';
  if (providerKey !== 'ollama') {
    ({ apiKey } = await enquirer.prompt({ type: 'password', name: 'apiKey', message: t('enterKey') }));
  }
  console.log(chalk.yellow(t('detecting')));
  const models = await getAvailableModels(providerKey, apiKey);
  const { model } = await enquirer.prompt({
    type: 'select',
    name: 'model',
    message: t('chooseModel'),
    choices: models.length ? models : ['gpt-4o', 'claude-3-5-sonnet']
  });
  await manageMedications();
  const { condition } = await enquirer.prompt({
    type: 'select',
    name: 'condition',
    message: t('chooseCondition'),
    choices: THYROID_LIST
  });
  const { action } = await enquirer.prompt({
    type: 'select',
    name: 'action',
    message: 'What do you want to do?',
    choices: ['Single analysis', 'Batch analysis (folder)', 'View history']
  });
  if (action === 'View history') {
    const dbPath = 'thyroid-db.json';
    const count = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf8')).length : 0;
    console.log(chalk.green(`\n📊 ${count} analyses saved`));
    return;
  }
  let files = [];
  if (action === 'Single analysis') {
    const { filePath } = await enquirer.prompt([{ type: 'input', name: 'filePath', message: '📄 Path to PDF:' }]);
    files = [filePath.trim().replace(/^['"]|['"]$/g, '')];
  } else {
    const { folder } = await enquirer.prompt([{ type: 'input', name: 'folder', message: '📁 Folder path:' }]);
    files = fs.readdirSync(folder).filter(f => f.toLowerCase().endsWith('.pdf')).map(f => path.join(folder, f));
  }
  for (const file of files) {
    console.log(chalk.yellow(`\n${t('processing')} ${path.basename(file)}`));
    const pdfData = await pdfParse(fs.readFileSync(file));
    const result = await analyzePDF(pdfData.text, condition, providerKey, apiKey, model);
    console.log(chalk.bold.white.bgBlue(`\n${t('resultsTitle')} - ${condition}`));
    console.log(chalk.bold.magenta(`\n${t('markersTitle')}`));
    result.markers.forEach(m => renderScale(m.name, m.score, m.summary));
    console.log(chalk.bold.magenta(`\n${t('medImpactTitle')}`));
    console.log(chalk.white(result.medImpact || 'No medication data'));
    console.log(chalk.bold.magenta(`\n${t('triangTitle')}`));
    console.log(chalk.white(result.triangulation || 'Triangulation completed'));
    console.log(chalk.bold.magenta(`\n${t('patternsTitle')}`));
    (result.patterns || []).forEach(p => console.log(chalk.green(`• ${p}`)));
    console.log(chalk.bold.white(`\n${t('fullReport')}`));
    console.log(chalk.white(result.fullReport));
    await saveToDB({ timestamp: new Date().toISOString(), file: path.basename(file), condition, result });
    console.log(chalk.green.bold(t('saved')));
  }
  console.log(chalk.bold.green('\n🎉 Analysis completed successfully!'));
}

main().catch(err => console.error(chalk.red('❌ Error:'), err.message));

/* ThyroidAI - Alejo Malia . 2026 */
/* "The software code is provided for research purposes under the spirit of the CC BY-NC 4.0 license."*/
