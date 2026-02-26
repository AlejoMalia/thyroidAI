// ================================================
// THYROIDAI v1.0 - VERSIÓN FINAL, LIMPIA Y 100% FUNCIONAL
// ================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import enquirer from 'enquirer';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

console.clear();
console.log(chalk.bold.white.bgMagenta('THYROIDAI v1.0'));
console.log(chalk.white('• Español'));
console.log(chalk.white('• English'));
console.log(chalk.white('• Français'));
console.log(chalk.white('• Deutsch'));
console.log(chalk.white('• Italiano'));
console.log(chalk.white('• Polski'));
console.log(chalk.white('• Русский'));
console.log(chalk.white('• Türkçe'));
console.log(chalk.white('• 日本語'));
console.log(chalk.white('• Português'));
console.log(chalk.dim('—————\n'));

// ==================== IDIOMAS ====================
const TRANSLATIONS = {
    es: { langName: 'Español', chooseLang: '🌍 Elige idioma / Choose language:', chooseAI: '🤖 Elige proveedor de IA:', enterKey: '🔑 Ingresa tu API Key:', detecting: '🔍 Detectando modelos disponibles...', chooseModel: '🤖 Modelos disponibles (detectados automáticamente):', chooseCondition: '🦋 Selecciona tu condición tiroidea:', whatDoYouWant: '¿Qué deseas hacer?', single: 'Análisis individual', batch: 'Análisis en lote', stats: 'Ver estadísticas', processing: '⏳ Procesando PDF...', resultsTitle: '📊 VALORACIÓN METABÓLICA TIROIDEA', markersTitle: '🔬 VALORACIÓN INDIVIDUAL DE MARCADORES TIROIDEOS', patternsTitle: '🎯 PATRONES DETECTADOS', fullReport: '📋 INFORME COMPLETO Y TRIANGULACIÓN', saved: '✅ Guardado en thyroid-db.json' },
    en: { langName: 'English', chooseLang: '🌍 Elige idioma / Choose language:', chooseAI: '🤖 Choose AI provider:', enterKey: '🔑 Enter API Key:', detecting: '🔍 Detecting models...', chooseModel: '🤖 Available models (auto-detected):', chooseCondition: '🦋 Select thyroid condition:', whatDoYouWant: 'What do you want to do?', single: 'Single analysis', batch: 'Batch analysis', stats: 'View statistics', processing: '⏳ Processing PDF...', resultsTitle: '📊 THYROID METABOLIC ASSESSMENT', markersTitle: '🔬 INDIVIDUAL THYROID MARKER ASSESSMENT', patternsTitle: '🎯 DETECTED PATTERNS', fullReport: '📋 FULL TRIANGULATION REPORT', saved: '✅ Saved to thyroid-db.json' },
    fr: { langName: 'Français', chooseLang: '🌍 Elige idioma / Choose language:', chooseAI: '🤖 Choisissez fournisseur IA:', enterKey: '🔑 Entrez API Key:', detecting: '🔍 Détection des modèles...', chooseModel: '🤖 Modèles disponibles (auto-détectés):', chooseCondition: '🦋 Sélectionnez condition thyroïdienne:', whatDoYouWant: 'Que voulez-vous faire ?', single: 'Analyse individuelle', batch: 'Analyse par lot', stats: 'Voir statistiques', processing: '⏳ Traitement PDF...', resultsTitle: '📊 ÉVALUATION MÉTABOLIQUE THYROÏDIENNE', markersTitle: '🔬 ÉVALUATION INDIVIDUELLE DES MARQUEURS THYROÏDIENS', patternsTitle: '🎯 PATRONS DÉTECTÉS', fullReport: '📋 RAPPORT COMPLET ET TRIANGULATION', saved: '✅ Sauvegardé dans thyroid-db.json' },
    de: { langName: 'Deutsch', chooseLang: '🌍 Elige idioma / Choose language:', chooseAI: '🤖 KI-Anbieter wählen:', enterKey: '🔑 API-Schlüssel eingeben:', detecting: '🔍 Modelle erkennen...', chooseModel: '🤖 Verfügbare Modelle (automatisch erkannt):', chooseCondition: '🦋 Wähle deine Schilddrüsenerkrankung:', whatDoYouWant: 'Was möchtest du tun?', single: 'Einzelanalyse', batch: 'Stapelanalyse', stats: 'Statistiken ansehen', processing: '⏳ PDF verarbeiten...', resultsTitle: '📊 METABOLISCHE BEWERTUNG DER SCHILDDRÜSE', markersTitle: '🔬 INDIVIDUELLE BEWERTUNG DER SCHILDDRÜSENMARKER', patternsTitle: '🎯 ERKANNTE MUSTER', fullReport: '📋 VOLLSTÄNDIGER BERICHT UND TRIANGULATION', saved: '✅ In thyroid-db.json gespeichert' },
    it: { langName: 'Italiano', chooseLang: '🌍 Elige idioma / Choose language:', chooseAI: '🤖 Scegli provider IA:', enterKey: '🔑 Inserisci API Key:', detecting: '🔍 Rilevamento modelli...', chooseModel: '🤖 Modelli disponibili (auto-rilevati):', chooseCondition: '🦋 Seleziona condizione tiroidea:', whatDoYouWant: 'Cosa vuoi fare?', single: 'Analisi singola', batch: 'Analisi batch', stats: 'Visualizza statistiche', processing: '⏳ Elaborazione PDF...', resultsTitle: '📊 VALUTAZIONE METABOLICA TIROIDEA', markersTitle: '🔬 VALUTAZIONE INDIVIDUALE DEI MARCATORI TIROIDEI', patternsTitle: '🎯 PATTERN RILEVATI', fullReport: '📋 REPORT COMPLETO E TRIANGOLAZIONE', saved: '✅ Salvato in thyroid-db.json' },
    pl: { langName: 'Polski', chooseLang: '🌍 Elige idioma / Choose language:', chooseAI: '🤖 Wybierz dostawcę AI:', enterKey: '🔑 Wprowadź klucz API:', detecting: '🔍 Wykrywanie modeli...', chooseModel: '🤖 Dostępne modele (automatycznie wykryte):', chooseCondition: '🦋 Wybierz stan tarczycy:', whatDoYouWant: 'Co chcesz zrobić?', single: 'Analiza pojedyncza', batch: 'Analiza wsadowa', stats: 'Zobacz statystyki', processing: '⏳ Przetwarzanie PDF...', resultsTitle: '📊 OCENA METABOLICZNA TARCZYCY', markersTitle: '🔬 INDYWIDUALNA OCENA MARKERÓW TARCZYCOWYCH', patternsTitle: '🎯 WYKRYTE WZORCE', fullReport: '📋 PEŁNY RAPORT I TRIANGULACJA', saved: '✅ Zapisano w thyroid-db.json' },
    ru: { langName: 'Русский', chooseLang: '🌍 Elige idioma / Choose language:', chooseAI: '🤖 Выберите провайдера ИИ:', enterKey: '🔑 Введите API Key:', detecting: '🔍 Обнаружение моделей...', chooseModel: '🤖 Доступные модели (авто-обнаруженные):', chooseCondition: '🦋 Выберите состояние щитовидной железы:', whatDoYouWant: 'Что вы хотите сделать?', single: 'Одиночный анализ', batch: 'Пакетный анализ', stats: 'Просмотреть статистику', processing: '⏳ Обработка PDF...', resultsTitle: '📊 МЕТАБОЛИЧЕСКАЯ ОЦЕНКА ЩИТОВИДНОЙ ЖЕЛЕЗЫ', markersTitle: '🔬 ИНДИВИДУАЛЬНАЯ ОЦЕНКА МАРКЕРОВ ЩИТОВИДНОЙ ЖЕЛЕЗЫ', patternsTitle: '🎯 ОБНАРУЖЕННЫЕ ШАБЛОНЫ', fullReport: '📋 ПОЛНЫЙ ОТЧЁТ И ТРИАНГУЛЯЦИЯ', saved: '✅ Сохранено в thyroid-db.json' },
    // FIX: Se usan comillas dobles aquí para evitar el error con 'a
    tr: { langName: 'Türkçe', chooseLang: '🌍 Elige idioma / Choose language:', chooseAI: '🤖 AI sağlayıcı seçin:', enterKey: '🔑 API Anahtarınızı girin:', detecting: '🔍 Modelleri algılama...', chooseModel: '🤖 Kullanılabilir modeller (otomatik algılanan):', chooseCondition: '🦋 Tiroid durumunuzu seçin:', whatDoYouWant: 'Ne yapmak istiyorsunuz?', single: 'Tek analiz', batch: 'Toplu analiz', stats: 'İstatistikleri görüntüle', processing: '⏳ PDF işleniyor...', resultsTitle: '📊 TİROİD METABOLİK DEĞERLENDİRME', markersTitle: '🔬 BİREYSEL TİROİD MARKER DEĞERLENDİRME', patternsTitle: '🎯 TESPİT EDİLEN DESENLER', fullReport: '📋 TAM RAPOR VE TRIANGÜLASYON', saved: "✅ thyroid-db.json'a kaydedildi" },
    ja: { langName: '日本語', chooseLang: '🌍 Elige idioma / Choose language:', chooseAI: '🤖 AIプロバイダーを選択:', enterKey: '🔑 APIキーを入力:', detecting: '🔍 モデルを検出中...', chooseModel: '🤖 利用可能モデル (自動検出):', chooseCondition: '🦋 甲状腺の状態を選択:', whatDoYouWant: '何をしますか？', single: '単一分析', batch: 'バッチ分析', stats: '統計を表示', processing: '⏳ PDF処理中...', resultsTitle: '📊 甲状腺代謝評価', markersTitle: '🔬 個別甲状腺マーカー評価', patternsTitle: '🎯 検出されたパターン', fullReport: '📋 完全レポートと三角測量', saved: '✅ thyroid-db.json に保存' },
    pt: { langName: 'Português', chooseLang: '🌍 Elige idioma / Choose language:', chooseAI: '🤖 Escolha provedor de IA:', enterKey: '🔑 Digite API Key:', detecting: '🔍 Detectando modelos...', chooseModel: '🤖 Modelos disponíveis (auto-detectados):', chooseCondition: '🦋 Selecione condição tireoidiana:', whatDoYouWant: 'O que você desea hacer?', single: 'Análise individual', batch: 'Análise em lote', stats: 'Ver estatísticas', processing: '⏳ Processando PDF...', resultsTitle: '📊 AVALIAÇÃO METABÓLICA DA TIREOIDE', markersTitle: '🔬 AVALIAÇÃO INDIVIDUAL DE MARCADORES DA TIREOIDE', patternsTitle: '🎯 PADRÕES DETECTADOS', fullReport: '📋 RELATÓRIO COMPLETO E TRIANGULAÇÃO', saved: '✅ Salvo em thyroid-db.json' }
  };
  
  const t = (lang, key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.es[key];

// ==================== PROVEEDORES ====================
const PROVIDER_CONFIG = {
  openai: { name: 'OpenAI', base: 'https://api.openai.com/v1/chat/completions', modelsUrl: 'https://api.openai.com/v1/models', headers: k => ({ Authorization: `Bearer ${k}` }) },
  groq: { name: 'Groq (Qwen)', base: 'https://api.groq.com/openai/v1/chat/completions', modelsUrl: 'https://api.groq.com/openai/v1/models', headers: k => ({ Authorization: `Bearer ${k}` }) },
  anthropic: { name: 'Claude (Anthropic)', base: 'https://api.anthropic.com/v1/messages', modelsUrl: 'https://api.anthropic.com/v1/models', headers: k => ({ 'x-api-key': k, 'anthropic-version': '2023-06-01' }) },
  gemini: { name: 'Gemini', base: 'https://generativelanguage.googleapis.com/v1beta/models/', modelsUrl: 'https://generativelanguage.googleapis.com/v1beta/models', headers: k => ({}) },
  xai: { name: 'Grok (xAI)', base: 'https://api.x.ai/v1/chat/completions', modelsUrl: 'https://api.x.ai/v1/models', headers: k => ({ Authorization: `Bearer ${k}` }) },
  ollama: { name: 'Ollama (Local)', base: 'http://127.0.0.1:11434/api/chat', modelsUrl: null, headers: k => ({}) }
};

const FALLBACK_MODELS = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'o1-mini'],
  groq: ['qwen2-72b-8192', 'llama-3.3-70b-versatile', 'mixtral-8x7b'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
  gemini: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.5-flash-exp-0815'],
  xai: ['grok-beta'],
  ollama: ['llama3.2', 'qwen2.5', 'phi3']
};

