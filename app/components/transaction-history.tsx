"use client"

import { useState } from "react"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { WalletNotConnectedError } from "@demox-labs/aleo-wallet-adapter-base"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export function TransactionHistory() {
  const { publicKey, requestTransactionHistory } = useWallet()
  const PROGRAM_ID = "piggybanker11.aleo"
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactionHistory = async () => {
    if (!publicKey) throw new WalletNotConnectedError()

    setIsLoading(true)
    setError(null)

    try {
      if (requestTransactionHistory) {
        const history = await requestTransactionHistory(PROGRAM_ID)
        console.log("Transaction history:", history)
        setTransactions(history || [])
      } else {
        throw new Error("Wallet does not support transaction history")
      }
    } catch (error: any) {
      console.error("Failed to fetch transaction history:", error)
      setError(`Error: ${error.message || "Failed to fetch transaction history"}`)
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>PiggyBanker Transaction History</CardTitle>
        <CardDescription>View your PiggyBanker transaction history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={fetchTransactionHistory} disabled={isLoading || !publicKey} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Fetch Transaction History
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {transactions.length > 0 ? (
            <div className="mt-4 space-y-4">
              <h3 className="text-lg font-medium">Transactions ({transactions.length})</h3>
              <div className="space-y-2">
                {transactions.map((tx, index) => (
                  <div key={index} className="p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-auto whitespace-pre-wrap break-all">
                      {JSON.stringify(tx, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 text-center text-muted-foreground">
              {isLoading ? "Loading transactions..." : "No transactions found"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
