import express from "express";
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

    const largestAccounts = await connection.getTokenLargestAccounts(
      new PublicKey(mint)
    );

    const holdersCount = largestAccounts.value.length;

    res.json({ mint, holdersCount });
  } catch (err) {
    console.error("Ошибка в holders-count:", err);
    res.status(500).json({ error: "Failed to fetch holders count" });
  }
});

export default router;
