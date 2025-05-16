"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Search } from "lucide-react"

interface RecordSelectorProps {
  value: string
  onChange: (value: string) => void
  records: any[]
  loading: boolean
  onRefresh: () => Promise<void>
  placeholder?: string
}

export function RecordSelector({
  value,
  onChange,
  records,
  loading,
  onRefresh,
  placeholder = "Select a record",
}: RecordSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showDetails, setShowDetails] = useState<any | null>(null)

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

  // Filter records based on search term
  const filteredRecords = records.filter((record) => {
    const recordStr = typeof record === "string" ? record : JSON.stringify(record)
    return recordStr.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {records.length === 0 ? (
              <div className="p-2 text-center text-sm text-muted-foreground">
                {loading ? "Loading records..." : "No records found"}
              </div>
            ) : (
              filteredRecords.map((record, index) => (
                <SelectItem key={index} value={record}>
                  {formatRecordPreview(record, index)}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => onRefresh()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {value && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              View Record Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Record Details</DialogTitle>
              <DialogDescription>Detailed information about the selected record</DialogDescription>
            </DialogHeader>
            <div className="p-3 bg-muted rounded-md max-h-[60vh] overflow-auto">
              <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(value, null, 2)}</pre>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
