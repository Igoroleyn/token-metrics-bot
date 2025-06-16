import express from "express";
import { Connection, PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const connection = new Connection(process.env.RPC_URL, "confirmed");

router.get("/", async (req, res) => {
  const { mint } = req.query;

  if (!mint) {
    return res.status(400).json({ error: "Missing mint parameter" });
  }

  try {
    const mintPubkey = new PublicKey(mint);

    // Получаем токен-аккаунты по mint
    const accounts = await connection.getProgramAccounts(
      new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), // SPL Token Program
      {
        filters: [
          { dataSize: 165 },
          { memcmp: { offset: 0, bytes: mint } }
        ]
      }
    );

    const holdersCount = accounts.length;

    // Для примера — volume заглушка
    const volume = 1000;
    const ratio = (volume / holdersCount).toFixed(2);

    res.json({ holdersCount, volume, ratio });
  } catch (err) {
    console.error("Error in /volume-holders:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
