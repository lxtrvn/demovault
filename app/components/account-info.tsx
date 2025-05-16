"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"

interface AccountInfoProps {
  account: string
  network: string
}

export function AccountInfo({ account, network }: AccountInfoProps) {
  const { publicKey } = useWallet()

  // Format address to show first 6 and last 4 characters
  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <Card className="mt-4 card-bg">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Account:</span>
            <span className="font-mono">{formatAddress(account || publicKey || "")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Network:</span>
            <span>Aleo Testnet</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
