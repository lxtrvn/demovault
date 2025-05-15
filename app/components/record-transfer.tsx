"use client"

import { useState } from "react"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { Transaction, WalletNotConnectedError } from "@demox-labs/aleo-wallet-adapter-base"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useVaultRecords } from "../hooks/use-piggybanker-records"

export function RecordTransfer() {
  const { publicKey, requestTransaction } = useWallet()
  const { records, fetchRecords, loading: recordsLoading } = useVaultRecords()

  const PROGRAM_ID = "depositvault.aleo"
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [fee, setFee] = useState("0.01")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null)

  const handleTransfer = async () => {
    if (!publicKey) throw new WalletNotConnectedError()
    if (!selectedRecord) {
      setError("No record selected")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Convert amount and fee to microcredits (1 credit = 1,000,000 microcredits)
      const amountInMicrocredits = `${Math.floor(Number.parseFloat(amount) * 1_000_000)}u64`
      const feeInMicrocredits = Math.floor(Number.parseFloat(fee) * 1_000_000)

      // Create transaction
      const aleoTransaction = Transaction.createTransaction(
        publicKey,
        "mainnet",
        PROGRAM_ID,
        "transfer",
        [selectedRecord, recipient, amountInMicrocredits],
        feeInMicrocredits,
      )

      if (requestTransaction) {
        // Request transaction using wallet adapter
        const txId = await requestTransaction(aleoTransaction)
        setSuccess(`Transfer successful. Transaction ID: ${txId}`)

        // Refresh records after a short delay
        setTimeout(() => {
          fetchRecords().catch(console.error)
        }, 2000)
      } else {
        throw new Error("Wallet does not support transactions")
      }
    } catch (error: any) {
      console.error("Error executing transfer:", error)
      setError(`Error: ${error.message || "Failed to execute transfer"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>DepositVault Transfer</CardTitle>
        <CardDescription>Transfer DepositVault tokens to another address</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Records</Label>
              <Button
                onClick={() => fetchRecords()}
                disabled={recordsLoading || !publicKey}
                variant="outline"
                size="sm"
              >
                {recordsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh Records"}
              </Button>
            </div>

            {records.length > 0 ? (
              <Select value={selectedRecord || ""} onValueChange={setSelectedRecord}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a record" />
                </SelectTrigger>
                <SelectContent>
                  {records.map((record, index) => (
                    <SelectItem key={index} value={record}>
                      Record {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center p-2 bg-muted rounded-md text-sm">
                {recordsLoading ? "Loading records..." : "No records found. Click Refresh Records to load."}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="aleo1..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.000001"
              min="0.000001"
              placeholder="1.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fee">Fee (in credits)</Label>
            <Input
              id="fee"
              type="number"
              step="0.001"
              min="0.001"
              placeholder="0.01"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              required
            />
          </div>

          <Button
            onClick={handleTransfer}
            disabled={isLoading || !publicKey || !selectedRecord || !recipient || !amount}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              "Transfer"
            )}
          </Button>
        </div>

        {error && (
          <Alert className="mt-4" variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription className="break-all">{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
