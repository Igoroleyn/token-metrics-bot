import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Импорты маршрутов
import getPriceOrca from "./routes/getprice-orca.js";
import volumeLiquidity from "./routes/volume-liquidity.js";
import volumeHolders from "./routes/volume-holders.js";
import holdersCount from "./routes/holders-count.js";
import holdersGrowth from "./routes/holders-growth.js";
import uniqueTraders from "./routes/unique-traders.js";
import testAll from "./routes/test-all.js";
import axiomPuppeteer from "./routes/axiom-puppeteer.js"; // 🆕

dotenv.config();

// Обработка путей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаём приложение
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Подключение маршрутов
app.use("/api/getprice-orca", getPriceOrca);
app.use("/api/volume-liquidity", volumeLiquidity);
app.use("/api/volume-holders", volumeHolders);
app.use("/api/holders-count", holdersCount);
app.use("/api/holders-growth", holdersGrowth);
app.use("/api/unique-traders", uniqueTraders);
app.use("/api/test-all", testAll);
app.use("/api/axiom-puppeteer", axiomPuppeteer); // ✅ новый маршрут

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
