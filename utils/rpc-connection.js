import { Connection } from "@solana/web3.js";

const RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",
  "https://rpc.ankr.com/solana"
];

let currentIndex = 0;
let currentConnection = new Connection(RPC_ENDPOINTS[currentIndex], "confirmed");

export function getRotatingConnection() {
  return currentConnection;
}

export async function handleRpcError(error) {
  if (
    error?.message?.includes("429") ||
    error?.message?.includes("403") ||
    error?.message?.includes("401") ||
    error?.code === 429 ||
    error?.code === 403 ||
    error?.code === 401
  ) {
    currentIndex = (currentIndex + 1) % RPC_ENDPOINTS.length;
    currentConnection = new Connection(RPC_ENDPOINTS[currentIndex], "confirmed");
    console.log(`Switched RPC to: ${RPC_ENDPOINTS[currentIndex]}`);
    return true;
  }
  return false;
}
