import { getOrca, Network } from "@orca-so/sdk";
import { Connection } from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();

const rpcUrl = process.env.RPC_URL;
if (!rpcUrl || !rpcUrl.startsWith("http")) {
  throw new Error("Invalid or missing RPC_URL in .env");
}

const connection = new Connection(rpcUrl);

export async function getOrcaPoolReserves(mintAddress) {
  const orca = getOrca(connection, Network.MAINNET);
  const pools = await orca.getAllPools(); // предполагаю, что getAllPools - асинхронная функция

  for (const [name, pool] of Object.entries(pools)) {
    const tokenA = await pool.getTokenA();
    const tokenB = await pool.getTokenB();

    if (
      tokenA.mint.toBase58() === mintAddress ||
      tokenB.mint.toBase58() === mintAddress
    ) {
      const { reserveA, reserveB } = await pool.getReserves();
      const decimalsA = tokenA.scale;
      const decimalsB = tokenB.scale;

      const isMintTokenA = tokenA.mint.toBase58() === mintAddress;

      const volumeInSol = isMintTokenA
        ? reserveA.toNumber() / 10 ** decimalsA
        : reserveB.toNumber() / 10 ** decimalsB;

      const liquidityInSol = isMintTokenA
        ? reserveB.toNumber() / 10 ** decimalsB
        : reserveA.toNumber() / 10 ** decimalsA;

      return {
        volumeInSol,
        liquidityInSol,
        poolName: name,
      };
    }
  }

  throw new Error("Пул с указанным токеном не найден в Orca.");
}
