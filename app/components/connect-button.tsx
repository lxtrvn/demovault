"use client"

import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui"
import { useEffect } from "react"

interface ConnectButtonProps {
  isConnected: boolean
  onConnect: (connected: boolean, address: string) => void
}

export function ConnectButton({ isConnected, onConnect }: ConnectButtonProps) {
  const { publicKey, connected } = useWallet()

  // Update parent component when wallet connection changes
  useEffect(() => {
    if (connected && publicKey) {
      onConnect(true, publicKey)
    } else if (!connected) {
      onConnect(false, "")
    }
  }, [connected, publicKey, onConnect])

  return (
    <div className="flex justify-center mb-6">
      <WalletMultiButton className="wallet-button" />
    </div>
  )
}
