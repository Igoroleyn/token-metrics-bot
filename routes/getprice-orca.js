import express from "express";
import { getOrca, getTokenByMint } from "@orca-so/sdk";
import { Connection, PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const RPC_URL = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const connection = new Connection(RPC_URL, "confirmed");

router.get("/", async (req, res) => {
  try {
    const mint = req.query.mint;
    if (!mint) {
      return res.status(400).json({ error: "Missing mint parameter" });
    }

    const orca = getOrca(connection);
    const tokenA = getTokenByMint(mint);
    const sol = orca.getToken("SOL");

    let pool;
    try {
      pool = await orca.getPool(sol, tokenA);
    } catch {
      try {
        pool = await orca.getPool(tokenA, sol);
      } catch {
        return res.status(404).json({ error: "Orca pool not found for given mint" });
      }
    }

    const price = await pool.getPrice();
    res.json({ mint, price: price.toNumber() });

  } catch (err) {
    console.error("❌ Ошибка в getprice-orca:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
