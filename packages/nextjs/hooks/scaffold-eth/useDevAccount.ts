import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { JsonRpcProvider, Wallet } from "ethers";

export const useDevAccount = () => {
  const [balance, setBalance] = useState<string>("0");
  const [address, setAddress] = useState<string>("");
  
  useEffect(() => {
    const initDevAccount = async () => {
      const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || "");
      const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY || "";
      const wallet = new Wallet(privateKey, provider);
      
      setAddress(wallet.address);
      
      const accountBalance = await provider.getBalance(wallet.address);
      setBalance(formatEther(BigInt(accountBalance)));
    };

    initDevAccount();
  }, []);

  return { balance, address };
};