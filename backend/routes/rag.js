const express = require('express');
const router = express.Router();
const { ragQuery } = require('../services/rag');

// POST /api/rag/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const { reply, visualization } = await ragQuery(message.trim(), Array.isArray(history) ? history : []);
    res.json({ reply, visualization });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
