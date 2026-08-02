import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initModel, generate } from './model.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

let ready = false;

(async () => {
  try {
    await initModel();
    ready = true;
    console.log('Model initialized.');
  } catch (err) {
    console.error('Model initialization failed:', err);
  }
})();

app.get('/', (req, res) => {
  res.send('Local JS Chatbot is running. POST /chat with {"message":"hi"}');
});

app.post('/chat', async (req, res) => {
  if (!ready) {
    return res.status(503).json({ error: 'model not ready' });
  }
  const message = req.body.message;
  if (!message) return res.status(400).json({ error: 'message is required' });

  try {
    const reply = await generate(message, {
      max_tokens: parseInt(process.env.MAX_TOKENS || '256', 10)
    });
    return res.json({ reply });
  } catch (err) {
    console.error('Generation error:', err);
    return res.status(500).json({ error: 'generation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
