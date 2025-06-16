import { OrcaPoolConfig, getOrca, Network } from "@orca-so/sdk";
import { Connection, PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config();

const connection = new Connection(process.env.RPC_URL);

export async function getOrcaPoolInfo(mintAddress) {
  const orca = getOrca(connection, Network.MAINNET);
  const pools = orca.getAllPools();

  for (const [name, pool] of Object.entries(pools)) {
    const tokenA = await pool.getTokenA();
    const tokenB = await pool.getTokenB();
    if (
      tokenA.mint.toBase58() === mintAddress ||
      tokenB.mint.toBase58() === mintAddress
    ) {
      return {
        poolAddress: pool.getAddresses().poolTokenMint.toBase58(),
        name
      };
    }
  }

  return {};
}
