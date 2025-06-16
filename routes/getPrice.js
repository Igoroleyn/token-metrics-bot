import express from "express";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  buildWhirlpoolClient,
  ORCA_WHIRLPOOL_PROGRAM_ID,
  Network,
  PriceMath,
  getTokenMintInfo
} from "@orca-so/whirlpools-sdk";
import { DecimalUtil } from "@orca-so/common-sdk";
import Decimal from "decimal.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const RPC_URL = process.env.RPC_URL;
const connection = new Connection(RPC_URL, "confirmed");

const client = buildWhirlpoolClient(connection, ORCA_WHIRLPOOL_PROGRAM_ID[Network.MAINNET]);

// 🔐 Whirlpool ID для mint: BncWP9Z5DRjmtqF4DwmbJDbypBR7L1LCWMJcyWjEpump
const HARDCODED_WHIRLPOOL_ID = new PublicKey("9g3LqpDgTKyqgyBLxiDTGpffW8hz4jMFHDVNFQ14q8Db");

router.get("/", async (req, res) => {
  const { mint } = req.query;

  if (!mint) {
    return res.status(400).json({ error: "Missing mint" });
  }

  try {
    const pool = await client.getPool(HARDCODED_WHIRLPOOL_ID);
    const data = pool.getData();

    const tokenInfoA = await getTokenMintInfo(connection, data.tokenMintA);
    const tokenInfoB = await getTokenMintInfo(connection, data.tokenMintB);

    const sqrtPriceX64 = data.sqrtPrice;
    const price = PriceMath.sqrtPriceX64ToPrice(
      sqrtPriceX64,
      tokenInfoA.decimals,
      tokenInfoB.decimals
    );

    const tokenAMint = data.tokenMintA.toBase58();
    const tokenBMint = data.tokenMintB.toBase58();

    let finalPrice, vsToken, symbol;

    if (tokenAMint === mint) {
      finalPrice = price.toNumber();
      vsToken = tokenBMint;
      symbol = "TokenA";
    } else if (tokenBMint === mint) {
      finalPrice = new Decimal(1).div(price).toNumber();
      vsToken = tokenAMint;
      symbol = "TokenB";
    } else {
      return res.status(404).json({ error: "Mint not found in hardcoded pool" });
    }

    res.json({
      mint,
      price: finalPrice,
      vsToken,
      symbol
    });

  } catch (err) {
    console.error("❌ Error fetching price from Orca:", err);
    res.status(500).json({ error: "Failed to fetch price" });
  }
});

export default router;
