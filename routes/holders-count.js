import express from "express";
import { getRotatingConnection } from "../utils/rpc-connection.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { mint } = req.body;
  if (!mint) return res.status(400).json({ error: "Missing mint" });

  try {
    const connection = getRotatingConnection();

    // Реализуем подсчёт количества холдеров токена
    // Пример (зависит от твоей логики и доступных методов):

    const largestAccounts = await connection.getTokenLargestAccounts(mint);
    const holdersCount = largestAccounts.value.length;

    res.json({ holdersCount });
  } catch (error) {
    console.error("Error in holders-count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
