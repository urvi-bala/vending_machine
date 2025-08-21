"use client";

import { useEffect, useState } from "react";
import { formatEther, createPublicClient, http } from "viem";
import { Address } from "~~/components/scaffold-eth";

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

export const AddressComponent = ({ address }: { address: string }) => {
  const [balance, setBalance] = useState<string>();
  const [nonce, setNonce] = useState<number>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAddressDetails = async () => {
      try {
        const [addressBalance, addressNonce] = await Promise.all([
          client.getBalance({ address: address as `0x${string}` }),
          client.getTransactionCount({ address: address as `0x${string}` }),
        ]);

        setBalance(formatEther(addressBalance));
        setNonce(addressNonce);
      } catch (error) {
        console.error("Error fetching address details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddressDetails();
  }, [address]);

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4 text-lg">Loading address details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-10 mb-20 px-10 md:px-0">
      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-center">Address Details</h2>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <span className="text-lg font-semibold">Address:</span>
            <Address address={address} format="long" />
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-lg font-semibold">Balance:</span>
            <span className="font-mono">{balance} ETH</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-lg font-semibold">Nonce:</span>
            <span className="font-mono">{nonce}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
