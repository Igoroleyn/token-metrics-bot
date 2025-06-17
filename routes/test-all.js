import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const endpoints = [
  "/api/getprice-orca",
  "/api/volume-liquidity",
  "/api/volume-holders",
  "/api/holders-growth",
  "/api/unique-traders"
];

router.post("/", async (req, res) => {
  const { mint } = req.body;
  if (!mint) return res.status(400).json({ error: "Missing mint" });

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mint })
      });

      const json = await response.json();
      results.push({ endpoint, status: response.status, result: json });
    } catch (err) {
      results.push({ endpoint, error: err.message });
    }
  }

  res.json({ tested: results });
});

export default router;
