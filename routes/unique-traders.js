import express from "express";
import { getRotatingConnection } from "../utils/rpc-connection.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { mint } = req.body;
  if (!mint) return res.status(400).json({ error: "Missing mint" });

  try {
    const connection = getRotatingConnection();
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutesAgo = now - 300;

    const sigs = await connection.getSignaturesForAddress(
      new PublicKey(mint),
      { limit: 1000 }
    );

    const filteredSigs = sigs.filter(sig => (sig.blockTime || 0) >= fiveMinutesAgo);

    const uniqueWallets = new Set();

    for (const sig of filteredSigs) {
      const tx = await connection.getTransaction(sig.signature, { maxSupportedTransactionVersion: 0 });
      if (!tx || !tx.transaction || !tx.meta) continue;

      const accounts = tx.transaction.message.accountKeys.map(k => k.toBase58());
      accounts.forEach(acc => {
        if (acc !== mint) {
          uniqueWallets.add(acc);
        }
      });
    }

    res.json({ uniqueTraders: uniqueWallets.size });
  } catch (error) {
    console.error("Error in unique-traders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
