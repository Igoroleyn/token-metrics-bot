// routes/holders-growth.js
import express from "express";
import { getRotatingConnection } from "../utils/rpc-connection.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { mint } = req.body;
  if (!mint) return res.status(400).json({ error: "Missing mint" });

  try {
    const connection = getRotatingConnection();

    // Логика подсчёта роста холдеров за последние 5 минут
    // (пример, реальную логику можно добавить по твоему коду)

    const currentHoldersCount = await getHoldersCount(connection, mint);
    const previousHoldersCount = await getPreviousHoldersCount(connection, mint, 5); // за 5 минут назад

    const growth = currentHoldersCount - previousHoldersCount;

    res.json({ growth });
  } catch (error) {
    console.error("Error in holders-growth:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function getHoldersCount(connection, mint) {
  // Твоя логика подсчёта текущих холдеров
  return 0;
}

async function getPreviousHoldersCount(connection, mint, minutesAgo) {
  // Логика подсчёта холдеров несколько минут назад
  return 0;
}

export default router;
