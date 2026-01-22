import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.post("/submit", async (req, res) => {
  try {
    const { itemId, sku, quantity, additionalFields, crumb } = req.body;

    if (!itemId || !quantity || !crumb) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Prepare payload to mimic Squarespace entries endpoint
    const payload = {
      itemId: itemId,
      sku: sku,
      quantity: quantity.toString(),
      additionalFields: additionalFields || null,
      newProductFormRendererEnabled: true
    };

    const response = await fetch(
      `https://www.rjmachine.com/api/commerce/shopping-cart/entries?crumb=${crumb}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": "https://www.rjmachine.com",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify(payload),
        credentials: "include"
      }
    );

    const text = await response.text();
    if (!response.ok) {
      console.error("Squarespace API error:", response.status, text);
      return res.status(response.status).json({ error: "Squarespace API error", text });
    }

    const json = JSON.parse(text);
    console.log("Added to cart:", json);

    res.json(json);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Bulk Tags backend running on port ${PORT}`);
});
