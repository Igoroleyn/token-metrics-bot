const express = require("express");
const router = express.Router();
const { Connection, PublicKey } = require("@solana/web3.js");
require("dotenv").config();

const RPC_URL = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const connection = new Connection(RPC_URL, "confirmed");

// Получаем владельцев токенов
async function getTokenAccounts(mint) {
  const accounts = await connection.getTokenLargestAccounts(new PublicKey(mint));
  return accounts.value.map(acc => acc.address.toBase58());
}

// Получаем время создания аккаунта
async function getAccountCreationTime(pubkey) {
  try {
    const parsed = await connection.getParsedAccountInfo(new PublicKey(pubkey));
    if (!parsed.value) return null;
    const slot = parsed.context.slot;
    const blockTime = await connection.getBlockTime(slot);
    return blockTime;
  } catch {
    return null;
  }
}

router.get("/", async (req, res) => {
  try {
    const mint = req.query.mint;
    if (!mint) {
      return res.status(400).json({ error: "Missing mint parameter" });
    }

    const accounts = await getTokenAccounts(mint);
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutesAgo = now - 300;

    let newHolders = 0;

    for (const acc of accounts) {
      const createdAt = await getAccountCreationTime(acc);
      if (createdAt && createdAt >= fiveMinutesAgo) {
        newHolders++;
      }
    }

    res.json({ newHoldersLast5Min: newHolders });
  } catch (err) {
    console.error("Ошибка в holders-growth:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

