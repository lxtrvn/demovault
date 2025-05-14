"use client"

import { type FC, type ReactNode, useMemo } from "react"
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react"
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui"
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo"
import { DecryptPermission, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base"

// Import the wallet adapter CSS
import "@demox-labs/aleo-wallet-adapter-reactui/styles.css"

interface AleoWalletProviderProps {
  children: ReactNode
}

export const AleoWalletProvider: FC<AleoWalletProviderProps> = ({ children }) => {
  // Set up the wallet adapters
  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({
        appName: "PiggyBanker Web App",
      }),
    ],
    [],
  )

  return (
    <WalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={WalletAdapterNetwork.Testnet3} // Reverting back to Testnet3 which is known to work
      autoConnect
    >
      <WalletModalProvider>{children}</WalletModalProvider>
    </WalletProvider>
  )
}
