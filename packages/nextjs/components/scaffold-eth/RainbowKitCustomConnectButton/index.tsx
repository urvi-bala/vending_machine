"use client";

// @refresh reset
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useDevAccount } from "~~/hooks/scaffold-eth/useDevAccount";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  const networkColor = useNetworkColor();
  const { balance, address } = useDevAccount();

  const formattedBalance = parseFloat(balance).toFixed(2);

  return (
    <div className="flex items-center">
      <div className="flex items-center bg-base-200 rounded-lg px-3 py-2 shadow-md">
        <div className="flex flex-col items-start">
          <span className="text-sm font-bold mb-1">Dev Account</span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-medium">{formattedBalance} ETH</span>
            <div 
              className="tooltip tooltip-bottom tooltip-primary relative" 
              data-tip={address?.slice(0, 20) + "..." + address?.slice(-8)}
            >
              <span
                className="text-sm text-base-content/70 hover:text-base-content cursor-pointer"
                onClick={() => {
                  if (address) {
                    navigator.clipboard.writeText(address);
                  }
                }}
                title="Click to copy address"
              >
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <style jsx>{`
                .tooltip:before {
                  right: 0;
                  left: auto;
                  transform: translateX(0);
                }
              `}</style>
            </div>
          </div>
          <span className="text-xs mt-1" style={{ color: networkColor }}>
            Local Nitro
          </span>
        </div>
      </div>
    {/* <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const blockExplorerAddressLink = account
          ? getBlockExplorerAddressLink(targetNetwork, account.address)
          : undefined;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button className="btn btn-primary btn-sm" onClick={openConnectModal} type="button">
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return <WrongNetworkDropdown />;
              }

              return (
                <>
                  <div className="flex flex-col items-center mr-1">
                    <Balance address={account.address as Address} className="min-h-0 h-auto" />
                    <span className="text-xs" style={{ color: networkColor }}>
                      {chain.name}
                    </span>
                  </div>
                  <AddressInfoDropdown
                    address={account.address as Address}
                    displayName={account.displayName}
                    ensAvatar={account.ensAvatar}
                    blockExplorerAddressLink={blockExplorerAddressLink}
                  />
                  <AddressQRCodeModal address={account.address as Address} modalId="qrcode-modal" />
                </>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom> */}
    </div>
  );
};
