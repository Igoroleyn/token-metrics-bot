import express from "express";
import { getRotatingConnection } from "../utils/rpc-connection.js";
import { PublicKey } from "@solana/web3.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { mint } = req.body;
    if (!mint) return res.status(400).json({ error: "Missing mint" });

    const connection = getRotatingConnection();
    const mintPubkey = new PublicKey(mint);

    // TODO: Реализовать логику получения объёма за 5 минут или другой метрики
    const volume = 1000; // заглушка для примера

    const largestAccounts = await connection.getTokenLargestAccounts(mintPubkey);
    const holdersCount = largestAccounts.value.length;

    const volumePerHolder = volume / holdersCount;

    res.json({ volume, holdersCount, volumePerHolder });
  } catch (error) {
    console.error("Error in volume-holders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
