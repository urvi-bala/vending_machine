import { useEffect, useState } from "react";
import { Block, Hash, TransactionReceipt, createPublicClient, http } from "viem";

const publicClient = createPublicClient({
  chain: {
    id: 412346,
    name: 'Local Nitro',
    network: 'nitro-local',
    nativeCurrency: {
      decimals: 18,
      name: 'Ethereum',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: { http: ['http://localhost:8547'] },
      public: { http: ['http://localhost:8547'] },
    },
  },
  transport: http()
});

export const useFetchBlocks = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [transactionReceipts, setTransactionReceipts] = useState<{ [key: string]: TransactionReceipt }>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalBlocks, setTotalBlocks] = useState<bigint>(0n);
  const [error, setError] = useState<Error | null>(null);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const blockNumber = await publicClient.getBlockNumber();
        setTotalBlocks(blockNumber);

        const startBlock = Number(blockNumber) - currentPage * ITEMS_PER_PAGE;
        const endBlock = Math.max(startBlock - ITEMS_PER_PAGE + 1, 0);

        const blockPromises = [];
        for (let i = startBlock; i >= endBlock; i--) {
          blockPromises.push(publicClient.getBlock({ blockNumber: BigInt(i), includeTransactions: true }));
        }

        const blocks = await Promise.all(blockPromises);
        setBlocks(blocks);

        // Fetch transaction receipts
        const receiptPromises: Promise<TransactionReceipt>[] = [];
        const txHashes: Hash[] = [];

        blocks.forEach(block => {
          block.transactions.forEach(tx => {
            if (typeof tx !== "string") {
              txHashes.push(tx.hash);
              receiptPromises.push(publicClient.getTransactionReceipt({ hash: tx.hash }));
            }
          });
        });

        const receipts = await Promise.all(receiptPromises);
        const receiptsMap = receipts.reduce((map, receipt, index) => {
          map[txHashes[index]] = receipt;
          return map;
        }, {} as { [key: string]: TransactionReceipt });

        setTransactionReceipts(receiptsMap);
      } catch (e) {
        console.error("Failed to fetch blocks:", e);
        setError(e as Error);
      }
    };

    fetchBlocks();
  }, [currentPage, publicClient]);

  return { blocks, transactionReceipts, currentPage, totalBlocks, setCurrentPage, error };
};
