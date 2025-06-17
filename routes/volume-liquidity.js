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

    const reserves = await pool.getReserves();

    const decimalsA = tokenA.scale;
    const decimalsB = tokenB.scale;

    const isMintTokenA = tokenA.mint.equals(new PublicKey(mint));

    const volume = isMintTokenA
      ? reserves.reserveA.toNumber() / 10 ** decimalsA
      : reserves.reserveB.toNumber() / 10 ** decimalsB;

    const liquidity = isMintTokenA
      ? reserves.reserveB.toNumber() / 10 ** decimalsB
      : reserves.reserveA.toNumber() / 10 ** decimalsA;

    res.json({ volume, liquidity });
  } catch (error) {
    console.error("Error in volume-liquidity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

function getPoolConfigKeyByMint(mint) {
  const mapping = {
    "So11111111111111111111111111111111111111112": OrcaPoolConfig.SOL_USDC,
    // Добавь сюда другие пары
  };
  return mapping[mint] || null;
}

export default router;
