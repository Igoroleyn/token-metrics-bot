const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { fileURLToPath } = require("url");
const { createRequire } = require("module");
const require = createRequire(import.meta.url);

// Загружаем переменные окружения
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Роуты (CommonJS require вместо import)
const getPriceOrca = require("./routes/getprice-orca.js");
const volumeLiquidity = require("./routes/volume-liquidity.js");
const volumeHolders = require("./routes/volume-holders.js");
const holdersCount = require("./routes/holders-count.js");
const holdersGrowth = require("./routes/holders-growth.js");
const uniqueTraders = require("./routes/unique-traders.js");

app.use("/api/getprice-orca", getPriceOrca);
app.use("/api/volume-liquidity", volumeLiquidity);
app.use("/api/volume-holders", volumeHolders);
app.use("/api/holders-count", holdersCount);
app.use("/api/holders-growth", holdersGrowth);
app.use("/api/unique-traders", uniqueTraders);

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
