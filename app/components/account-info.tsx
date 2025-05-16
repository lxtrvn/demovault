"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base"
import { useEffect, useState } from "react"

interface AccountInfoProps {
  account: string
  network: string
}

export function AccountInfo({ account, network }: AccountInfoProps) {
  const { publicKey } = useWallet()
  const [networkName, setNetworkName] = useState(network)

  useEffect(() => {
    // Map network ID to network name
    const getNetworkName = () => {
      switch (network) {
        case WalletAdapterNetwork.Testnet3:
          return "Aleo Testnet 3"
        case WalletAdapterNetwork.Testnet2:
          return "Aleo Testnet 2"
        case WalletAdapterNetwork.Localnet:
          return "Aleo Localnet"
        default:
          return network || "Unknown Network"
      }
    }

    setNetworkName(getNetworkName())
  }, [network])

  // Format address to show first 6 and last 4 characters
  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Account:</span>
            <span className="font-mono">{formatAddress(account || publicKey || "")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Network:</span>
            <span>{networkName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
