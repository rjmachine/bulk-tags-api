// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // allow cross-origin requests
app.use(bodyParser.json());

// simple in-memory store
let submissions = [];

app.post('/submit', (req,res) => {
  try {
    const { color, tags } = req.body;
    if (!color || !tags || !tags.length) {
      return res.status(400).send('Color and at least one tag required');
    }
    submissions.push({ color, tags, date: new Date() });
    console.log('Received submission:', color, tags);
    res.status(200).send('Submission received successfully');
  } catch(err) {
    console.error(err);
    res.status(500).send('Server error: ' + err.message);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