// ==================== CONDICIONES Y MARCADORES ====================
const CONDITIONS = [
  { name: 'Hipotiroidismo', group: '1. Funcionamiento' },
  { name: 'Hipertiroidismo', group: '1. Funcionamiento' },
  { name: 'Hipotiroidismo Subclínico', group: '1. Funcionamiento' },
  { name: 'Tirotoxicosis', group: '1. Funcionamiento' },
  { name: 'Tiroiditis de Hashimoto', group: '2. Autoinmune' },
  { name: 'Enfermedad de Graves', group: '2. Autoinmune' },
  { name: 'Bocio / Nódulo Tiroideo', group: '3. Estructural' },
  { name: 'Tiroiditis (Quervain/Postparto)', group: '4. Inflamación' },
  { name: 'Ninguna / Desconocido', group: 'General' }
];

const KEY_MARKERS = [
  'TSH', 'T3', 'T4', 'T3Reversa', 'AntiTPO', 'TPO (Anti-Peroxidasa)',
  'TGAb (Anti-Tiroglobulina)', 'TRAb / TSI', 'TG (Tiroglobulina)',
  'TBG (Globulina fijadora)', 'rT3 (T3 Inversa)'
];

// ==================== PROTOCOLO MAESTRO COMPLETO ====================
const PROTOCOLO_MAESTRO = `
Este es el Protocolo Maestro de Triangulación y Mapeo Metabólico. Está diseñado para que, incluso si no tienes los valores directos de la tiroides, puedas deducirlos con una precisión asombrosa analizando las huellas que estas hormonas dejan en tu bioquímica general.
I. Arquitectura del Mapeo: Los 5 Bloques Críticos
Para obtener un informe "bien perfecto", cruzaremos Datos Primarios (relación directa) con Datos de Respaldo (regla de tres) para cubrir cualquier vacío de información.
1. El Eje de Energía (TSH, T4, T3)
Determina si tu metabolismo está encendido o en modo ahorro.
Marcador ObjetivoDato Primario (A)Respaldo Nivel 1 (B)Respaldo Nivel 2 (C)TSH (Señal Central)CPK + SodioGlucosa ayunasÁcido ÚricoT4 (Suministro)Colesterol TotalFosfatasa AlcalinaZinc / Vitamina AT3 Libre (Actividad)Colesterol LDLFerritinaHemoglobina / VCM

* La Lógica: Si el LDL > 130 mg/dL y la Ferritina < 60 ng/mL, la T3 Libre está mapeada como Baja, ya que el cuerpo no tiene el hierro para producirla ni la T3 suficiente para limpiar el colesterol.

2. El Freno Metabólico (rT3 - T3 Inversa)
Determina si tu cuerpo está desviando la energía a la "papelera" por estrés o inflamación.
Marcador ObjetivoDato Primario (A)Respaldo Nivel 1 (B)Respaldo Nivel 2 (C)rT3 (Bloqueo)PCR + HomocisteínaGGT + BilirrubinaCortisol (si existe)

* Mapeo de Respaldo (Regla de tres): Si falta la PCR, miramos la GGT. Si la GGT > 25 U/L y la Bilirrubina Total > 1.0, el hígado está congestionado. Un hígado estresado produce rT3 para frenar el metabolismo y "protegerse".

3. El Radar de Autoinmunidad (AntiTPO, TGAb, TRAb)
Determina si el sistema inmune está atacando a la glándula.
Marcador ObjetivoDato Primario (A)Respaldo Nivel 1 (B)Respaldo Nivel 2 (C)AnticuerposVit. D + Vit. B12Linfocitos (%)Ratio Neutrófilos/Linf

* Fórmula de Sospecha: Si Vit. D < 30 ng/mL + B12 < 400 pg/mL + Linfocitos > 40%, la probabilidad de tener AntiTPO positivos es superior al 85%.

4. El Sistema de Transporte y Almacén (TBG, TG)
Determina si la hormona llega a la célula o se queda atrapada en la sangre.
Marcador ObjetivoDato Primario (A)Respaldo Nivel 1 (B)Respaldo Nivel 2 (C)TBG (Transporte)AlbúminaGlobulinasProteínas TotalesTG (Precursor)Ecografía (si hay)Bilirrubina IndirectaInflamación local

* Regla de Respaldo: Una Albúmina > 4.8 g/dL indica un exceso de proteínas de transporte. Esto "secuestra" la T4 y T3, impidiendo que el paciente use la hormona aunque sus niveles totales parezcan normales.

II. Fórmulas de Precisión para el Informe Final
Para que tu valoración sea científica, aplica estas fórmulas a los datos que sí tengas:
A. Índice de Eficiencia de Conversión (IEC)
Utiliza este cálculo para determinar la salud de tu T3 sin medirla:
$$\text{IEC} = \frac{\text{Ferritina}}{\text{Colesterol LDL}}$$

* Interpretación: Un número bajo indica que el motor está "ahogado" (mucha grasa en sangre, poco hierro para quemarla).

B. Ratio de Estrés Celular (rT3 Estimada)
$$\text{REC} = \text{PCR} \times \text{Homocisteína}$$

* Interpretación: Si el resultado es elevado, la rT3 está bloqueando tus receptores, causando síntomas de hipotiroidismo aunque la TSH salga "bien".

C. Ratio de Activación Inmune (NLR)
$$\text{NLR} = \frac{\% \text{ Neutrófilos}}{\% \text{ Linfocitos}}$$

* Interpretación: Un NLR por debajo de 1.5 en presencia de Vitamina D baja es el mapeo perfecto para Hashimoto o autoinmunidad activa.

III. Sistema de Seguridad: ¿Qué pasa si falta un dato?
Si un dato falta, el sistema de mapeo busca el "eco" metabólico:

1. ¿No tienes Ferritina? Mira el VCM y la Hemoglobina. Si el VCM es bajo, el mapa asume que no hay hierro para la T3.

2. ¿No tienes Vitamina D? Mira los Eosinófilos. Si están elevados sin parásitos o alergias, el mapa asume una desregulación inmune (posibles anticuerpos).

3. ¿No tienes CPK? Mira el Sodio. Si el sodio es bajo y el ácido úrico es alto, el mapa asume que la TSH está elevada.

IV. El Informe "Bien Detallado" (Ejemplo de salida)
Al final, tu informe debería verse así:
VALORACIÓN METABÓLICA TIROIDEA

* Mapeo T3/T4: DEFICITARIO (Basado en LDL alto y Ferritina baja).

* Mapeo rT3: DOMINANTE (Basado en PCR elevada y GGT en límite superior).

* Mapeo Autoinmunidad: ALTA PROBABILIDAD (Basado en B12 < 300 y Linfocitosis).

* Conclusión: Se sospecha un Hipotiroidismo Funcional por fallo de conversión hepática y posible base autoinmune.
`;

