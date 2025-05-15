"use client"

import { useState } from "react"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { Transaction, WalletAdapterNetwork, WalletNotConnectedError } from "@demox-labs/aleo-wallet-adapter-base"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function RecordTransfer() {
  const { publicKey, requestTransaction, requestRecords } = useWallet()

  const PROGRAM_ID = "piggybanker7.aleo"
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [fee, setFee] = useState("0.01")
  const [network, setNetwork] = useState("testnet3")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [records, setRecords] = useState<any[]>([])
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null)
  const [isLoadingRecords, setIsLoadingRecords] = useState(false)

  // Get network enum based on selected network
  const getNetworkEnum = () => {
    switch (network) {
      case "testnet3":
        return WalletAdapterNetwork.Testnet3
      case "testnet2":
        return WalletAdapterNetwork.Testnet2
      case "local":
        return WalletAdapterNetwork.Localnet
      default:
        return WalletAdapterNetwork.Testnet3
    }
  }

  const fetchRecords = async () => {
    if (!publicKey) throw new WalletNotConnectedError()

    setIsLoadingRecords(true)
    setError(null)

    try {
      if (requestRecords) {
        const fetchedRecords = await requestRecords(PROGRAM_ID)
        console.log("Records:", fetchedRecords)
        setRecords(fetchedRecords || [])

        if (fetchedRecords && fetchedRecords.length > 0) {
          setSelectedRecord(fetchedRecords[0])
        }
      } else {
        throw new Error("Wallet does not support record fetching")
      }
    } catch (error: any) {
      console.error("Failed to fetch records:", error)
      setError(`Error: ${error.message || "Failed to fetch records"}`)
      setRecords([])
    } finally {
      setIsLoadingRecords(false)
    }
  }

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
        getNetworkEnum(),
        PROGRAM_ID,
        "transfer",
        [selectedRecord, recipient, amountInMicrocredits],
        feeInMicrocredits,
      )

      if (requestTransaction) {
        // Request transaction using wallet adapter
        const txId = await requestTransaction(aleoTransaction)
        setSuccess(`Transfer successful. Transaction ID: ${txId}`)
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
        <CardTitle>PiggyBanker Transfer</CardTitle>
        <CardDescription>Transfer PiggyBanker tokens to another address</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Records</Label>
              <Button onClick={fetchRecords} disabled={isLoadingRecords || !publicKey} variant="outline" size="sm">
                {isLoadingRecords ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh Records"}
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
                {isLoadingRecords ? "Loading records..." : "No records found. Click Refresh Records to load."}
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

          <div className="space-y-2">
            <Label htmlFor="network">Network</Label>
            <Select value={network} onValueChange={setNetwork}>
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="testnet3">Testnet 3 (Main Testnet)</SelectItem>
                <SelectItem value="testnet2">Testnet 2</SelectItem>
                <SelectItem value="local">Local Network</SelectItem>
              </SelectContent>
            </Select>
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
