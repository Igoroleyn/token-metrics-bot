import express from "express";
import { getOrcaPoolReserves } from "./getOrcaPoolInfo.js";
import fs from "fs";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const raw = fs.readFileSync("token.json", "utf-8");
    const { mint } = JSON.parse(raw);

    const { volumeInSol, liquidityInSol } = await getOrcaPoolReserves(mint);
    const volumeToLiquidity = liquidityInSol === 0 ? 0 : volumeInSol / liquidityInSol;

    res.json({ volumeInSol, liquidityInSol, volumeToLiquidity });
  } catch (error) {
    console.error("❌ volume-liquidity error:", error.message);
    res.status(500).json({ error: "Failed to get volume/liquidity" });
  }
});

export default router;
