import express from "express";
import dotenv from "dotenv";
import { Connection } from "@solana/web3.js";
import orcaSdk from "@orca-so/sdk";

dotenv.config();

const router = express.Router();
const { getOrca, getTokenByMint } = orcaSdk;

const RPC_URL = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const connection = new Connection(RPC_URL, "confirmed");

router.get("/", async (req, res) => {
  try {
    const mint = req.query.mint;
    if (!mint) {
      return res.status(400).json({ error: "Missing mint parameter" });
    }

    const orca = getOrca(connection);
    const sol = orca.getToken("SOL");
    const token = getTokenByMint(mint);

    let pool;
    try {
      pool = await orca.getPool(sol, token);
    } catch {
      try {
        pool = await orca.getPool(token, sol);
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
