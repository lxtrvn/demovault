"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function RecordTransfer() {
  // Redirect to the transaction-form component for piggybanker functionality

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Transfer</CardTitle>
        <CardDescription>This functionality is available in the Execute Program tab</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center py-8 text-muted-foreground">
          PiggyBanker operations are available in the "Execute Program" tab.
          <br />
          Please use that tab to create vaults and perform withdrawals.
        </p>
      </CardContent>
    </Card>
  )
}
