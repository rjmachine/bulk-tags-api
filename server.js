import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------
// Middleware
// --------------------
app.use(cors());
app.use(express.json());

// --------------------
// Submit endpoint
// --------------------
app.post("/submit", (req, res) => {
  console.log("Submit endpoint hit");
  res.json({ success: true });
});

// --------------------
// Add to cart endpoint (debug-ready)
// --------------------
app.post("/add-to-cart", async (req, res) => {
  console.log("Add to cart endpoint hit");

  try {
    const { submissions } = req.body;

    if (!submissions || !submissions.length) {
      return res.status(400).json({ success: false, error: "No submissions provided" });
    }

    const apiKey = process.env.SQUARESPACE_API_KEY;
    const productId = process.env.BULK_TAG_PRODUCT_ID;

    if (!apiKey || !productId) {
      console.error("Missing env vars");
      return res.status(500).json({ success: false, error: "Missing environment variables" });
    }

    for (const s of submissions) {
      for (const tag of s.tags) {

        const payload = {
          lineItems: [
            {
              productId: productId, // if your product is a variant, use variantId instead
              quantity: 1
            }
          ]
        };

        console.log("Payload being sent to Squarespace:", JSON.stringify(payload));

        const response = await fetch(
          "https://api.squarespace.com/1.0/commerce/cart", // updated endpoint
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          }
        );

        const text = await response.text();
        console.log("Response
