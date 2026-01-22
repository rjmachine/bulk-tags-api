import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const SQUARESPACE_API_KEY = process.env.SQUARESPACE_API_KEY;
const SITE_ID = process.env.SQUARESPACE_SITE_ID;

app.get("/", (req, res) => {
  res.send("Bulk Tags API running");
});

app.post("/submit", (req, res) => {
  console.log("Submit endpoint hit");
  res.json({ ok: true });
});

app.post("/add-to-cart", async (req, res) => {
  console.log("Add to cart endpoint hit");

  try {
    const { submissions } = req.body;

    if (!Array.isArray(submissions)) {
      return res.status(400).json({ error: "Invalid submissions" });
    }

    const lineItems = submissions.map(item => ({
      productId: item.productId,
      quantity: item.quantity || 1
    }));

    const payload = { lineItems };

    console.log("Payload being sent to Squarespace:", JSON.stringify(payload));

    const response = await fetch(
      `https://api.squarespace.com/1.0/commerce/cart/items?siteId=${SITE_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SQUARESPACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const text = await response.text();

    console.log("Response status:", response.status);
    console.log("Response text:", text);

    if (!response.ok) {
      console.error("Squarespace API error:", text);
      return res.status(500).json({ error: "Squarespace API error" });
    }

    res.json({ success: true });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Bulk Tags backend running on port ${PORT}`);
});
