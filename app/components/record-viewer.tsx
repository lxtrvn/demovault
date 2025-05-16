"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, RefreshCw } from "lucide-react"
import { useVaultRecords } from "../hooks/use-piggybanker-records"
import { Badge } from "@/components/ui/badge"

export function RecordViewer() {
  const { records, loading, error, fetchRecords, fetchRecordPlaintexts } = useVaultRecords()
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null)

  // Format record for display
  const formatRecordPreview = (record: any, index: number) => {
    try {
      // Try to extract useful information from the record
      let preview = `Record ${index + 1}`

      // If it's a JSON string, parse it
      if (typeof record === "string" && record.startsWith("{")) {
        try {
          const parsed = JSON.parse(record)
          if (parsed.data && parsed.data.amount) {
            preview += ` - Amount: ${parsed.data.amount}`
          }
        } catch (e) {
          // If parsing fails, just use the default preview
        }
      }
      // If it's an object with data
      else if (record && typeof record === "object") {
        if (record.data && record.data.amount) {
          preview += ` - Amount: ${record.data.amount}`
        }
      }

      return preview
    } catch (e) {
      return `Record ${index + 1}`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>PiggyBanker Records</span>
          <Badge variant={loading ? "outline" : "default"}>{records.length} Records</Badge>
        </CardTitle>
        <CardDescription>View and decrypt your PiggyBanker records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={() => fetchRecords()} disabled={loading} className="flex-1">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Fetch Records
            </Button>
            <Button onClick={() => fetchRecordPlaintexts()} disabled={loading} variant="outline" className="flex-1">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Fetch Plaintexts
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {records.map((record, index) => (
                  <Button
                    key={index}
                    variant={selectedRecord === record ? "default" : "outline"}
                    className="justify-start overflow-hidden text-ellipsis whitespace-nowrap"
                    onClick={() => setSelectedRecord(record === selectedRecord ? null : record)}
                  >
                    {formatRecordPreview(record, index)}
                  </Button>
                ))}
              </div>

              {selectedRecord && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Record Details</h3>
                  <div className="p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-auto whitespace-pre-wrap break-all">
                      {JSON.stringify(selectedRecord, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 text-center text-muted-foreground">
              {loading ? "Loading records..." : "No records found"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
