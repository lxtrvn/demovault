"use client"

import { useState } from "react"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { WalletNotConnectedError } from "@demox-labs/aleo-wallet-adapter-base"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { createNetworkRecordProvider } from "../utils/record-provider"

export function EnhancedRecordViewer() {
  const { publicKey, connected, wallet } = useWallet()
  const PROGRAM_ID = "piggybanker7.aleo"
  const [records, setRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startHeight, setStartHeight] = useState("0")
  const [endHeight, setEndHeight] = useState("100000")
  const [privateKey, setPrivateKey] = useState("")
  const [showPrivateKeyInput, setShowPrivateKeyInput] = useState(false)

  const fetchRecordsWithProvider = async () => {
    if (!connected) throw new WalletNotConnectedError()
    if (showPrivateKeyInput && !privateKey) {
      setError("Private key is required for enhanced record search")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get the private key from the wallet if possible
      const pk = privateKey
      if (!pk && wallet?.adapter.name === "Leo Wallet") {
        // Note: This is just a placeholder. In reality, you would need to request the private key from the wallet
        // which may not be possible with all wallet adapters for security reasons
        setShowPrivateKeyInput(true)
        if (!privateKey) {
          setError("Private key is required for enhanced record search")
          setIsLoading(false)
          return
        }
      }

      if (!pk) {
        setError("Private key is required for enhanced record search")
        setIsLoading(false)
        return
      }

      // Create a network record provider
      const recordProvider = await createNetworkRecordProvider(pk)

      // Set up search parameters
      const searchParams = {
        programs: [PROGRAM_ID],
        startHeight: Number.parseInt(startHeight),
        endHeight: Number.parseInt(endHeight),
      }

      // Find records
      const fetchedRecords = await recordProvider.findRecords(true, [], searchParams)
      console.log("Records from provider:", fetchedRecords)
      setRecords(fetchedRecords || [])
    } catch (error: any) {
      console.error("Failed to fetch records with provider:", error)
      setError(`Error: ${error.message || "Failed to fetch records with provider"}`)
      setRecords([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCreditsRecords = async () => {
    if (!connected) throw new WalletNotConnectedError()
    if (showPrivateKeyInput && !privateKey) {
      setError("Private key is required for enhanced record search")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get the private key from the wallet if possible
      const pk = privateKey
      if (!pk && wallet?.adapter.name === "Leo Wallet") {
        // Note: This is just a placeholder. In reality, you would need to request the private key from the wallet
        setShowPrivateKeyInput(true)
        if (!privateKey) {
          setError("Private key is required for enhanced record search")
          setIsLoading(false)
          return
        }
      }

      if (!pk) {
        setError("Private key is required for enhanced record search")
        setIsLoading(false)
        return
      }

      // Create a network record provider
      const recordProvider = await createNetworkRecordProvider(pk)

      // Set up search parameters
      const searchParams = {
        startHeight: Number.parseInt(startHeight),
        endHeight: Number.parseInt(endHeight),
      }

      // Find credits records with at least 1000 microcredits
      const fetchedRecords = await recordProvider.findCreditsRecords([1000], true, [], searchParams)
      console.log("Credits records from provider:", fetchedRecords)
      setRecords(fetchedRecords || [])
    } catch (error: any) {
      console.error("Failed to fetch credits records with provider:", error)
      setError(`Error: ${error.message || "Failed to fetch credits records with provider"}`)
      setRecords([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enhanced Record Search</CardTitle>
        <CardDescription>Search for records using the NetworkRecordProvider</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {showPrivateKeyInput && (
            <div className="space-y-2">
              <Label htmlFor="privateKey">Private Key (required for enhanced search)</Label>
              <Input
                id="privateKey"
                type="password"
                placeholder="APrivateKey1..."
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Note: Your private key is only used locally and is never sent to any server.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startHeight">Start Block Height</Label>
              <Input
                id="startHeight"
                type="number"
                min="0"
                placeholder="0"
                value={startHeight}
                onChange={(e) => setStartHeight(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endHeight">End Block Height</Label>
              <Input
                id="endHeight"
                type="number"
                min="0"
                placeholder="100000"
                value={endHeight}
                onChange={(e) => setEndHeight(e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={fetchRecordsWithProvider} disabled={isLoading || !connected}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Search Program Records
            </Button>
            <Button onClick={fetchCreditsRecords} disabled={isLoading || !connected} variant="outline">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Search Credits Records
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {records.length > 0 ? (
            <div className="mt-4 space-y-4">
              <h3 className="text-lg font-medium">Records ({records.length})</h3>
              <div className="space-y-2">
                {records.map((record, index) => (
                  <div key={index} className="p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-auto whitespace-pre-wrap break-all">
                      {JSON.stringify(record, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 text-center text-muted-foreground">
              {isLoading ? "Loading records..." : "No records found"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default EnhancedRecordViewer
