"use client"

import { useState, useEffect } from "react"
import { ConnectButton } from "./components/connect-button"
import { AccountInfo } from "./components/account-info"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic"
import { AleoWalletProvider } from "./components/wallet-provider"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Dynamically import components that use the Aleo SDK to prevent SSR issues
const DynamicTransactionForm = dynamic(
  () => import("./components/transaction-form").then((mod) => mod.TransactionForm),
  { ssr: false },
)
const DynamicRecordViewer = dynamic(() => import("./components/record-viewer").then((mod) => mod.RecordViewer), {
  ssr: false,
})
const DynamicTransactionHistory = dynamic(
  () => import("./components/transaction-history").then((mod) => mod.TransactionHistory),
  { ssr: false },
)

function HomeContent() {
  const { publicKey, connected, connecting, wallet, wallets, select } = useWallet()
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState("")
  const [network, setNetwork] = useState("Aleo Testnet")
  const [walletInfo, setWalletInfo] = useState<string>("")
  const [walletState, setWalletState] = useState<any>({})

  // Update state when wallet connection changes
  useEffect(() => {
    const state = {
      publicKey,
      connected,
      connecting,
      walletName: wallet?.adapter.name,
      availableWallets: wallets.map((w) => w.adapter.name).join(", "),
    }

    console.log("Wallet state:", state)
    setWalletState(state)

    if (connected && publicKey) {
      setIsConnected(true)
      setAccount(publicKey)
      setWalletInfo(`Connected to ${wallet?.adapter.name || "Unknown Wallet"}`)
    } else {
      setIsConnected(false)
      setAccount("")
      if (connecting) {
        setWalletInfo("Connecting to wallet...")
      } else if (wallet) {
        setWalletInfo(`Wallet ${wallet.adapter.name} detected but not connected`)
      } else if (wallets.length > 0) {
        setWalletInfo(`Available wallets: ${wallets.map((w) => w.adapter.name).join(", ")}`)
      } else {
        setWalletInfo("No wallet detected")
      }
    }
  }, [connected, connecting, publicKey, wallet, wallets])

  const handleConnect = async (connected: boolean, address: string) => {
    console.log("handleConnect called:", { connected, address })
    setIsConnected(connected)
    setAccount(address)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="z-10 w-full max-w-4xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">PiggyBanker Web App</h1>

        <div className="card-bg p-4 md:p-8 rounded-lg shadow-lg w-full mx-auto">
          <ConnectButton isConnected={isConnected} onConnect={handleConnect} />

          {walletInfo && (
            <Alert className="mb-4">
              <AlertDescription>{walletInfo}</AlertDescription>
            </Alert>
          )}

          {/* Debug information */}
          <div className="mb-4 p-3 bg-muted rounded-md text-xs">
            <details>
              <summary className="cursor-pointer font-semibold">Wallet Debug Info</summary>
              <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(walletState, null, 2)}</pre>
            </details>
          </div>

          {isConnected && (
            <>
              <AccountInfo account={account} network={network} />

              <div className="mt-8">
                <Tabs defaultValue="execute" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="execute">PiggyBanker Operations</TabsTrigger>
                    <TabsTrigger value="records">Records</TabsTrigger>
                    <TabsTrigger value="history">Transaction History</TabsTrigger>
                  </TabsList>
                  <TabsContent value="execute" className="mt-4">
                    <DynamicTransactionForm account={account} />
                  </TabsContent>
                  <TabsContent value="records" className="mt-4">
                    <DynamicRecordViewer />
                  </TabsContent>
                  <TabsContent value="history" className="mt-4">
                    <DynamicTransactionHistory />
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}

          {!isConnected && (
            <div className="text-center py-12 text-muted-foreground">
              Connect your wallet to interact with the PiggyBanker program on Aleo
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <AleoWalletProvider>
      <HomeContent />
    </AleoWalletProvider>
  )
}
