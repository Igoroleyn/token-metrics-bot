import { Connection } from "@solana/web3.js";

const RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-api.projectserum.com",
  // Добавь сюда другие стабильные RPC, если есть
];

let lastIndex = 0;

export function getRotatingConnection() {
  lastIndex = (lastIndex + 1) % RPC_ENDPOINTS.length;
  return new Connection(RPC_ENDPOINTS[lastIndex], "confirmed");
}
