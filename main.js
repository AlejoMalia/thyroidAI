export const CONFIG = {
    PROVIDERS: {
        openai: { name: 'OpenAI', base: 'https://api.openai.com/v1/chat/completions', headers: k => ({ Authorization: `Bearer ${k}` }) },
        groq: { name: 'Groq', base: 'https://api.groq.com/openai/v1/chat/completions', headers: k => ({ Authorization: `Bearer ${k}` }) },
        anthropic: { name: 'Claude', base: 'https://api.anthropic.com/v1/messages', headers: k => ({ 'x-api-key': k, 'anthropic-version': '2023-06-01' }) },
        gemini: { name: 'Gemini', base: 'https://generativelanguage.googleapis.com/v1beta/models/', headers: k => ({}) },
        ollama: { name: 'Ollama', base: 'http://127.0.0.1:11434/api/chat', headers: k => ({}) }
    },
    // Paste the full MASTER_PROTOCOL text here
    PROTOCOL: `Master Protocol for Triangulation and Metabolic Mapping. Analyze: 1. Energy Axis... [Paste long text here]`
};

export class ThyroidAI {
    constructor({ provider, apiKey, model }) {
        this.provider = provider;
        this.apiKey = apiKey;
        this.model = model;
    }

    async analyze(pdfText, condition = 'General') {
        const prompt = this._buildPrompt(pdfText, condition);
        const rawResponse = await this._callLLM(prompt);
        return this._parseResponse(rawResponse);
    }

    _buildPrompt(text, cond) {
        return `${CONFIG.PROTOCOL}\n\nCONDITION: ${cond}\n\nPDF TEXT: ${text}\n\nReturn ONLY JSON: {"markers": [{"name": "TSH", "score": 8, "summary": "..."}], "patterns": [], "fullReport": "..."}`;
    }

    async _callLLM(prompt) {
        const cfg = CONFIG.PROVIDERS[this.provider];
        let url = cfg.base;
        let body = { model: this.model, messages: [{ role: 'user', content: prompt }] };

        if (this.provider === 'gemini') {
            url += `${this.model}:generateContent?key=${this.apiKey}`;
            body = { contents: [{ parts: [{ text: prompt }] }] };
        } else if (this.provider === 'anthropic') {
            body = { model: this.model, max_tokens: 4000, messages: [{ role: 'user', content: prompt }] };
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...cfg.headers(this.apiKey) },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        
        // Extraction logic based on the provider
        if (this.provider === 'gemini') return data.candidates[0].content.parts[0].text;
        if (this.provider === 'anthropic') return data.content[0].text;
        return data.choices[0].message.content;
    }

    _parseResponse(raw) {
        try {
            const jsonStart = raw.indexOf('{');
            const jsonEnd = raw.lastIndexOf('}');
            return JSON.parse(raw.substring(jsonStart, jsonEnd + 1));
        } catch (e) {
            throw new Error("The AI did not return a valid JSON.");
        }
    }
}