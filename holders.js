// holders.js
const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

const connection = new Connection(process.env.RPC_URL, 'confirmed');

async function getHoldersCount(tokenAddress) {
  const tokenPublicKey = new PublicKey(tokenAddress);

  try {
    const largestAccounts = await connection.getTokenLargestAccounts(tokenPublicKey);
    const holders = new Set();

    for (const account of largestAccounts.value) {
      const accountInfo = await connection.getParsedAccountInfo(new PublicKey(account.address));
      const owner = accountInfo.value?.data?.parsed?.info?.owner;
      if (owner) holders.add(owner);
    }

    return holders.size;
  } catch (err) {
    console.error('Ошибка при получении холдеров:', err);
    return null;
  }
}

module.exports = getHoldersCount;
