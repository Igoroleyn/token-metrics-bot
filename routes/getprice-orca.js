const express = require("express");
const router = express.Router();
const { getOrca, getTokenByMint } = require("@orca-so/sdk");
const { Connection, PublicKey } = require("@solana/web3.js");
require("dotenv").config();

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
    } catch (err) {
      try {
        pool = await orca.getPool(tokenA, sol);
      } catch {
        return res.status(404).json({ error: "Orca pool not found for given mint" });
      }
    }

    const price = await pool.getPrice();
    res.json({ mint, price: price.toNumber() });

  } catch (err) {
    console.error("Ошибка в getprice-orca:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
