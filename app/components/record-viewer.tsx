"use client"

import { useState } from "react"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { WalletNotConnectedError } from "@demox-labs/aleo-wallet-adapter-base"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export function RecordViewer() {
  const { publicKey, requestRecords, requestRecordPlaintexts } = useWallet()
  const PROGRAM_ID = "piggybanker7.aleo"
  const [records, setRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = async () => {
    if (!publicKey) throw new WalletNotConnectedError()

    setIsLoading(true)
    setError(null)

    try {
      if (requestRecords) {
        const fetchedRecords = await requestRecords(PROGRAM_ID)
        console.log("Records:", fetchedRecords)
        setRecords(fetchedRecords || [])
      } else {
        throw new Error("Wallet does not support record fetching")
      }
    } catch (error: any) {
      console.error("Failed to fetch records:", error)
      setError(`Error: ${error.message || "Failed to fetch records"}`)
      setRecords([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRecordPlaintexts = async () => {
    if (!publicKey) throw new WalletNotConnectedError()

    setIsLoading(true)
    setError(null)

    try {
      if (requestRecordPlaintexts) {
        const fetchedRecords = await requestRecordPlaintexts(PROGRAM_ID)
        console.log("Record plaintexts:", fetchedRecords)
        setRecords(fetchedRecords || [])
      } else {
        throw new Error("Wallet does not support record plaintext fetching")
      }
    } catch (error: any) {
      console.error("Failed to fetch record plaintexts:", error)
      setError(`Error: ${error.message || "Failed to fetch record plaintexts"}`)
      setRecords([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>PiggyBanker Records</CardTitle>
        <CardDescription>View and decrypt your PiggyBanker records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={fetchRecords} disabled={isLoading || !publicKey}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Fetch Records
            </Button>
            <Button onClick={fetchRecordPlaintexts} disabled={isLoading || !publicKey} variant="outline">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Fetch Record Plaintexts
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
