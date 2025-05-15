// Import necessary types and classes from the Aleo SDK
import { initializeAleo } from "./aleo"

// Check if we're running on the client side
const isClient = typeof window !== "undefined"

// Import Aleo SDK only on the client side
let aleo: any = null
if (isClient) {
  // Dynamic import to prevent SSR issues
  import("@aleohq/sdk")
    .then((module) => {
      aleo = module
    })
    .catch((error) => {
      console.error("Failed to load Aleo SDK:", error)
    })
}

// Interface for record search parameters
export interface RecordSearchParams {
  programs?: string[]
  amounts?: number[]
  startHeight?: number
  endHeight?: number
  maxCumulativeAmount?: number
}

// BlockHeightSearch class for searching records within a block height range
export class BlockHeightSearch {
  startHeight: number
  endHeight: number

  constructor(startHeight: number, endHeight: number) {
    this.startHeight = startHeight
    this.endHeight = endHeight
  }
}

// NetworkRecordProvider class for finding records
export class NetworkRecordProvider {
  private account: any
  private networkClient: any

  constructor(account: any, networkClient: any) {
    this.account = account
    this.networkClient = networkClient
  }

  // Set the account used for searching records
  setAccount(account: any) {
    this.account = account
  }

  // Find credit records with a specific amount of microcredits
  async findCreditsRecord(
    microcredits: number,
    unspent = true,
    nonces: string[] = [],
    searchParameters?: RecordSearchParams,
  ) {
    if (!isClient || !aleo) {
      throw new Error("Aleo SDK not available")
    }

    try {
      // Ensure the Aleo SDK is initialized
      await initializeAleo()

      // Create a network client if not provided
      if (!this.networkClient) {
        this.networkClient = new aleo.AleoNetworkClient("https://api.explorer.aleo.org/v1")
      }

      // Create search parameters
      const params = searchParameters || {}

      // Set up block height search if provided
      let blockHeightSearch
      if (params.startHeight && params.endHeight) {
        blockHeightSearch = new aleo.BlockHeightSearch(params.startHeight, params.endHeight)
      }

      // Find the record
      const record = await this.networkClient.findCreditsRecord(
        this.account,
        microcredits,
        unspent,
        nonces,
        blockHeightSearch,
      )

      return record
    } catch (error) {
      console.error("Failed to find credits record:", error)
      throw error
    }
  }

  // Find multiple credit records with specific amounts of microcredits
  async findCreditsRecords(
    microcredits: number[],
    unspent = true,
    nonces: string[] = [],
    searchParameters?: RecordSearchParams,
  ) {
    if (!isClient || !aleo) {
      throw new Error("Aleo SDK not available")
    }

    try {
      // Ensure the Aleo SDK is initialized
      await initializeAleo()

      // Create a network client if not provided
      if (!this.networkClient) {
        this.networkClient = new aleo.AleoNetworkClient("https://api.explorer.aleo.org/v1")
      }

      // Create search parameters
      const params = searchParameters || {}

      // Set up block height search if provided
      let blockHeightSearch
      if (params.startHeight && params.endHeight) {
        blockHeightSearch = new aleo.BlockHeightSearch(params.startHeight, params.endHeight)
      }

      // Find the records
      const records = await this.networkClient.findCreditsRecords(
        this.account,
        microcredits,
        unspent,
        nonces,
        blockHeightSearch,
      )

      return records
    } catch (error) {
      console.error("Failed to find credits records:", error)
      throw error
    }
  }

  // Find records from a specific program
  async findRecords(unspent = true, nonces: string[] = [], searchParameters?: RecordSearchParams) {
    if (!isClient || !aleo) {
      throw new Error("Aleo SDK not available")
    }

    try {
      // Ensure the Aleo SDK is initialized
      await initializeAleo()

      // Create a network client if not provided
      if (!this.networkClient) {
        this.networkClient = new aleo.AleoNetworkClient("https://api.explorer.aleo.org/v1")
      }

      // Create search parameters
      const params = searchParameters || {}

      // Set up block height search if provided
      let blockHeightSearch
      if (params.startHeight && params.endHeight) {
        blockHeightSearch = new aleo.BlockHeightSearch(params.startHeight, params.endHeight)
      }

      // Find the records
      const records = await this.networkClient.findRecords(
        this.account,
        params.startHeight || 0,
        params.endHeight || 0,
        unspent,
        params.programs || [],
        nonces,
        blockHeightSearch,
      )

      return records
    } catch (error) {
      console.error("Failed to find records:", error)
      throw error
    }
  }
}

// Create and initialize a NetworkRecordProvider
export const createNetworkRecordProvider = async (
  privateKey: string,
  networkUrl = "https://api.explorer.aleo.org/v1",
) => {
  if (!isClient || !aleo) {
    throw new Error("Aleo SDK not available")
  }

  try {
    // Ensure the Aleo SDK is initialized
    await initializeAleo()

    // Create an account from the private key
    const account = new aleo.Account({ privateKey })

    // Create a network client
    const networkClient = new aleo.AleoNetworkClient(networkUrl)

    // Create a record provider
    const recordProvider = new NetworkRecordProvider(account, networkClient)

    return recordProvider
  } catch (error) {
    console.error("Failed to create network record provider:", error)
    throw error
  }
}
