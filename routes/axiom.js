import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/:mint", async (req, res) => {
  const { mint } = req.params;

  try {
    // Заголовки, чтобы Axiom не отвергал запрос
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    };

    // 1. Получаем основную информацию о токене
    const tokenRes = await axios.get(`https://api.axion.trade/api/token/${mint}`, { headers });
    const tokenData = tokenRes.data;

    if (!tokenData || !tokenData.symbol) {
      return res.status(404).json({ error: "Token not found on Axiom." });
    }

    // 2. Получаем последние трейды
    const tradesRes = await axios.get(`https://api.axion.trade/api/trades/${mint}?limit=20`, { headers });
    const trades = tradesRes.data || [];

    // 3. Подсчёт бай/селл
    let buyCount = 0;
    let sellCount = 0;
    trades.forEach(t => {
      if (t.type === "buy") buyCount++;
      else if (t.type === "sell") sellCount++;
    });

    // 4. Ответ клиенту
    res.json({
      name: tokenData.name,
      symbol: tokenData.symbol,
      mint: tokenData.mint,
      priceUsd: tokenData.price,
      liquidityUsd: tokenData.liquidity,
      volume5mUsd: tokenData.volume_5m,
      holders: tokenData.holders,
      proTraders: tokenData.pro_traders,
      buyCount,
      sellCount,
      trades
    });

  } catch (error) {
    console.error("Axiom API error:", error.message);
    res.status(500).json({
      error: "Failed to fetch data from Axiom API.",
      detail: error.message
    });
  }
});

export default router;
