"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { Transaction, WalletAdapterNetwork, WalletNotConnectedError } from "@demox-labs/aleo-wallet-adapter-base"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { initializeAleo } from "../utils/aleo"
import { DEPOSIT_VAULT_FUNCTIONS, DEPOSIT_VAULT_FUNCTION_NAMES } from "../utils/deposit-vault-functions"
import { useVaultRecords } from "../hooks/use-piggybanker-records"
import { RecordSelector } from "./record-selector"

interface TransactionFormProps {
  account: string
}

export function TransactionForm({ account }: TransactionFormProps) {
  const { publicKey, requestTransaction } = useWallet()
  const { records, fetchRecords, loading: recordsLoading } = useVaultRecords()

  const PROGRAM_ID = "depositvault.aleo"
  const [functionName, setFunctionName] = useState("")
  const [inputs, setInputs] = useState<string[]>(Array(3).fill(""))
  const [fee, setFee] = useState("0.01")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  // Get the selected function definition
  const selectedFunction = functionName ? DEPOSIT_VAULT_FUNCTIONS[functionName] : null

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

  // Reset inputs when function changes
  useEffect(() => {
    if (selectedFunction) {
      setInputs(Array(selectedFunction.inputs.length).fill(""))
    } else {
      setInputs([])
    }
  }, [functionName, selectedFunction])

  // Fetch records when component mounts
  useEffect(() => {
    if (publicKey && !recordsLoading && records.length === 0) {
      fetchRecords().catch(console.error)
    }
  }, [publicKey, recordsLoading, records.length, fetchRecords])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!publicKey) throw new WalletNotConnectedError()

    setIsSubmitting(true)
    setResult(null)
    setError(null)
    setTransactionId(null)

    if (!isInitialized) {
      setError("Aleo SDK is not initialized. Please refresh the page.")
      setIsSubmitting(false)
      return
    }

    try {
      // Filter out empty inputs
      const validInputs = inputs.filter((input) => input.trim() !== "")

      // Convert fee to microcredits (1 credit = 1,000,000 microcredits)
      const feeInMicrocredits = Math.floor(Number.parseFloat(fee) * 1_000_000)

      // Create transaction as per documentation
      const aleoTransaction = Transaction.createTransaction(
        publicKey,
        WalletAdapterNetwork.Testnet,
        PROGRAM_ID,
        functionName,
        validInputs,
        feeInMicrocredits,
      )

      if (requestTransaction) {
        // Request transaction using wallet adapter
        const txId = await requestTransaction(aleoTransaction)
        setTransactionId(txId)
        setResult(`Program executed successfully. Transaction ID: ${txId}`)

        // Refresh records after a short delay
        setTimeout(() => {
          fetchRecords().catch(console.error)
        }, 2000)
      } else {
        throw new Error("Wallet does not support transactions")
      }

      // Reset form fields except network
      setFunctionName("")
      setInputs(Array(3).fill(""))
    } catch (error: any) {
      console.error("Error executing Leo program:", error)
      setError(`Error: ${error.message || "Failed to execute program"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs]
    newInputs[index] = value
    setInputs(newInputs)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execute DepositVault Program</CardTitle>
        <CardDescription>Execute functions on the depositvault.aleo program</CardDescription>
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
            <Label htmlFor="programId">Program ID</Label>
            <Input id="programId" value={PROGRAM_ID} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="functionName">Function</Label>
            <Select value={functionName} onValueChange={setFunctionName}>
              <SelectTrigger>
                <SelectValue placeholder="Select function" />
              </SelectTrigger>
              <SelectContent>
                {DEPOSIT_VAULT_FUNCTION_NAMES.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name} - {DEPOSIT_VAULT_FUNCTIONS[name].description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedFunction &&
            selectedFunction.inputs.map((input, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={`input-${index}`}>
                  {input.name} ({input.type})
                  <span className="ml-2 text-xs text-muted-foreground">{input.description}</span>
                </Label>

                {input.isRecord ? (
                  <RecordSelector
                    value={inputs[index] || ""}
                    onChange={(value) => handleInputChange(index, value)}
                    records={records}
                    loading={recordsLoading}
                    onRefresh={fetchRecords}
                    placeholder={input.placeholder}
                  />
                ) : (
                  <Input
                    id={`input-${index}`}
                    placeholder={input.placeholder}
                    value={inputs[index] || ""}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    required
                  />
                )}
              </div>
            ))}

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
            disabled={isSubmitting || !isInitialized || !publicKey || !functionName}
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
