import fs from 'fs';

let backend = process.env.BACKEND || 'none';
let model = null;

export async function initModel() {
  backend = process.env.BACKEND || 'none';
  console.log('Selected backend:', backend);

  if (backend === 'xenova') {
    // @xenova/transformers (pure-JS / WASM) integration
    try {
      const { pipeline } = await import('@xenova/transformers');
      const modelName = process.env.MODEL || 'gpt2';
      console.log('Loading xenova model:', modelName);
      model = await pipeline('text-generation', modelName, { task: 'text-generation' });
      console.log('xenova pipeline ready');
      return;
    } catch (e) {
      console.warn('Failed to load @xenova/transformers:', e.message || e);
    }
  }

  if (backend === 'llama') {
    // llama-cpp-node integration (native binding to llama.cpp)
    try {
      const Llama = await import('llama-cpp-node');
      const modelPath = process.env.MODEL_PATH || './models/ggml-model.bin';
      if (!fs.existsSync(modelPath)) {
        throw new Error(`Model file not found at ${modelPath}. Please download a ggml-quantized model and set MODEL_PATH or put it under ./models/`);
      }
      console.log('Loading llama-cpp-node model from', modelPath);
      // Try common constructor shapes
      if (Llama.default) {
        // ESM default export
        model = new Llama.default({ model: modelPath });
      } else if (typeof Llama === 'function') {
        model = new Llama({ model: modelPath });
      } else if (Llama.Llama) {
        model = new Llama.Llama({ model: modelPath });
      } else {
        model = Llama;
      }
      console.log('llama-cpp-node object created (shape may vary).');
      return;
    } catch (e) {
      console.warn('Failed to load llama-cpp-node:', e.message || e);
    }
  }

  // Fallback: simple rule-based/echo bot
  console.warn('No supported backend available — falling back to a simple echo bot. To use a real model, set BACKEND to "xenova" or "llama" and follow README instructions.');
  model = null;
}

async function tryXenovaGenerate(prompt, opts) {
  // model as xenova pipeline function
  const max_new_tokens = opts?.max_tokens || 128;
  const out = await model(prompt, { max_new_tokens });
  // xenova returns an array of results
  if (Array.isArray(out) && out[0] && out[0].generated_text) return out[0].generated_text;
  if (Array.isArray(out) && out[0] && out[0].text) return out[0].text;
  if (out && out.generated_text) return out.generated_text;
  return String(out);
}

async function tryLlamaGenerate(prompt, opts) {
  // llama-cpp-node may expose different APIs depending on version
  const max_tokens = opts?.max_tokens || 128;
  // common shapes:
  // - model.createCompletion({ prompt, max_tokens }) -> { text }
  // - model.generate(prompt, { max_new_tokens }) -> [{ generated_text }]

  if (typeof model.createCompletion === 'function') {
    const res = await model.createCompletion({ prompt, max_tokens });
    if (res.text) return res.text;
    if (res.choices && res.choices[0] && res.choices[0].text) return res.choices[0].text;
    return JSON.stringify(res);
  }

  if (typeof model.generate === 'function') {
    const out = await model.generate(prompt, { max_new_tokens: max_tokens });
    if (Array.isArray(out) && out[0] && out[0].generated_text) return out[0].generated_text;
    if (out && out.generated_text) return out.generated_text;
    return JSON.stringify(out);
  }

  // As a last resort, if model is a callable function
  if (typeof model === 'function') {
    const out = await model(prompt);
    if (Array.isArray(out) && out[0] && out[0].generated_text) return out[0].generated_text;
    if (out && typeof out === 'object' && (out.text || out.generated_text)) return out.text || out.generated_text;
    return String(out);
  }

  throw new Error('Unrecognized llama model interface');
}

export async function generate(prompt, opts = {}) {
  if (!model) {
    // Very small heuristic chatbot fallback
    const p = prompt.toLowerCase().trim();
    if (p === 'hi' || p === 'hello' || p === '안녕') return '안녕하세요! 무엇을 도와드릴까요?';
    if (p.includes('시간')) return `현재 시간은 ${new Date().toLocaleString()} 입니다.`;
    return `에코: ${prompt}`;
  }

  // Try xenova
  try {
    if (process.env.BACKEND === 'xenova') return await tryXenovaGenerate(prompt, opts);
  } catch (e) {
    console.warn('xenova generation failed:', e.message || e);
  }

  // Try llama
  try {
    if (process.env.BACKEND === 'llama') return await tryLlamaGenerate(prompt, opts);
  } catch (e) {
    console.warn('llama generation failed:', e.message || e);
  }

  // Generic best-effort
  if (typeof model === 'function') {
    const out = await model(prompt);
    if (typeof out === 'string') return out;
    if (Array.isArray(out) && out[0] && out[0].generated_text) return out[0].generated_text;
    if (out && out.text) return out.text;
    return JSON.stringify(out);
  }

  return `에코: ${prompt}`;
}
