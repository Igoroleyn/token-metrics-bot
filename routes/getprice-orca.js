import express from "express";
import { getRotatingConnection } from "../utils/rpc-connection.js";
import { getOrca, Network, OrcaPoolConfig } from "@orca-so/sdk";
import { PublicKey } from "@solana/web3.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { mint } = req.body;
    if (!mint) return res.status(400).json({ error: "Missing mint" });

    const connection = getRotatingConnection();
    const orca = getOrca(connection, Network.MAINNET);

    const poolConfigKey = getPoolConfigKeyByMint(mint);
    if (!poolConfigKey) return res.status(404).json({ error: "Pool config not found" });

    const pool = orca.getPool(poolConfigKey);

    const tokenA = await pool.getTokenA();
    const tokenB = await pool.getTokenB();

    const price = await pool.getTokenPrice(tokenA.mint.equals(new PublicKey(mint)) ? tokenA : tokenB);

    res.json({ price });
  } catch (error) {
    console.error("Error in getprice-orca:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Здесь укажи маппинг mint к пулу OrcaPoolConfig по реальным данным токена
function getPoolConfigKeyByMint(mint) {
  const mapping = {
    // пример: mint токена => ключ OrcaPoolConfig
    "So11111111111111111111111111111111111111112": OrcaPoolConfig.SOL_USDC,
    // Добавь сюда другие пары
  };

  return mapping[mint] || null;
}

export default router;
