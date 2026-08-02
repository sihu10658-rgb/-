// Simple Express app exposing the echo bot and min-n utility
const express = require('express');
const { respond } = require('./echoBot');
const { minNForTolerance } = require('./minN');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  const message = req.query.message;
  if (typeof message === 'undefined') {
    return res.json({ status: 'ok', info: 'GET /?message=... or POST /message {message}' });
  }
  const reply = respond(String(message));
  res.json({ reply });
});

app.post('/message', (req, res) => {
  const message = req.body && req.body.message;
  if (typeof message === 'undefined') return res.status(400).json({ error: 'missing message' });
  const reply = respond(String(message));
  res.json({ reply });
});

// Utility endpoint: /min-n?x=0.5[&tol=1e-14]
app.get('/min-n', (req, res) => {
  const xRaw = req.query.x;
  const tolRaw = req.query.tol;
  if (typeof xRaw === 'undefined') return res.status(400).json({ error: 'missing x parameter' });
  const x = Number(xRaw);
  if (!isFinite(x)) return res.status(400).json({ error: 'invalid x' });
  const tol = tolRaw ? Number(tolRaw) : 1e-14;
  try {
    const n = minNForTolerance(x, tol);
    res.json({ x, tol, n });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Echo bot app listening on http://localhost:${port}`);
});
