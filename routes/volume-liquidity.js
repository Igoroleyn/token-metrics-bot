import express from "express";
import { getOrcaPoolInfo } from "./getOrcaPoolInfo.js";
import fs from "fs";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const raw = fs.readFileSync("token.json", "utf-8");
    const { mint } = JSON.parse(raw);

    const poolInfo = await getOrcaPoolInfo(mint);

    if (!poolInfo.poolAddress) {
      return res.status(404).json({ error: "Pool not found for this token" });
    }

    // Примерные заглушки:
    const volumeInSol = 123;     // ← сюда потом вставим реальный расчёт
    const liquidityInSol = 456;  // ← сюда тоже

    const volumeToLiquidity =
      liquidityInSol === 0 ? 0 : volumeInSol / liquidityInSol;

    res.json({ volumeInSol, liquidityInSol, ratio: volumeToLiquidity });
  } catch (error) {
    console.error("❌ volume-liquidity error:", error.message);
    res.status(500).json({ error: "Failed to get volume/liquidity" });
  }
});

export default router;
