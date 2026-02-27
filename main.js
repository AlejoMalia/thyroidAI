// ================================================
// ThyroidAI Core - Main.js
/* ThyroidAI - Alejo Malia . 2026 */
/* "The software code is provided for research purposes under the spirit of the CC BY-NC 4.0 license."*/

// ================================================

import * as pdfjsLib from 'pdfjs-dist/build/pdf.js'; // npm install pdfjs-dist (or use CDN)

// Provider configuration
const PROVIDER_CONFIG = {
    openai: { name: 'OpenAI', base: 'https://api.openai.com/v1/chat/completions', headers: k => ({ Authorization: `Bearer ${k}` }) },
    groq:   { name: 'Groq',   base: 'https://api.groq.com/openai/v1/chat/completions', headers: k => ({ Authorization: `Bearer ${k}` }) },
    anthropic: { name: 'Claude', base: 'https://api.anthropic.com/v1/messages', headers: k => ({ 'x-api-key': k, 'anthropic-version': '2023-06-01' }) },
    gemini: { name: 'Gemini', base: 'https://generativelanguage.googleapis.com/v1beta/models/', headers: () => ({}) },
    xai:    { name: 'Grok',   base: 'https://api.x.ai/v1/chat/completions', headers: k => ({ Authorization: `Bearer ${k}` }) },
    ollama: { name: 'Ollama', base: 'http://127.0.0.1:11434/api/chat', headers: () => ({}) }
};

// MASTER PROTOCOL (The triangulation brain)
const MASTER_PROTOCOL = `You are an elite functional endocrinologist. METABOLIC TRIANGULATION MASTER PROTOCOL v2.1:

1. Pituitary-Thyroid Axis
2. Peripheral conversion (FT3, rT3, ratios)
3. Autoimmunity and transport
4. Optimal functional ranges
5. SPECIFIC IMPACT OF EACH MEDICATION
6. Advanced patterns (Low T3, Reverse T3 dominance, etc.)

Return ONLY this JSON and nothing else:
{
  "markers": [{"name":"TSH","score":8,"summary":"..."}],
  "patterns": ["Poor T4→T3 conversion"],
  "medImpact": "...",
  "triangulation": "...",
  "fullReport": "..."
}`;

export class ThyroidAnalyzer {

    constructor() {
        this.currentMeds = [];
        this.pdfWorkerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        pdfjsLib.GlobalWorkerOptions.workerSrc = this.pdfWorkerSrc;
    }

    // Load saved medications (optional)
    loadMeds() {
        this.currentMeds = JSON.parse(localStorage.getItem('thyroid_meds') || '[]');
    }

    addMed(med) {
        this.currentMeds.push(med);
        localStorage.setItem('thyroid_meds', JSON.stringify(this.currentMeds));
    }

    clearMeds() {
        this.currentMeds = [];
        localStorage.removeItem('thyroid_meds');
    }

    // Extract text from PDF
    async extractPDFText(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            fullText += content.items.map(item => item.str).join(' ') + '\n';
        }
        return fullText;
    }

    // AI model call
    async callAI(prompt, config) {
        const cfg = PROVIDER_CONFIG[config.provider];
        let url = cfg.base;
        let body;

        if (config.provider === 'gemini') {
            url += `${config.model}:generateContent?key=${config.key}`;
            body = { contents: [{ parts: [{ text: prompt }] }] };
        } else if (config.provider === 'ollama') {
            body = { model: config.model, messages: [{ role: 'user', content: prompt }] };
        } else {
            body = { model: config.model, messages: [{ role: 'user', content: prompt }], stream: false };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...cfg.headers(config.key)
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        let rawText;
        if (config.provider === 'gemini') {
            rawText = data.candidates[0].content.parts[0].text;
        } else if (config.provider === 'ollama') {
            rawText = data.message.content;
        } else {
            rawText = data.choices[0].message.content;
        }

        // Extract JSON even if the model adds extra text
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    }

    // === MAIN FUNCTION FOR END USERS/DEVELOPERS ===
    async analyze({
        pdfFile,
        condition,
        aiConfig,           // { provider, key, model }
        language = 'en'
    }) {
        if (!pdfFile) throw new Error('PDF file is required');

        const pdfText = await this.extractPDFText(pdfFile);
        const medsStr = this.currentMeds.length 
            ? JSON.stringify(this.currentMeds) 
            : "No medications registered";

        let prompt = MASTER_PROTOCOL + `\n\nPatient status: ${condition}.\nCurrent Medication: ${medsStr}.\nPDF Content: ${pdfText}\nResponse Language: ${language}`;

        const result = await this.callAI(prompt, aiConfig);

        return {
            markers: result.markers || [],
            patterns: result.patterns || [],
            medImpact: result.medImpact || '',
            triangulation: result.triangulation || '',
            fullReport: result.fullReport || '',
            raw: result
        };
    }
}

// ======================== QUICK START ========================

// Developer Example:

// const analyzer = new ThyroidAnalyzer();
// analyzer.loadMeds();

// const result = await analyzer.analyze({
//     pdfFile: myPDFFile,
//     condition: "Hashimoto's Hypothyroidism",
//     aiConfig: {
//         provider: "groq",
//         key: "gsk_xxxxxxxx",
//         model: "llama-3.3-70b-versatile"
//     },
//     language: "en"
// });

// console.log(result);

/* ThyroidAI - Alejo Malia . 2026 */
/* "The software code is provided for research purposes under the spirit of the CC BY-NC 4.0 license."*/
