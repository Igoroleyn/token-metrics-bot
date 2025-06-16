// routes/unique-traders.js
import express from "express";
import { Connection, PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const connection = new Connection(process.env.RPC_URL, "confirmed");

router.get("/", async (req, res) => {
  const { mint } = req.query;
  if (!mint) return res.status(400).json({ error: "Missing mint param" });

  try {
    const mintKey = new PublicKey(mint);
    const now = Date.now();
    const cutoff = now - 5 * 60 * 1000; // 5 минут назад

    // Получаем все подписи по mint-адресу
    const signatures = await connection.getSignaturesForAddress(mintKey, { limit: 100 });
    const recent = signatures.filter(sig => sig.blockTime && sig.blockTime * 1000 >= cutoff);

    const uniqueTraders = new Set();

    for (const sig of recent) {
      const tx = await connection.getParsedTransaction(sig.signature);
      if (!tx || !tx.meta || !tx.transaction) continue;

      const accounts = tx.transaction.message.accountKeys.map(k => k.pubkey.toString());
      for (const acc of accounts) uniqueTraders.add(acc);
    }

    res.json({ uniqueTraders: uniqueTraders.size });
  } catch (err) {
    console.error("/unique-traders error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
