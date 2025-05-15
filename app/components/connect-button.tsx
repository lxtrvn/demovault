"use client"

import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui"
import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ConnectButtonProps {
  isConnected: boolean
  onConnect: (connected: boolean, address: string) => void
}

export function ConnectButton({ isConnected, onConnect }: ConnectButtonProps) {
  const { publicKey, connected, connecting, wallet } = useWallet()
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Update parent component when wallet connection changes
  useEffect(() => {
    if (connected && publicKey) {
      onConnect(true, publicKey)
      setConnectionError(null)
    } else if (!connected && !connecting) {
      onConnect(false, "")
    }
  }, [connected, connecting, publicKey, onConnect])

  // Check for connection issues
  useEffect(() => {
    if (!connected && !connecting && wallet) {
      // If we have a wallet selected but not connected, there might be an issue
      const timer = setTimeout(() => {
        setConnectionError(
          "Connection to wallet is taking longer than expected. Try clicking the button again or check your wallet extension.",
        )
      }, 3000)

      return () => clearTimeout(timer)
    } else {
      setConnectionError(null)
    }
  }, [connected, connecting, wallet])

  return (
    <div className="flex flex-col items-center gap-2">
      <WalletMultiButton className="wallet-button" />

      {connectionError && (
        <Alert variant="warning" className="mt-2 text-sm">
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}

      {connecting && (
        <div className="text-sm text-muted-foreground mt-2">
          Connecting to wallet... Please check your wallet extension and approve the connection.
        </div>
      )}
    </div>
  )
}
