"use client"

import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ConnectButtonProps {
  isConnected: boolean
  onConnect: (connected: boolean, address: string) => void
}

export function ConnectButton({ isConnected, onConnect }: ConnectButtonProps) {
  const { publicKey, connected, connecting, disconnect, select, wallets } = useWallet()
  const [error, setError] = useState<string | null>(null)
  const [walletDetected, setWalletDetected] = useState(false)

  // Check if Leo wallet is installed
  useEffect(() => {
    const checkLeoWallet = () => {
      if (typeof window !== "undefined") {
        const hasLeoWallet = "leo" in window || "puzzle" in window
        console.log("Leo wallet detected in window:", hasLeoWallet)
        setWalletDetected(hasLeoWallet)
        return hasLeoWallet
      }
      return false
    }

    checkLeoWallet()
  }, [])

  // Update parent component when wallet connection changes
  useEffect(() => {
    console.log("Wallet connection state:", { connected, connecting, publicKey, wallets })

    if (connected && publicKey) {
      console.log("Wallet connected successfully with address:", publicKey)
      onConnect(true, publicKey)
      setError(null)
    } else if (!connected && !connecting) {
      console.log("Wallet disconnected")
      onConnect(false, "")
    }
  }, [connected, connecting, publicKey, onConnect, wallets])

  // Manual connect function as a fallback
  const handleManualConnect = async () => {
    try {
      console.log("Available wallets:", wallets)
      if (wallets.length > 0) {
        console.log("Selecting wallet:", wallets[0].adapter.name)
        select(wallets[0].adapter.name)
      } else {
        setError("No wallets available")
      }
    } catch (err: any) {
      console.error("Manual connect error:", err)
      setError(`Connection error: ${err.message || "Unknown error"}`)
    }
  }

  return (
    <div className="flex flex-col items-center mb-6">
      <WalletMultiButton className="wallet-button mb-2" />

      {!walletDetected && (
        <Alert className="mt-2 mb-2">
          <AlertDescription>
            Leo wallet extension not detected. Please install the Leo wallet extension and refresh the page.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mt-2 mb-2" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!connected && walletDetected && (
        <Button onClick={handleManualConnect} variant="outline" className="mt-2" disabled={connecting}>
          {connecting ? "Connecting..." : "Try Manual Connect"}
        </Button>
      )}
    </div>
  )
}
