"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { Transaction, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { initializeAleo, parseLeoInputs } from "../utils/aleo"

interface TransactionFormProps {
  account: string
}

export function TransactionForm({ account }: TransactionFormProps) {
  const { publicKey, requestTransaction } = useWallet()

  const [programId, setProgramId] = useState("")
  const [functionName, setFunctionName] = useState("")
  const [inputs, setInputs] = useState("")
  const [fee, setFee] = useState("0.01")
  const [network, setNetwork] = useState("testnet3")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  // Initialize Aleo SDK
  useEffect(() => {
    const init = async () => {
      try {
        const initialized = await initializeAleo()
        setIsInitialized(initialized)
        if (!initialized) {
          setError("Failed to initialize Aleo SDK. Please refresh the page.")
        }
      } catch (error) {
        console.error("Error initializing Aleo SDK:", error)
        setError("Failed to initialize Aleo SDK. Please refresh the page.")
      }
    }

    init()
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResult(null)
    setError(null)
    setTransactionId(null)

    if (!isInitialized) {
      setError("Aleo SDK is not initialized. Please refresh the page.")
      setIsSubmitting(false)
      return
    }

    if (!publicKey) {
      setError("Wallet not connected. Please connect your wallet.")
      setIsSubmitting(false)
      return
    }

    try {
      // Parse inputs
      const parsedInputs = parseLeoInputs(inputs)

      // Convert fee to microcredits (1 credit = 1,000,000 microcredits)
      const feeInMicrocredits = Math.floor(Number.parseFloat(fee) * 1_000_000)

      // Create transaction
      const aleoTransaction = Transaction.createTransaction(
        publicKey,
        getNetworkEnum(),
        programId,
        functionName,
        parsedInputs,
        feeInMicrocredits,
      )

      if (requestTransaction) {
        // Request transaction using wallet adapter
        const txId = await requestTransaction(aleoTransaction)
        setTransactionId(txId)
        setResult(`Program executed successfully. Transaction ID: ${txId}`)
      } else {
        throw new Error("Wallet does not support transactions")
      }

      // Reset form fields except network
      setProgramId("")
      setFunctionName("")
      setInputs("")
    } catch (error: any) {
      console.error("Error executing Leo program:", error)
      setError(`Error: ${error.message || "Failed to execute program"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execute Leo Program</CardTitle>
        <CardDescription>Enter your Leo program details to execute on the Aleo blockchain</CardDescription>
      </CardHeader>
      <CardContent>
        {!isInitialized && (
          <Alert className="mb-4" variant="destructive">
            <AlertTitle>Initialization Error</AlertTitle>
            <AlertDescription>Failed to initialize Aleo SDK. Please refresh the page.</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="programId">Program ID</Label>
            <Input
              id="programId"
              placeholder="credits.aleo"
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="functionName">Function Name</Label>
            <Input
              id="functionName"
              placeholder="transfer"
              value={functionName}
              onChange={(e) => setFunctionName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inputs">Function Inputs (comma separated)</Label>
            <Input
              id="inputs"
              placeholder='aleo1abc..., 1000u64, "message"'
              value={inputs}
              onChange={(e) => setInputs(e.target.value)}
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
            type="submit"
            disabled={isSubmitting || !isInitialized || !publicKey || !programId || !functionName}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executing...
              </>
            ) : (
              "Execute Program"
            )}
          </Button>
        </form>

        {error && (
          <Alert className="mt-4" variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert className="mt-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription className="break-all">{result}</AlertDescription>
          </Alert>
        )}

        {transactionId && (
          <div className="mt-4 p-3 bg-muted rounded-md text-sm">
            <p className="font-semibold">Transaction ID:</p>
            <p className="break-all font-mono">{transactionId}</p>
            <p className="mt-2 text-xs">
              You can view your transaction on the{" "}
              <a
                href={`https://explorer.aleo.org/transaction/${transactionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Aleo Explorer
              </a>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
