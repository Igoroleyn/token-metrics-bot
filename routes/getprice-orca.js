import express from "express";
import { getRotatingConnection } from "../utils/rpc-connection.js";
import { getOrca, Network } from "@orca-so/sdk";

const router = express.Router();

router.post("/", async (req, res) => {
  const { mint } = req.body;
  if (!mint) return res.status(400).json({ error: "Missing mint" });

  try {
    const connection = getRotatingConnection();
    const orca = getOrca(connection, Network.MAINNET);

    const pools = await orca.getAllPools();

    for (const pool of Object.values(pools)) {
      const tokenA = await pool.getTokenA();
      const tokenB = await pool.getTokenB();

      if (
        tokenA.mint.toBase58() === mint ||
        tokenB.mint.toBase58() === mint
      ) {
        const price = await pool.getTokenPrice(tokenA.mint.toBase58() === mint ? tokenA : tokenB);
        return res.json({ price });
      }
    }

    res.status(404).json({ error: "Pool not found for given mint" });
  } catch (error) {
    console.error("Error in getprice-orca:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
