require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const orders = new Map(); // sessionId -> array of color batches

function getSession(req) {
  return req.headers["x-session-id"] || "demo-session";
}

app.post("/add-color", (req, res) => {
  const session = getSession(req);
  const { colorName, colorHex, tags } = req.body;

  if (!orders.has(session)) orders.set(session, []);
  orders.get(session).push({ colorName, colorHex, tags });

  res.json({ success: true });
});

app.get("/summary", (req, res) => {
  const session = getSession(req);
  res.json(orders.get(session) || []);
});

app.post("/finalize", async (req, res) => {
  const session = getSession(req);
  const batches = orders.get(session) || [];

  if (!batches.length) {
    return res.status(400).json({ error: "No data" });
  }

  // Email (optional now)
  if (process.env.EMAIL_TO) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const text = JSON.stringify(batches, null, 2);

    await transporter.sendMail({
      from: "orders@yourdomain.com",
      to: process.env.EMAIL_TO,
      subject: "New Bulk Tag Order",
      text
    });
  }

  orders.delete(session);

  res.json({ success: true, batches });
});

app.get("/", (req, res) => {
  res.send("Bulk Tags API running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running on", PORT));
