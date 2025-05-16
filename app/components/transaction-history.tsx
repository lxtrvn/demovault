"use client"

import { useState } from "react"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { WalletNotConnectedError } from "@demox-labs/aleo-wallet-adapter-base"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function TransactionHistory() {
  // Hardcoded program IDs
  const PROGRAM_ID = "piggybanker10.aleo"
  const CREDITS_PROGRAM = "credits.aleo"

  const { publicKey, requestTransactionHistory } = useWallet()
  const [piggybankerTransactions, setPiggybankerTransactions] = useState<any[]>([])
  const [creditsTransactions, setCreditsTransactions] = useState<any[]>([])
  const [isLoadingPiggybanker, setIsLoadingPiggybanker] = useState(false)
  const [isLoadingCredits, setIsLoadingCredits] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Format transaction for better display
  const formatTransaction = (tx: any, index: number) => {
    // Extract useful information from the transaction
    let functionName = "Unknown"
    let timestamp = "Unknown"
    let status = "Unknown"

    try {
      if (tx.type) {
        functionName = tx.type
      }

      if (tx.timestamp) {
        const date = new Date(tx.timestamp * 1000)
        timestamp = date.toLocaleString()
      }

      if (tx.status) {
        status = tx.status
      }
    } catch (e) {
      console.error("Error parsing transaction:", e)
    }

    return (
      <div key={index} className="p-3 bg-muted rounded-md mb-3">
        <div className="flex justify-between items-start mb-2">
          <span className="font-semibold text-sm">Transaction {index + 1}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          <div>
            <span className="text-muted-foreground">Function:</span> {functionName}
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span> {status}
          </div>
          <div>
            <span className="text-muted-foreground">Time:</span> {timestamp}
          </div>
        </div>
        <div className="font-mono text-xs break-all overflow-auto max-h-36 whitespace-pre-wrap opacity-70">
          {JSON.stringify(tx, null, 2)}
        </div>
      </div>
    )
  }

  const fetchPiggybankerHistory = async () => {
    if (!publicKey) throw new WalletNotConnectedError()

    setIsLoadingPiggybanker(true)
    setError(null)

    try {
      if (requestTransactionHistory) {
        console.log("Requesting transaction history for program:", PROGRAM_ID)
        const history = await requestTransactionHistory(PROGRAM_ID)
        console.log("PiggyBanker transaction history:", history)
        setPiggybankerTransactions(history || [])
      } else {
        throw new Error("Wallet does not support transaction history")
      }
    } catch (error: any) {
      console.error("Failed to fetch transaction history:", error)
      setError(`Error: ${error.message || "Failed to fetch transaction history"}`)
      setPiggybankerTransactions([])
    } finally {
      setIsLoadingPiggybanker(false)
    }
  }

  const fetchCreditsHistory = async () => {
    if (!publicKey) throw new WalletNotConnectedError()

    setIsLoadingCredits(true)
    setError(null)

    try {
      if (requestTransactionHistory) {
        console.log("Requesting transaction history for program:", CREDITS_PROGRAM)
        const history = await requestTransactionHistory(CREDITS_PROGRAM)
        console.log("Credits transaction history:", history)
        setCreditsTransactions(history || [])
      } else {
        throw new Error("Wallet does not support transaction history")
      }
    } catch (error: any) {
      console.error("Failed to fetch transaction history:", error)
      setError(`Error: ${error.message || "Failed to fetch transaction history"}`)
      setCreditsTransactions([])
    } finally {
      setIsLoadingCredits(false)
    }
  }

  return (
    <Card className="card-bg">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>View your transaction history</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="piggybanker" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="piggybanker">PiggyBanker</TabsTrigger>
            <TabsTrigger value="credits">Credits</TabsTrigger>
          </TabsList>

          {/* PiggyBanker Transactions Tab */}
          <TabsContent value="piggybanker" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">PiggyBanker Transactions</h3>
              <Button onClick={fetchPiggybankerHistory} disabled={isLoadingPiggybanker || !publicKey} size="sm">
                {isLoadingPiggybanker ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh History
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {piggybankerTransactions.length > 0 ? (
              <div className="mt-2 space-y-2">
                {piggybankerTransactions.map((tx, index) => formatTransaction(tx, index))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                {isLoadingPiggybanker ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Loading transactions...</p>
                  </div>
                ) : (
                  <div>
                    <p>No PiggyBanker transactions found</p>
                    <p className="text-sm mt-1">Click "Refresh History" to fetch your transactions</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Credits Transactions Tab */}
          <TabsContent value="credits" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Credits Transactions</h3>
              <Button onClick={fetchCreditsHistory} disabled={isLoadingCredits || !publicKey} size="sm">
                {isLoadingCredits ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh History
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {creditsTransactions.length > 0 ? (
              <div className="mt-2 space-y-2">
                {creditsTransactions.map((tx, index) => formatTransaction(tx, index))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                {isLoadingCredits ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Loading transactions...</p>
                  </div>
                ) : (
                  <div>
                    <p>No Credits transactions found</p>
                    <p className="text-sm mt-1">Click "Refresh History" to fetch your transactions</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default TransactionHistory
