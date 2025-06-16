// routes/unique-traders.js
import express from "express";
import { Connection, PublicKey } from "@solana/web3.js";
import { getOrca, OrcaPoolConfig } from "@orca-so/sdk";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const RPC_URL = process.env.RPC_URL;
const connection = new Connection(RPC_URL, "confirmed");

router.get("/", async (req, res) => {
  const mint = req.query.mint;
  if (!mint) return res.status(400).json({ error: "Mint not provided" });

  try {
    const orca = getOrca(connection);
    const poolEntries = Object.entries(OrcaPoolConfig);

    let poolConfig;
    for (const [_, config] of poolEntries) {
      const pool = await orca.getPool(config);
      const tokenA = pool.getTokenA();
      const tokenB = pool.getTokenB();
      if (tokenA.mint.toBase58() === mint || tokenB.mint.toBase58() === mint) {
        poolConfig = config;
        break;
      }
    }

    if (!poolConfig) return res.status(404).json({ error: "Pool not found for token" });

    const pool = await orca.getPool(poolConfig);
    const now = Date.now();
    const startTime = now - 5 * 60 * 1000;

    const signatures = await connection.getSignaturesForAddress(pool.getAddress(), { limit: 100 });

    const uniqueTraders = new Set();

    for (const sig of signatures) {
      const tx = await connection.getParsedTransaction(sig.signature, "confirmed");
      if (!tx || !tx.meta || !tx.transaction || !tx.blockTime) continue;
      const timestamp = tx.blockTime * 1000;
      if (timestamp < startTime) continue;

      const accounts = tx.transaction.message.accountKeys.map(acc => acc.pubkey.toBase58());

      for (const acc of accounts) {
        if (!acc.startsWith("111111") && acc !== pool.getAddress().toBase58()) {
          uniqueTraders.add(acc);
        }
      }
    }

    res.json({ uniqueTraders: uniqueTraders.size });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get unique traders" });
  }
});

export default router;
