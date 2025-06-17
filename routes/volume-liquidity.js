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
        const reserves = await pool.getReserves();

        const decimalsA = tokenA.scale;
        const decimalsB = tokenB.scale;

        const isMintTokenA = tokenA.mint.toBase58() === mint;

        const volume = isMintTokenA
          ? reserves.reserveA.toNumber() / 10 ** decimalsA
          : reserves.reserveB.toNumber() / 10 ** decimalsB;

        const liquidity = isMintTokenA
          ? reserves.reserveB.toNumber() / 10 ** decimalsB
          : reserves.reserveA.toNumber() / 10 ** decimalsA;

        return res.json({ volume, liquidity });
      }
    }

    res.status(404).json({ error: "Pool not found for given mint" });
  } catch (error) {
    console.error("Error in volume-liquidity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
