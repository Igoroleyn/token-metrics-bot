const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const TOKEN_MINT = new PublicKey('9ZDghDhVrJih39y98dADEPKL9o3WLwXcLoks4Gvqpump');
const connection = new Connection(RPC_URL, 'confirmed');
const FIVE_MINUTES_SEC = 5 * 60;

async function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function getRecentTransfersCount() {
  try {
    const now = Math.floor(Date.now() / 1000);
    const since = now - FIVE_MINUTES_SEC;

    const signatures = await connection.getSignaturesForAddress(TOKEN_MINT, { limit: 20 });
    const filtered = signatures.filter(sig => sig.blockTime && sig.blockTime >= since).slice(0, 5);

    const recentAccounts = new Set();

    for (const sig of filtered) {
      try {
        const tx = await connection.getParsedTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0,
        });

        if (!tx) continue;

        tx.transaction.message.accountKeys.forEach(acc => {
          if (acc.pubkey) recentAccounts.add(acc.pubkey.toBase58());
        });

        await delay(3000); // 3 сек задержка

      } catch (err) {
        if (err.message.includes('429')) {
          console.warn(`⏳ 429: ${sig.signature} — жду 5 сек и пропускаю`);
          await delay(5000);
          continue;
        }
        console.warn(`⚠️ Ошибка сигнатуры ${sig.signature}: ${err.message}`);
      }
    }

    console.log('👥 Уникальных аккаунтов за 5 минут:', recentAccounts.size);
    return recentAccounts.size;

  } catch (err) {
    console.error('❌ Ошибка получения транзакций:', err.message);
    return 0;
  }
}

async function getHoldersCount() {
  try {
    const accounts = await connection.getParsedTokenAccountsByMint(
      TOKEN_MINT,
      { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
    );
    const holders = accounts.value.filter(acc => {
      const amount = acc.account.data.parsed.info.tokenAmount.uiAmount;
      return amount > 0;
    });

    return holders.length;
  } catch (err) {
    console.error('❌ Ошибка получения холдеров:', err.message);
    return null;
  }
}

async function getActivityRatio() {
  const transfers = await getRecentTransfersCount();
  const holders = await getHoldersCount();
  if (!holders || holders === 0) return null;
  return +(transfers / holders).toFixed(2);
}

module.exports = getActivityRatio;
