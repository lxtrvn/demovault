"use client"

import { useState, useEffect } from "react"
import { ConnectButton } from "./components/connect-button"
import { AccountInfo } from "./components/account-info"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic"
import { AleoWalletProvider } from "./components/wallet-provider"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"

// Dynamically import components that use the Aleo SDK to prevent SSR issues
const DynamicTransactionForm = dynamic(
  () => import("./components/transaction-form").then((mod) => mod.TransactionForm),
  { ssr: false },
)
const DynamicRecordViewer = dynamic(() => import("./components/record-viewer").then((mod) => mod.RecordViewer), {
  ssr: false,
})
const DynamicRecordTransfer = dynamic(() => import("./components/record-transfer").then((mod) => mod.RecordTransfer), {
  ssr: false,
})
const DynamicTransactionHistory = dynamic(
  () => import("./components/transaction-history").then((mod) => mod.TransactionHistory),
  { ssr: false },
)

function HomeContent() {
  const { publicKey, connected } = useWallet()
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState("")
  const [network, setNetwork] = useState("Aleo Testnet 3")

  // Update state when wallet connection changes
  useEffect(() => {
    if (connected && publicKey) {
      setIsConnected(true)
      setAccount(publicKey)
    } else {
      setIsConnected(false)
      setAccount("")
    }
  }, [connected, publicKey])

  const handleConnect = async (connected: boolean, address: string) => {
    setIsConnected(connected)
    setAccount(address)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="z-10 w-full max-w-4xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">PiggyBanker7 App</h1>

        <div className="bg-white/10 p-4 md:p-8 rounded-lg shadow-lg w-full mx-auto">
          <ConnectButton isConnected={isConnected} onConnect={handleConnect} />

          {isConnected && (
            <>
              <AccountInfo account={account} network={network} />

              <div className="mt-8">
                <Tabs defaultValue="execute" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="execute">Execute Program</TabsTrigger>
                    <TabsTrigger value="records">View Records</TabsTrigger>
                    <TabsTrigger value="transfer">Transfer</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>
                  <TabsContent value="execute" className="mt-4">
                    <DynamicTransactionForm account={account} />
                  </TabsContent>
                  <TabsContent value="records" className="mt-4">
                    <DynamicRecordViewer />
                  </TabsContent>
                  <TabsContent value="transfer" className="mt-4">
                    <DynamicRecordTransfer />
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
              Connect your wallet to interact with the PiggyBanker7 program on Aleo
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
