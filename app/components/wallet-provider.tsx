"use client"

import { type FC, type ReactNode, useMemo, useEffect } from "react"
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
  // Set up the wallet adapters with more detailed configuration
  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({
        appName: "PiggyBanker Web App",
      }),
    ],
    [],
  )

  // Log wallet adapter initialization
  useEffect(() => {
    console.log("Wallet adapters initialized:", wallets)
    console.log("Using network:", WalletAdapterNetwork.Testnet)

    // Check if Leo wallet is installed
    const checkLeoWallet = () => {
      if (typeof window !== "undefined") {
        const hasLeoWallet = "leo" in window || "puzzle" in window
        console.log("Leo wallet detected in window:", hasLeoWallet)
        return hasLeoWallet
      }
      return false
    }

    checkLeoWallet()
  }, [wallets])

  return (
    <WalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={WalletAdapterNetwork.Testnet}
      autoConnect={true}
      localStorageKey="walletAdapter"
      onError={(error) => {
        console.error("Wallet adapter error:", error)
      }}
    >
      <WalletModalProvider>{children}</WalletModalProvider>
    </WalletProvider>
  )
}
