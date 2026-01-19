require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const { stringify } = require('csv-stringify');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: 'uploads/' });

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate Batch ID
function batchID() {
  return "8W" + Math.floor(100000 + Math.random() * 900000);
}

// POST /api/batch - manual form submission
app.post('/api/batch', async (req, res) => {
  try {
    const { tags, color } = req.body; // tags = array of rows [{line1,line2,line3,line4,note}]
    const id = batchID();

    // Build CSV
    const csvData = [];
    csvData.push(['Line1','Line2','Line3','Line4','Note','Color']);
    tags.forEach(r => {
      csvData.push([r.line1,r.line2,r.line3,r.line4,r.note,color]);
    });

    stringify(csvData, (err, output) => {
      if(err) return res.status(500).json({error: 'CSV generation failed'});
      
      // Email CSV
      transporter.sendMail({
        from: `"R.J. Machine" <no-reply@rjmachine.com>`,
        to: process.env.EMAIL_TO,
        subject: `Bulk Acc Tag Form - ${id}`,
        text: `Attached CSV for Batch ${id}`,
        attachments: [
          { filename: `batch-${id}.csv`, content: output }
        ]
      }, (err, info) => {
        if(err) console.error(err);
      });

      res.json({ batchID: id, totalTags: tags.length, color });
    });

  } catch(err) {
    console.error(err);
    res.status(500).json({error:'Server error'});
  }
});

// POST /api/batch/upload - optional CSV upload
app.post('/api/batch/upload', upload.single('file'), (req,res) => {
  // TODO: parse CSV and return JSON
  res.json({message:'File uploaded', filename:req.file.originalname});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