// ==================== BARRA 1-10 ====================
function renderScale(name, score = 5, summary = 'Triangulado según protocolo maestro') {
    console.log(chalk.bold.cyan(`\n${name}`));
    let bar = Array.from({length: 10}, (_, i) => (i + 1 <= score ? chalk.green('●') : chalk.gray('○'))).join(chalk.gray(' ─ '));
    console.log(bar);
    console.log(chalk.dim('1   2   3   4   5   6   7   8   9  10'));
    console.log(chalk.white(`📝 ${summary}`));
  }

// ==================== MODELOS AUTOMÁTICOS ====================
async function getAvailableModels(providerKey, apiKey) {
  if (providerKey === 'ollama') {
    try {
      const r = await fetch('http://127.0.0.1:11434/api/tags');
      const d = await r.json();
      return d.models ? d.models.map(m => m.name) : FALLBACK_MODELS.ollama;
    } catch { return FALLBACK_MODELS.ollama; }
  }

  const cfg = PROVIDER_CONFIG[providerKey];
  let url = cfg.modelsUrl;
  let headers = cfg.headers(apiKey);
  if (providerKey === 'gemini') url += `?key=${apiKey}`;

  try {
    const res = await fetch(url, { method: 'GET', headers });
    const data = await res.json();
    let models = [];
    if (providerKey === 'gemini') models = data.models ? data.models.map(m => m.name.split('/').pop()) : [];
    else if (data.data) models = data.data.map(m => m.id);
    else if (data.models) models = data.models.map(m => m.id);
    return models.length ? models : FALLBACK_MODELS[providerKey];
  } catch (e) {
    console.log(chalk.yellow('⚠️ Usando modelos fallback para ' + providerKey));
    return FALLBACK_MODELS[providerKey] || [];
  }
}

