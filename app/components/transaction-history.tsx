"use client"

import { useState } from "react"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { WalletNotConnectedError } from "@demox-labs/aleo-wallet-adapter-base"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TransactionHistory() {
  // Hardcoded program IDs
  const PROGRAM_ID = "piggybanker10.aleo"
  const CREDITS_PROGRAM = "credits.aleo"

  const { publicKey, requestTransactionHistory } = useWallet()
  const [piggybankerTransactions, setPiggybankerTransactions] = useState<any[]>([])
  const [creditsTransactions, setCreditsTransactions] = useState<any[]>([])
  const [isLoadingPiggybanker, setIsLoadingPiggybanker] = useState(false)
  const [isLoadingCredits, setIsLoadingCredits] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPiggybankerHistory = async () => {
    if (!publicKey) throw new WalletNotConnectedError()

    setIsLoadingPiggybanker(true)
    setError(null)

    try {
      if (requestTransactionHistory) {
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
    <Card>
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
                {isLoadingPiggybanker ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
                {piggybankerTransactions.map((tx, index) => (
                  <div key={index} className="p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-auto whitespace-pre-wrap break-all">
                      {JSON.stringify(tx, null, 2)}
                    </pre>
                  </div>
                ))}
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
                {isLoadingCredits ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
                {creditsTransactions.map((tx, index) => (
                  <div key={index} className="p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-auto whitespace-pre-wrap break-all">
                      {JSON.stringify(tx, null, 2)}
                    </pre>
                  </div>
                ))}
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
