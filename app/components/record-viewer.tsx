"use client"

import { useState } from "react"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { WalletNotConnectedError } from "@demox-labs/aleo-wallet-adapter-base"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Copy, CheckCircle2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function RecordViewer() {
  // Hardcoded program ID
  const PROGRAM_ID = "piggybanker10.aleo"
  const CREDITS_PROGRAM = "credits.aleo"

  const { publicKey, requestRecords, requestRecordPlaintexts } = useWallet()
  const [vaultRecords, setVaultRecords] = useState<any[]>([])
  const [creditsRecords, setCreditsRecords] = useState<any[]>([])
  const [isLoadingVaultRecords, setIsLoadingVaultRecords] = useState(false)
  const [isLoadingCreditsRecords, setIsLoadingCreditsRecords] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  // Format a record for display
  const formatRecord = (record: any, index: number) => {
    // Check if the record is for the piggybanker program
    const isPiggybankerRecord = record.plaintext && record.plaintext.includes("piggybanker")

    // Try to extract the record type if it's a piggybanker record
    let recordType = "Unknown"
    if (isPiggybankerRecord) {
      try {
        // This is a simple heuristic - can be improved with more specific parsing
        if (record.plaintext.includes("Vault")) {
          recordType = "Vault"
        } else if (record.plaintext.includes("Deposit")) {
          recordType = "Deposit"
        }
      } catch (e) {
        console.error("Error parsing record:", e)
      }
    } else {
      recordType = "Credits"
    }

    return (
      <div key={index} className="p-3 bg-muted rounded-md mb-3">
        <div className="flex justify-between items-start mb-2">
          <span className="font-semibold text-sm">
            {recordType} Record {index + 1} {record.spent ? "(Spent)" : "(Unspent)"}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyRecordToClipboard(record.plaintext)}
            className="h-6 px-2"
          >
            {copySuccess === record.plaintext ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="font-mono text-xs break-all overflow-auto max-h-36 whitespace-pre-wrap">{record.plaintext}</div>
      </div>
    )
  }

  // Copy record to clipboard and show success message
  const copyRecordToClipboard = (record: string) => {
    navigator.clipboard.writeText(record).then(
      () => {
        setCopySuccess(record)
        setTimeout(() => setCopySuccess(null), 2000)
      },
      (err) => {
        console.error("Could not copy text: ", err)
      },
    )
  }

  // Fetch vault records
  const fetchVaultRecords = async () => {
    if (!publicKey) throw new WalletNotConnectedError()

    setIsLoadingVaultRecords(true)
    setError(null)

    try {
      if (requestRecordPlaintexts) {
        const records = await requestRecordPlaintexts(PROGRAM_ID)
        console.log("Vault records:", records)

        // Filter for unspent records
        const unspentRecords = records.filter((record) => !record.spent)
        setVaultRecords(records || [])

        if (unspentRecords.length > 0) {
          console.log("Unspent vault records:", unspentRecords)
        } else {
          console.log("No unspent vault records found")
        }
      } else {
        throw new Error("Wallet does not support record plaintext fetching")
      }
    } catch (error: any) {
      console.error("Failed to fetch vault records:", error)
      setError(`Error: ${error.message || "Failed to fetch vault records"}`)
      setVaultRecords([])
    } finally {
      setIsLoadingVaultRecords(false)
    }
  }

  // Fetch credits records
  const fetchCreditsRecords = async () => {
    if (!publicKey) throw new WalletNotConnectedError()

    setIsLoadingCreditsRecords(true)
    setError(null)

    try {
      if (requestRecordPlaintexts) {
        const records = await requestRecordPlaintexts(CREDITS_PROGRAM)
        console.log("Credits records:", records)

        // Filter for unspent records
        const unspentRecords = records.filter((record) => !record.spent)
        setCreditsRecords(records || [])

        if (unspentRecords.length > 0) {
          console.log("Unspent credits records:", unspentRecords)
        } else {
          console.log("No unspent credits records found")
        }
      } else {
        throw new Error("Wallet does not support record plaintext fetching")
      }
    } catch (error: any) {
      console.error("Failed to fetch credits records:", error)
      setError(`Error: ${error.message || "Failed to fetch credits records"}`)
      setCreditsRecords([])
    } finally {
      setIsLoadingCreditsRecords(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Viewer</CardTitle>
        <CardDescription>View your Aleo records</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="vaultRecords" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vaultRecords">Vault Records</TabsTrigger>
            <TabsTrigger value="creditsRecords">Credits Records</TabsTrigger>
          </TabsList>

          {/* Vault Records Tab */}
          <TabsContent value="vaultRecords" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">PiggyBanker Records</h3>
              <Button onClick={fetchVaultRecords} disabled={isLoadingVaultRecords || !publicKey} size="sm">
                {isLoadingVaultRecords ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Refresh Records
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {vaultRecords.length > 0 ? (
              <div className="mt-2 space-y-2">{vaultRecords.map((record, index) => formatRecord(record, index))}</div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                {isLoadingVaultRecords ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Loading records...</p>
                  </div>
                ) : (
                  <div>
                    <p>No vault records found</p>
                    <p className="text-sm mt-1">Click "Refresh Records" to fetch your records</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Credits Records Tab */}
          <TabsContent value="creditsRecords" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Credits Records</h3>
              <Button onClick={fetchCreditsRecords} disabled={isLoadingCreditsRecords || !publicKey} size="sm">
                {isLoadingCreditsRecords ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Refresh Records
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {creditsRecords.length > 0 ? (
              <div className="mt-2 space-y-2">{creditsRecords.map((record, index) => formatRecord(record, index))}</div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                {isLoadingCreditsRecords ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Loading records...</p>
                  </div>
                ) : (
                  <div>
                    <p>No credits records found</p>
                    <p className="text-sm mt-1">Click "Refresh Records" to fetch your records</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Alert className="mt-4 bg-muted">
          <AlertDescription>
            <p>
              <strong>Tip:</strong> Click the copy icon to copy a record for use in the PiggyBanker operations.
            </p>
            <p className="text-xs mt-1">
              Vault records are used for withdrawals, and credits records are used for private vault creation.
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
