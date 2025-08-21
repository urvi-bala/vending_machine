"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hash, Transaction, TransactionReceipt, createPublicClient, formatEther, formatUnits, http } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { decodeTransactionData } from "~~/utils/scaffold-eth";

const client = createPublicClient({
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

const TransactionComp = ({ txHash }: { txHash: Hash }) => {
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();

  useEffect(() => {
    if (txHash) {
      const fetchTransaction = async () => {
        try {
          const tx = await client.getTransaction({ hash: txHash });
          const receipt = await client.getTransactionReceipt({ hash: txHash });

          const transactionWithDecodedData = decodeTransactionData(tx);
          setTransaction(transactionWithDecodedData);
          setReceipt(receipt);
        } catch (error) {
          console.error("Error fetching transaction:", error);
        }
      };

      fetchTransaction();
    }
  }, [txHash]);

  return (
    <div className="container mx-auto mt-10 mb-20 px-10 md:px-0">
      <button className="btn btn-sm btn-primary" onClick={() => router.back()}>
        Back
      </button>
      {transaction ? (
        <div className="overflow-x-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Transaction Details</h2>
          <table className="table rounded-lg bg-base-100 w-full shadow-lg md:table-lg table-md">
            <tbody>
              <tr>
                <td><strong>Transaction Hash:</strong></td>
                <td>{transaction.hash}</td>
              </tr>
              <tr>
                <td><strong>Block Number:</strong></td>
                <td>{Number(transaction.blockNumber)}</td>
              </tr>
              <tr>
                <td><strong>From:</strong></td>
                <td><Address address={transaction.from} format="long" /></td>
              </tr>
              <tr>
                <td><strong>To:</strong></td>
                <td>
                  {!receipt?.contractAddress ? (
                    transaction.to && <Address address={transaction.to} format="long" />
                  ) : (
                    <span>Contract Creation: <Address address={receipt.contractAddress} format="long" /></span>
                  )}
                </td>
              </tr>
              <tr>
                <td><strong>Value:</strong></td>
                <td>{formatEther(transaction.value)} ETH</td>
              </tr>
              <tr>
                <td><strong>Gas Price:</strong></td>
                <td>{formatUnits(transaction.gasPrice || 0n, 9)} Gwei</td>
              </tr>
              <tr>
                <td><strong>Input Data:</strong></td>
                <td className="form-control">
                  <textarea 
                    readOnly 
                    value={transaction.input} 
                    className="textarea textarea-bordered h-24 font-mono text-sm"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-lg">Loading transaction details...</p>
        </div>
      )}
    </div>
  );
};

export default TransactionComp;
