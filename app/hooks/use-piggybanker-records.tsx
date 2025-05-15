"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react"
import { WalletNotConnectedError } from "@demox-labs/aleo-wallet-adapter-base"

export function usePiggyBankerRecords() {
  const { publicKey, requestRecords, requestRecordPlaintexts } = useWallet()
  const PROGRAM_ID = "piggybanker7.aleo"

  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError()

    setLoading(true)
    setError(null)

    try {
      if (requestRecords) {
        const fetchedRecords = await requestRecords(PROGRAM_ID)
        console.log("PiggyBanker Records:", fetchedRecords)
        setRecords(fetchedRecords || [])
        return fetchedRecords
      } else {
        throw new Error("Wallet does not support record fetching")
      }
    } catch (error: any) {
      console.error("Failed to fetch PiggyBanker records:", error)
      setError(`Error: ${error.message || "Failed to fetch records"}`)
      setRecords([])
      return []
    } finally {
      setLoading(false)
    }
  }, [publicKey, requestRecords, PROGRAM_ID])

  const fetchRecordPlaintexts = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError()

    setLoading(true)
    setError(null)

    try {
      if (requestRecordPlaintexts) {
        const fetchedRecords = await requestRecordPlaintexts(PROGRAM_ID)
        console.log("PiggyBanker Record plaintexts:", fetchedRecords)
        setRecords(fetchedRecords || [])
        return fetchedRecords
      } else {
        throw new Error("Wallet does not support record plaintext fetching")
      }
    } catch (error: any) {
      console.error("Failed to fetch PiggyBanker record plaintexts:", error)
      setError(`Error: ${error.message || "Failed to fetch record plaintexts"}`)
      setRecords([])
      return []
    } finally {
      setLoading(false)
    }
  }, [publicKey, requestRecordPlaintexts, PROGRAM_ID])

  // Auto-fetch records when wallet connects
  useEffect(() => {
    if (publicKey) {
      fetchRecords().catch(console.error)
    }
  }, [publicKey, fetchRecords])

  return {
    records,
    loading,
    error,
    fetchRecords,
    fetchRecordPlaintexts,
  }
}
