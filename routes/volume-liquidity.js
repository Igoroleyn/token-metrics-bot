<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Token Metrics</title>
  <style>
    body {
      background-color: #111;
      color: #fff;
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 50px;
    }
    input {
      padding: 10px;
      width: 300px;
      border-radius: 8px;
      border: none;
      margin-right: 10px;
    }
    button {
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      background-color: #2979ff;
      color: white;
      cursor: pointer;
    }
    #metrics {
      margin-top: 30px;
      padding: 20px;
      background-color: #222;
      border-radius: 12px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <h1>📊 Token Metrics</h1>
  <input type="text" id="mintInput" placeholder="Enter token mint" />
  <button onclick="getMetrics()">Get Metrics</button>
  <div id="metrics">🔍 Metrics will appear here...</div>

  <script>
    async function getMetrics() {
      const mint = document.getElementById('mintInput').value.trim();
      if (!mint) return;

      const metricsDiv = document.getElementById('metrics');
      metricsDiv.innerHTML = "⏳ Fetching metrics...";

      try {
        const [priceRes, volumeLiquidityRes, volumeHoldersRes] = await Promise.all([
          fetch(`/api/getprice-orca?mint=${mint}`),
          fetch(`/api/volume-liquidity?mint=${mint}`),
          fetch(`/api/volume-holders?mint=${mint}`)
        ]);

        const priceData = await priceRes.json();
        const volLiqData = await volumeLiquidityRes.json();
        const volHoldData = await volumeHoldersRes.json();

        if (priceData.error || volLiqData.error || volHoldData.error) {
          metricsDiv.innerHTML = `<span style="color:red">⚠️ Failed to load some data</span>`;
        } else {
          metricsDiv.innerHTML = `
            💰 <b>Price:</b> ${priceData.price}<br/>
            📊 <b>Volume/Liquidity:</b> ${volLiqData.ratio}<br/>
            🧮 <b>Volume/Holders:</b> ${volHoldData.volume_per_holder}<br/>
            👥 <b>Holders:</b> ${volHoldData.holders}<br/>
            💧 <b>Liquidity:</b> ${volHoldData.liquidity}<br/>
            📈 <b>Volume:</b> ${volHoldData.volume}
          `;
        }
      } catch (err) {
        console.error(err);
        metricsDiv.innerHTML = `<span style="color:red">❌ Error loading metrics</span>`;
      }
    }
  </script>
</body>
</html>
