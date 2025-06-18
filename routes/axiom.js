const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/:mint", async (req, res) => {
  const { mint } = req.params;

  try {
    // Получение основной информации о токене
    const tokenRes = await axios.get(`https://api.axion.trade/api/token/${mint}`);
    const tokenData = tokenRes.data;

    if (!tokenData || !tokenData.symbol) {
      return res.status(404).json({ error: "Token not found on Axiom." });
    }

    // Получение последних трейдов
    const tradesRes = await axios.get(`https://api.axion.trade/api/trades/${mint}?limit=20`);
    const trades = tradesRes.data || [];

    // Подсчёт buy/sell
    let buyCount = 0;
    let sellCount = 0;
    trades.forEach(t => {
      if (t.type === "buy") buyCount++;
      else if (t.type === "sell") sellCount++;
    });

    // Ответ
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
    res.status(500).json({ error: "Failed to fetch data from Axiom API." });
  }
});

module.exports = router;
