import express from "express";
import puppeteer from "puppeteer";

const router = express.Router();

router.get("/:mint", async (req, res) => {
  const { mint } = req.params;
  const url = `https://axion.trade/token/${mint}`;

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Увеличенный таймаут и проверка наличия хотя бы одного текста "Price" или "Liquidity"
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll("body *")).some(el =>
        el.textContent.includes("Liquidity") || el.textContent.includes("Price")
      );
    }, { timeout: 30000 });

    const data = await page.evaluate(() => {
      const findValueByKeyword = (keyword) => {
        const elements = Array.from(document.querySelectorAll("body *"));
        for (let el of elements) {
          if (el.textContent.includes(keyword)) {
            const match = el.textContent.match(/\$?[0-9.,K]+/);
            if (match) return match[0];
          }
        }
        return null;
      };

      return {
        price: findValueByKeyword("Price"),
        liquidity: findValueByKeyword("Liquidity"),
        volume5m: findValueByKeyword("5m Vol"),
        holders: findValueByKeyword("Holders"),
        proTraders: findValueByKeyword("Pro Traders")
      };
    });

    await browser.close();
    res.json({ mint, ...data });

  } catch (error) {
    console.error("Puppeteer error:", error.message);
    res.status(500).json({
      error: "Failed to fetch data via Puppeteer",
      detail: error.message
    });
  }
});

export default router;
