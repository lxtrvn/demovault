"use client"

import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState, useEffect } from "react"

export function WalletDebug() {
  const { wallets, wallet, publicKey, connecting, connected, disconnecting, autoConnect, select, connect, disconnect } =
    useWallet()

  const [error, setError] = useState<string | null>(null)
  const [walletState, setWalletState] = useState<any>({})

  useEffect(() => {
    // Update wallet state for debugging
    setWalletState({
      availableWallets: wallets.map((w) => w.name),
      selectedWallet: wallet?.name || "None",
      publicKey: publicKey || "None",
      connecting,
      connected,
      disconnecting,
      autoConnect,
    })
  }, [wallets, wallet, publicKey, connecting, connected, disconnecting, autoConnect])

  const handleManualConnect = async () => {
    try {
      setError(null)
      if (!wallet) {
        if (wallets.length > 0) {
          select(wallets[0].name)
        } else {
          throw new Error("No wallets available")
        }
      }

      await connect()
    } catch (err: any) {
      console.error("Connection error:", err)
      setError(`Connection error: ${err.message || "Unknown error"}`)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Wallet Connection Debug</CardTitle>
        <CardDescription>Diagnose wallet connection issues</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Wallet State:</h3>
            <pre className="p-2 bg-muted rounded-md text-xs overflow-auto">{JSON.stringify(walletState, null, 2)}</pre>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleManualConnect}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
              disabled={connected}
            >
              Manual Connect
            </button>
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm"
              disabled={!connected}
            >
              Disconnect
            </button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground">
            <p>Troubleshooting tips:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Make sure your Leo wallet extension is installed and unlocked</li>
              <li>Check that you have the correct network selected in your wallet</li>
              <li>Try refreshing the page and reconnecting</li>
              <li>Check browser console for additional error messages</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
