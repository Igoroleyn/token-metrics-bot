import express from "express";
import { getRotatingConnection } from "../utils/rpc-connection.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { mint } = req.body;
  if (!mint) return res.status(400).json({ error: "Missing mint" });

  try {
    const connection = getRotatingConnection();

    // Получаем общий объем за 5 минут (пример, нужно реализовать по реальной логике)
    // Здесь для примера возвращаем фиктивное значение
    const volume = 1000;

    // Получаем количество холдеров
    const largestAccounts = await connection.getTokenLargestAccounts(mint);
    const holdersCount = largestAccounts.value.length;

    // Рассчитываем отношение
    const volumePerHolder = volume / holdersCount;

    res.json({ volume, holdersCount, volumePerHolder });
  } catch (error) {
    console.error("Error in volume-holders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
