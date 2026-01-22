// server.js
import express from "express";
import cors from "cors";

const app = express();

// Render will provide the port via environment variable
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Endpoint for form submissions
app.post("/submit", (req, res) => {
  console.log("Submit endpoint hit");
  console.log(req.body);

  // You could store submissions here, e.g., in a database or log file
  res.json({ status: "ok", received: req.body });
});

app.listen(PORT, () => {
  console.log(`Bulk Tags backend running on port ${PORT}`);
});