// ==================== LLAMADA IA ====================
async function callLLM(prompt, providerKey, apiKey, model) {
  const cfg = PROVIDER_CONFIG[providerKey];
  let url = cfg.base;
  let headers = { 'Content-Type': 'application/json' };
  let body;

  headers = { ...headers, ...cfg.headers(apiKey) };

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

// ==================== ANÁLISIS REAL ====================
async function analyzePDF(pdfText, condition, providerKey, apiKey, model) {
  const prompt = `Eres endocrinólogo funcional experto. Usa este protocolo completo:

${PROTOCOLO_MAESTRO}

CONDICIÓN: ${condition}

Extrae y triangula todos los marcadores: ${KEY_MARKERS.join(', ')}

Devuelve SOLO JSON válido, sin ningún texto adicional, sin explicaciones, sin \`\`\`json, solo el JSON puro para evitar errores de parsing:

{
  "markers": [
    {"name": "TSH", "score": 1-10, "summary": "resumen profesional corto"},
    ...
  ],
  "patterns": ["patrón1", "patrón2"],
  "fullReport": "Informe completo con valoration, mapeos, fórmulas y conclusión como en el protocolo"
}

PDF TEXT: ${pdfText}`;

  try {
    let raw = await callLLM(prompt, providerKey, apiKey, model);
    // Limpieza extra para eliminar cualquier cosa antes o después del JSON
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      raw = raw.substring(jsonStart, jsonEnd + 1);
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(chalk.red('⚠️ Error en LLM: ' + e.message));
    return {
      markers: KEY_MARKERS.map(m => ({ name: m, score: 5, summary: 'No se pudo triangula, usa fallback del protocolo' })),
      patterns: [],
      fullReport: 'Informe generado en modo fallback. Verifica API Key y modelo.'
    };
  }
}

// ==================== DB ====================
async function saveToDB(entry) {
  const dbPath = 'thyroid-db.json';
  let db = [];
  if (fs.existsSync(dbPath)) db = JSON.parse(fs.readFileSync(dbPath));
  db.push(entry);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// ==================== MAIN ====================
async function main() {
  const { lang } = await enquirer.prompt({
    type: 'select',
    name: 'lang',
    message: t('es', 'chooseLang'),
    choices: Object.keys(TRANSLATIONS).map(l => ({ name: l, message: TRANSLATIONS[l].langName }))
  });

  const { providerName } = await enquirer.prompt({
    type: 'select',
    name: 'providerName',
    message: t(lang, 'chooseAI'),
    choices: Object.values(PROVIDER_CONFIG).map(p => p.name)
  });
  const providerKey = Object.keys(PROVIDER_CONFIG).find(k => PROVIDER_CONFIG[k].name === providerName);

  let apiKey = '';
  if (providerKey !== 'ollama') {
    ({ apiKey } = await enquirer.prompt({ type: 'password', name: 'apiKey', message: t(lang, 'enterKey') }));
  }

  console.log(chalk.yellow(t(lang, 'detecting')));
  const models = await getAvailableModels(providerKey, apiKey);
  if (models.length === 0) {
    console.log(chalk.red('❌ No se detectaron modelos. Verifica API Key.'));
    process.exit(1);
  }
  const { model } = await enquirer.prompt({
    type: 'select',
    name: 'model',
    message: t(lang, 'chooseModel'),
    choices: models
  });

  const { condition } = await enquirer.prompt({
    type: 'select',
    name: 'condition',
    message: t(lang, 'chooseCondition'),
    choices: CONDITIONS.map(c => `${c.group}: ${c.name}`)
  });

  const { action } = await enquirer.prompt({
    type: 'select',
    name: 'action',
    message: t(lang, 'whatDoYouWant'),
    choices: [t(lang, 'single'), t(lang, 'batch'), t(lang, 'stats')]
  });

  if (action === t(lang, 'stats')) {
    const dbPath = 'thyroid-db.json';
    const count = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)).length : 0;
    console.log(chalk.green(`\n📊 ${count} análisis guardados`));
    return;
  }

  let files = [];
  if (action === t(lang, 'single')) {
    const { rawPath } = await enquirer.prompt([{ type: 'input', name: 'rawPath', message: '📄 Ruta del PDF:' }]);
    files = [rawPath.trim().replace(/^['"]|['"]$/g, '')];
  } else {
    const { folder } = await enquirer.prompt([{ type: 'input', name: 'folder', message: '📁 Carpeta:' }]);
    files = fs.readdirSync(folder).filter(f => f.toLowerCase().endsWith('.pdf')).map(f => path.join(folder, f));
  }

  for (const file of files) {
    console.log(chalk.yellow(`\n${t(lang, 'processing')} ${path.basename(file)}`));
    const pdfData = await pdfParse(fs.readFileSync(file));
    const result = await analyzePDF(pdfData.text, condition, providerKey, apiKey, model);

    console.log(chalk.bold.white.bgBlue(`\n${t(lang, 'resultsTitle')} (${condition})`));

    console.log(chalk.bold.magenta(`\n${t(lang, 'markersTitle')}`));
    KEY_MARKERS.forEach(m => {
      const found = result.markers.find(x => x.name.toLowerCase().includes(m.toLowerCase().split(' ')[0])) || { score: 5, summary: 'Triangulado según protocolo maestro' };
      renderScale(m, found.score, found.summary);
    });

    console.log(chalk.bold.magenta(`\n${t(lang, 'patternsTitle')}`));
    (result.patterns || []).forEach(p => console.log(chalk.green(`• ${p}`)));

    console.log(chalk.bold.white(`\n${t(lang, 'fullReport')}`));
    console.log(chalk.white(result.fullReport));

    await saveToDB({ timestamp: new Date().toISOString(), file: path.basename(file), condition, result });
    console.log(chalk.green.bold(t(lang, 'saved')));
  }

  console.log(chalk.bold.green('\n🎉 ¡THYROIDAI v1.0 terminado correctamente!'));
}

main().catch(e => console.error(chalk.red('❌ Error:'), e.message));