"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TransactionFormProps {
  account: string
}

export function TransactionForm({ account }: TransactionFormProps) {
  // Hardcoded program ID
  const PROGRAM_ID = "piggybanker10.aleo"

  const { publicKey, requestTransaction } = useWallet()

  // Form states
  const [vaultDuration, setVaultDuration] = useState("")
  const [creditsAmount, setCreditsAmount] = useState("")
  const [receivingAddress, setReceivingAddress] = useState("")
  const [vaultRecord, setVaultRecord] = useState("")
  const [creditsRecord, setCreditsRecord] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [currentBlockHeight, setCurrentBlockHeight] = useState<number | null>(null)
  const [isLoadingBlockHeight, setIsLoadingBlockHeight] = useState(false)
  const [network, setNetwork] = useState("testnet") // Default to testnet

  // Function to fetch the current block height
  const fetchBlockHeight = async () => {
    setIsLoadingBlockHeight(true)
    setError(null)

    try {
      const url = "https://api.explorer.provable.com/v1/testnet/latest/height"
      const response = await fetch(url, { method: "GET", headers: { Accept: "application/json" } })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()
      setCurrentBlockHeight(data)
      console.log("Current block height:", data)
      return data
    } catch (error: any) {
      console.error("Failed to fetch block height:", error)
      setError(`Error fetching block height: ${error.message}`)
      return null
    } finally {
      setIsLoadingBlockHeight(false)
    }
  }

  // Fetch block height on component mount
  useEffect(() => {
    fetchBlockHeight()
  }, [])

  // Format inputs correctly with type suffixes
  const formatU32 = (value: string | number): string => {
    return `${value}u32`
  }

  const formatU64 = (value: string | number): string => {
    return `${value}u64`
  }

  // Get the correct chainId based on network
  const getChainId = () => {
    return "testnet3" // Use testnet3 for compatibility with Leo wallet
  }

  // Create Vault function
  const handleCreateVault = async () => {
    if (!publicKey) {
      setError("Wallet not connected. Please connect your wallet.")
      return
    }

    setIsSubmitting(true)
    setResult(null)
    setError(null)
    setTransactionId(null)

    try {
      // Fetch latest block height
      const blockHeight = await fetchBlockHeight()
      if (!blockHeight) {
        throw new Error("Failed to fetch current block height")
      }

      // Format inputs correctly with type suffixes
      const blockHeightInput = formatU32(blockHeight)
      const durationInput = formatU32(vaultDuration)
      const amountInput = formatU64(creditsAmount)

      console.log("Creating vault with inputs:", {
        blockHeight: blockHeightInput,
        duration: durationInput,
        amount: amountInput,
      })

      // Create transaction
      const result = await requestTransaction({
        address: publicKey,
        chainId: getChainId(),
        transitions: [
          {
            program: PROGRAM_ID,
            functionName: "createvault",
            inputs: [blockHeightInput, durationInput, amountInput],
          },
        ],
        fee: 80000, // fees in microcredits
        feePrivate: false,
      })

      setTransactionId(result)
      setResult(`Vault created successfully. Transaction ID: ${result}`)
      console.log("Transaction result:", result)
    } catch (error: any) {
      console.error("Error creating vault:", error)
      setError(`Error: ${error.message || "Failed to create vault"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Create Private Vault function
  const handleCreatePrivateVault = async () => {
    if (!publicKey) {
      setError("Wallet not connected. Please connect your wallet.")
      return
    }

    if (!creditsRecord) {
      setError("No credits record selected. Please select a record first.")
      return
    }

    setIsSubmitting(true)
    setResult(null)
    setError(null)
    setTransactionId(null)

    try {
      // Fetch latest block height
      const blockHeight = await fetchBlockHeight()
      if (!blockHeight) {
        throw new Error("Failed to fetch current block height")
      }

      // Format inputs correctly with type suffixes
      const blockHeightInput = formatU32(blockHeight)
      const durationInput = formatU32(vaultDuration)
      const amountInput = formatU64(creditsAmount)

      console.log("Creating private vault with inputs:", {
        record: creditsRecord,
        blockHeight: blockHeightInput,
        duration: durationInput,
        amount: amountInput,
      })

      // Create transaction
      const result = await requestTransaction({
        address: publicKey,
        chainId: getChainId(),
        transitions: [
          {
            program: PROGRAM_ID,
            functionName: "rcreatevault",
            inputs: [creditsRecord, blockHeightInput, durationInput, amountInput],
          },
        ],
        fee: 100000, // fees in microcredits
        feePrivate: false,
      })

      setTransactionId(result)
      setResult(`Private vault created successfully. Transaction ID: ${result}`)
      console.log("Transaction result:", result)
    } catch (error: any) {
      console.error("Error creating private vault:", error)
      setError(`Error: ${error.message || "Failed to create private vault"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Withdraw function
  const handleWithdraw = async () => {
    if (!publicKey) {
      setError("Wallet not connected. Please connect your wallet.")
      return
    }

    if (!vaultRecord) {
      setError("No vault record selected. Please select a record first.")
      return
    }

    if (!receivingAddress) {
      setError("No receiving address provided. Please enter a receiving address.")
      return
    }

    setIsSubmitting(true)
    setResult(null)
    setError(null)
    setTransactionId(null)

    try {
      // Format amount input correctly with type suffix
      const amountInput = formatU64(creditsAmount)

      console.log("Withdrawing with inputs:", {
        record: vaultRecord,
        recipient: receivingAddress,
        amount: amountInput,
      })

      // Create transaction
      const result = await requestTransaction({
        address: publicKey,
        chainId: getChainId(),
        transitions: [
          {
            program: PROGRAM_ID,
            functionName: "withdraw",
            inputs: [vaultRecord, receivingAddress, amountInput],
          },
        ],
        fee: 100000, // fees in microcredits
        feePrivate: false,
      })

      setTransactionId(result)
      setResult(`Withdrawal successful. Transaction ID: ${result}`)
      console.log("Transaction result:", result)
    } catch (error: any) {
      console.error("Error withdrawing:", error)
      setError(`Error: ${error.message || "Failed to withdraw"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="card-bg">
      <CardHeader>
        <CardTitle>PiggyBanker Operations</CardTitle>
        <CardDescription>Create and manage vaults in the {PROGRAM_ID} program</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="network">Network</Label>
            <Select value={network} onValueChange={setNetwork}>
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="testnet">Testnet</SelectItem>
                <SelectItem value="mainnet">Mainnet</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Note: Currently using testnet3 for compatibility with the Leo wallet.
            </p>
          </div>
        </div>

        <Tabs defaultValue="createVault" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="createVault">Create Vault</TabsTrigger>
            <TabsTrigger value="createPrivate">Create Private</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          {/* Create Vault Tab */}
          <TabsContent value="createVault" className="space-y-4">
            <div className="space-y-4 mt-4">
              <Alert className="bg-muted">
                <AlertDescription>
                  Creates a new vault with the specified duration and amount. Block height will be fetched
                  automatically.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="vaultDuration">Vault Duration (hours)</Label>
                <Input
                  id="vaultDuration"
                  type="number"
                  min="1"
                  placeholder="Enter duration in hours"
                  value={vaultDuration}
                  onChange={(e) => setVaultDuration(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditsAmount">Credits Amount</Label>
                <Input
                  id="creditsAmount"
                  type="number"
                  min="1"
                  placeholder="Amount of credits"
                  value={creditsAmount}
                  onChange={(e) => setCreditsAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Current Block Height</Label>
                  <Button variant="outline" size="sm" onClick={fetchBlockHeight} disabled={isLoadingBlockHeight}>
                    {isLoadingBlockHeight ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                  </Button>
                </div>
                <div className="p-2 bg-muted rounded-md text-sm font-mono">
                  {currentBlockHeight !== null ? `${currentBlockHeight}` : "Loading..."}
                </div>
              </div>

              <Button
                onClick={handleCreateVault}
                disabled={isSubmitting || !publicKey || !vaultDuration || !creditsAmount || currentBlockHeight === null}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Vault...
                  </>
                ) : (
                  "Create Vault"
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Create Private Vault Tab */}
          <TabsContent value="createPrivate" className="space-y-4">
            <div className="space-y-4 mt-4">
              <Alert className="bg-muted">
                <AlertDescription>
                  Creates a private vault using a credits record. Select a record from the Records tab first.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="creditsRecord">Credits Record</Label>
                <Input
                  id="creditsRecord"
                  placeholder="Select a credits.aleo record from the Records tab"
                  value={creditsRecord}
                  onChange={(e) => setCreditsRecord(e.target.value)}
                  required
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vaultDuration">Vault Duration (hours)</Label>
                <Input
                  id="vaultDuration"
                  type="number"
                  min="1"
                  placeholder="Enter duration in hours"
                  value={vaultDuration}
                  onChange={(e) => setVaultDuration(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditsAmount">Credits Amount</Label>
                <Input
                  id="creditsAmount"
                  type="number"
                  min="1"
                  placeholder="Amount of credits"
                  value={creditsAmount}
                  onChange={(e) => setCreditsAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Current Block Height</Label>
                  <Button variant="outline" size="sm" onClick={fetchBlockHeight} disabled={isLoadingBlockHeight}>
                    {isLoadingBlockHeight ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                  </Button>
                </div>
                <div className="p-2 bg-muted rounded-md text-sm font-mono">
                  {currentBlockHeight !== null ? `${currentBlockHeight}` : "Loading..."}
                </div>
              </div>

              <Button
                onClick={handleCreatePrivateVault}
                disabled={
                  isSubmitting ||
                  !publicKey ||
                  !creditsRecord ||
                  !vaultDuration ||
                  !creditsAmount ||
                  currentBlockHeight === null
                }
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Private Vault...
                  </>
                ) : (
                  "Create Private Vault"
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Withdraw Tab */}
          <TabsContent value="withdraw" className="space-y-4">
            <div className="space-y-4 mt-4">
              <Alert className="bg-muted">
                <AlertDescription>
                  Withdraw credits from a vault. Select a vault record from the Records tab first.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="vaultRecord">Vault Record</Label>
                <Input
                  id="vaultRecord"
                  placeholder="Select a vault record from the Records tab"
                  value={vaultRecord}
                  onChange={(e) => setVaultRecord(e.target.value)}
                  required
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivingAddress">Receiving Address</Label>
                <Input
                  id="receivingAddress"
                  placeholder="aleo1..."
                  value={receivingAddress}
                  onChange={(e) => setReceivingAddress(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditsAmount">Credits Amount</Label>
                <Input
                  id="creditsAmount"
                  type="number"
                  min="1"
                  placeholder="Amount of credits"
                  value={creditsAmount}
                  onChange={(e) => setCreditsAmount(e.target.value)}
                  required
                />
              </div>

              <Button
                onClick={handleWithdraw}
                disabled={isSubmitting || !publicKey || !vaultRecord || !receivingAddress || !creditsAmount}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Withdrawing...
                  </>
                ) : (
                  "Withdraw"
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

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

export default TransactionForm
