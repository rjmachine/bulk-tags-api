// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let submissions = [];

app.post('/submit', (req, res) => {
  try {
    const { color, tags } = req.body;

    if (!color || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const record = {
      id: Date.now(),
      color,
      tags,
      date: new Date()
    };

    submissions.push(record);

    console.log('Received submission:', record);

    res.status(200).json({ success: true, record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
