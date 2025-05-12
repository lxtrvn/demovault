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

// Initialize Aleo SDK
export const initializeAleo = async () => {
  if (!isClient || !aleo) {
    return false
  }

  try {
    // Initialize the WebAssembly module
    await aleo.initializeWasm()
    console.log("Aleo WASM initialized successfully")
    return true
  } catch (error) {
    console.error("Failed to initialize Aleo WASM:", error)
    return false
  }
}

// Generate a new Aleo account
export const generateAccount = async () => {
  if (!isClient || !aleo) {
    throw new Error("Aleo SDK not available")
  }

  try {
    const account = new aleo.Account()
    return {
      privateKey: account.privateKey(),
      viewKey: account.viewKey(),
      address: account.address().to_string(),
    }
  } catch (error) {
    console.error("Failed to generate Aleo account:", error)
    throw error
  }
}

// Import an existing Aleo account from private key
export const importAccount = async (privateKey: string) => {
  if (!isClient || !aleo) {
    throw new Error("Aleo SDK not available")
  }

  try {
    const account = new aleo.Account({ privateKey })
    return {
      privateKey: account.privateKey(),
      viewKey: account.viewKey(),
      address: account.address().to_string(),
    }
  } catch (error) {
    console.error("Failed to import Aleo account:", error)
    throw error
  }
}

// Import an existing Aleo account from view key
export const importAccountFromViewKey = async (viewKey: string) => {
  if (!isClient || !aleo) {
    throw new Error("Aleo SDK not available")
  }

  try {
    // Create a view key instance
    const aleoViewKey = new aleo.ViewKey(viewKey)

    // Get the address from the view key
    const address = aleoViewKey.to_address().to_string()

    return {
      viewKey,
      address,
    }
  } catch (error) {
    console.error("Failed to import Aleo account from view key:", error)
    throw error
  }
}

// Execute a Leo program
export const executeLeoProgram = async ({
  programId,
  functionName,
  inputs,
  privateKey,
  fee = 0.01, // Default fee in credits
  networkUrl = "https://api.explorer.aleo.org/v1",
}: {
  programId: string
  functionName: string
  inputs: string[]
  privateKey: string
  fee?: number
  networkUrl?: string
}) => {
  if (!isClient || !aleo) {
    throw new Error("Aleo SDK not available")
  }

  try {
    // Initialize the account from the private key
    const account = new aleo.Account({ privateKey })

    // Create a program manager to interact with the Aleo network
    const programManager = new aleo.ProgramManager(networkUrl, account, {
      // Optional cache settings
      cacheLevel: aleo.AleoWorkerCacheLevel.Network,
    })

    // Convert fee to microcredits (1 credit = 1,000,000 microcredits)
    const feeInMicrocredits = BigInt(Math.floor(fee * 1_000_000))

    // Execute the program
    console.log(`Executing ${programId}.${functionName} with inputs:`, inputs)

    // Create the execution
    const execution = await programManager.execute({
      programId,
      functionName,
      inputs,
      fee: feeInMicrocredits,
    })

    // Wait for the transaction to be confirmed
    const transaction = await execution.transaction()
    const transactionId = transaction.id()

    console.log(`Transaction submitted with ID: ${transactionId}`)

    // Return transaction details
    return {
      transactionId,
      status: "submitted",
      programId,
      functionName,
    }
  } catch (error) {
    console.error("Failed to execute Leo program:", error)
    throw error
  }
}

// Get transaction status
export const getTransactionStatus = async (transactionId: string, networkUrl = "https://api.explorer.aleo.org/v1") => {
  try {
    const response = await fetch(`${networkUrl}/transaction/${transactionId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch transaction status: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      transactionId,
      status: data.status,
      blockHeight: data.block_height,
      timestamp: data.timestamp,
    }
  } catch (error) {
    console.error("Failed to get transaction status:", error)
    throw error
  }
}

// Parse Leo program input string into array of inputs
export const parseLeoInputs = (inputString: string): string[] => {
  // Remove any whitespace and split by commas
  return inputString
    .split(",")
    .map((input) => input.trim())
    .filter((input) => input.length > 0)
}

// Decrypt an Aleo record using a view key
export const decryptRecord = async (ciphertext: string, viewKey: string) => {
  if (!isClient || !aleo) {
    throw new Error("Aleo SDK not available")
  }

  try {
    // Validate the view key format
    if (!viewKey.startsWith("AViewKey")) {
      throw new Error("Invalid view key format. View key should start with 'AViewKey'")
    }

    // Create a view key instance
    const aleoViewKey = new aleo.ViewKey(viewKey)

    // Decrypt the record
    const record = aleo.Record.fromString(ciphertext, aleoViewKey)

    // Extract record information
    const recordInfo = {
      owner: record.owner().to_string(),
      gates: record.gates().to_string(),
      data: {} as Record<string, string>,
      serialNumber: record.serialNumber()?.to_string() || null,
      programId: record.programId() || null,
      isSpent: false, // We can't determine this without querying the network
      commitment: record.commitment().to_string(),
      ciphertext: ciphertext,
    }

    // Extract record entries
    const entries = record.entries()
    if (entries) {
      for (let i = 0; i < entries.size(); i++) {
        const entry = entries.get(i)
        const name = entry.name()
        const value = entry.value().to_string()
        recordInfo.data[name] = value
      }
    }

    return recordInfo
  } catch (error) {
    console.error("Failed to decrypt record:", error)
    throw error
  }
}

// Check if a record is spent on the network
export const checkRecordStatus = async (serialNumber: string, networkUrl = "https://api.explorer.aleo.org/v1") => {
  try {
    const response = await fetch(`${networkUrl}/find/serialNumber/${serialNumber}`)
    if (!response.ok) {
      // If the response is not OK, it might mean the record is not spent
      // or there was an error with the request
      if (response.status === 404) {
        return { isSpent: false }
      }
      throw new Error(`Failed to check record status: ${response.statusText}`)
    }

    // If we get a successful response, the record is spent
    return { isSpent: true }
  } catch (error) {
    console.error("Failed to check record status:", error)
    // Default to assuming the record is not spent if we can't verify
    return { isSpent: false }
  }
}

// Get all programs deployed on the network
export const getPrograms = async (networkUrl = "https://api.explorer.aleo.org/v1") => {
  try {
    const response = await fetch(`${networkUrl}/programs?start=0&end=100`)
    if (!response.ok) {
      throw new Error(`Failed to fetch programs: ${response.statusText}`)
    }

    const data = await response.json()
    return data.programs || []
  } catch (error) {
    console.error("Failed to get programs:", error)
    throw error
  }
}

// Get all mappings for a program
export const getProgramMappings = async (programId: string, networkUrl = "https://api.explorer.aleo.org/v1") => {
  try {
    const response = await fetch(`${networkUrl}/program/${programId}/mappings`)
    if (!response.ok) {
      throw new Error(`Failed to fetch program mappings: ${response.statusText}`)
    }

    const data = await response.json()
    return data.mappings || []
  } catch (error) {
    console.error("Failed to get program mappings:", error)
    throw error
  }
}

// Get unspent records for an address
export const getUnspentRecords = async ({
  address,
  viewKey,
  programId = "credits.aleo", // Default to credits program
  networkUrl = "https://api.explorer.aleo.org/v1",
  page = 1,
  limit = 50,
}: {
  address: string
  viewKey: string
  programId?: string
  networkUrl?: string
  page?: number
  limit?: number
}) => {
  if (!isClient || !aleo) {
    throw new Error("Aleo SDK not available")
  }

  try {
    // Validate address format
    if (!address.startsWith("aleo1")) {
      throw new Error("Invalid address format. Address should start with 'aleo1'")
    }

    // Validate view key format
    if (!viewKey.startsWith("AViewKey")) {
      throw new Error("Invalid view key format. View key should start with 'AViewKey'")
    }

    // Create a view key instance
    const aleoViewKey = new aleo.ViewKey(viewKey)

    // Calculate offset
    const offset = (page - 1) * limit

    // Fetch unspent records for the address
    const response = await fetch(
      `${networkUrl}/records/${address}?start=${offset}&end=${offset + limit}&program_id=${programId}`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch records: ${response.statusText}`)
    }

    const data = await response.json()
    const records = data.records || []

    // Decrypt each record
    const decryptedRecords = await Promise.all(
      records.map(async (record: any) => {
        try {
          // Decrypt the record
          const decryptedRecord = await decryptRecord(record.ciphertext, viewKey)

          // Check if the record is spent
          if (decryptedRecord.serialNumber) {
            const status = await checkRecordStatus(decryptedRecord.serialNumber)
            decryptedRecord.isSpent = status.isSpent
          }

          return {
            ...decryptedRecord,
            blockHeight: record.block_height,
            transactionId: record.transaction_id,
          }
        } catch (error) {
          console.error("Failed to decrypt record:", error)
          return null
        }
      }),
    )

    // Filter out null records (failed decryption)
    const validRecords = decryptedRecords.filter((record) => record !== null)

    return {
      records: validRecords,
      total: data.total || records.length,
      page,
      limit,
      hasMore: records.length === limit,
    }
  } catch (error) {
    console.error("Failed to get unspent records:", error)
    throw error
  }
}

// Get all transactions for an address
export const getAddressTransactions = async ({
  address,
  networkUrl = "https://api.explorer.aleo.org/v1",
  page = 1,
  limit = 20,
}: {
  address: string
  networkUrl?: string
  page?: number
  limit?: number
}) => {
  try {
    // Calculate offset
    const offset = (page - 1) * limit

    // Fetch transactions for the address
    const response = await fetch(`${networkUrl}/address/${address}/transactions?start=${offset}&end=${offset + limit}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      transactions: data.transactions || [],
      total: data.total || 0,
      page,
      limit,
      hasMore: (data.transactions || []).length === limit,
    }
  } catch (error) {
    console.error("Failed to get address transactions:", error)
    throw error
  }
}

// Validate an Aleo address
export const isValidAleoAddress = (address: string): boolean => {
  return address.startsWith("aleo1") && address.length === 63
}

// Validate an Aleo view key
export const isValidAleoViewKey = (viewKey: string): boolean => {
  return viewKey.startsWith("AViewKey") && viewKey.length === 53
}

// Validate an Aleo private key
export const isValidAleoPrivateKey = (privateKey: string): boolean => {
  return privateKey.startsWith("APrivateKey") && privateKey.length === 59
}

// Parse microcredits to credits
export const microcreditsToCredits = (microcredits: string): number => {
  // Remove the u64 suffix if present
  const cleanValue = microcredits.endsWith("u64") ? microcredits.slice(0, -3) : microcredits

  // Convert to number and divide by 1,000,000
  return Number(cleanValue) / 1_000_000
}

// Format credits to microcredits with u64 suffix
export const creditsToMicrocredits = (credits: number): string => {
  return `${Math.floor(credits * 1_000_000)}u64`
}

// Create and execute a transfer transaction
export const transferCredits = async ({
  privateKey,
  record,
  recipientAddress,
  amount,
  fee = 0.01, // Default fee in credits
  networkUrl = "https://api.explorer.aleo.org/v1",
}: {
  privateKey: string
  record: any // The record to spend
  recipientAddress: string
  amount: number // Amount in credits
  fee?: number
  networkUrl?: string
}) => {
  if (!isClient || !aleo) {
    throw new Error("Aleo SDK not available")
  }

  try {
    // Validate inputs
    if (!isValidAleoPrivateKey(privateKey)) {
      throw new Error("Invalid private key format")
    }

    if (!isValidAleoAddress(recipientAddress)) {
      throw new Error("Invalid recipient address format")
    }

    if (!record || !record.ciphertext) {
      throw new Error("Invalid record")
    }

    // Initialize the account from the private key
    const account = new aleo.Account({ privateKey })

    // Create a program manager to interact with the Aleo network
    const programManager = new aleo.ProgramManager(networkUrl, account, {
      cacheLevel: aleo.AleoWorkerCacheLevel.Network,
    })

    // Convert amount and fee to microcredits
    const amountInMicrocredits = creditsToMicrocredits(amount)
    const feeInMicrocredits = BigInt(Math.floor(fee * 1_000_000))

    // Prepare inputs for the transfer function
    // The credits.aleo transfer function expects:
    // 1. The record to spend
    // 2. The recipient address
    // 3. The amount to transfer in microcredits
    const inputs = [
      record.ciphertext, // The record ciphertext
      recipientAddress, // The recipient address
      amountInMicrocredits, // The amount to transfer
    ]

    console.log(`Executing credits.aleo transfer with inputs:`, inputs)

    // Execute the transfer
    const execution = await programManager.execute({
      programId: "credits.aleo",
      functionName: "transfer",
      inputs,
      fee: feeInMicrocredits,
    })

    // Wait for the transaction to be confirmed
    const transaction = await execution.transaction()
    const transactionId = transaction.id()

    console.log(`Transfer transaction submitted with ID: ${transactionId}`)

    // Return transaction details
    return {
      transactionId,
      status: "submitted",
      programId: "credits.aleo",
      functionName: "transfer",
      amount,
      recipient: recipientAddress,
      fee,
    }
  } catch (error) {
    console.error("Failed to execute transfer:", error)
    throw error
  }
}

// Create and execute a transfer_private transaction
export const transferPrivateCredits = async ({
  privateKey,
  record,
  recipientAddress,
  amount,
  fee = 0.01, // Default fee in credits
  networkUrl = "https://api.explorer.aleo.org/v1",
}: {
  privateKey: string
  record: any // The record to spend
  recipientAddress: string
  amount: number // Amount in credits
  fee?: number
  networkUrl?: string
}) => {
  if (!isClient || !aleo) {
    throw new Error("Aleo SDK not available")
  }

  try {
    // Validate inputs
    if (!isValidAleoPrivateKey(privateKey)) {
      throw new Error("Invalid private key format")
    }

    if (!isValidAleoAddress(recipientAddress)) {
      throw new Error("Invalid recipient address format")
    }

    if (!record || !record.ciphertext) {
      throw new Error("Invalid record")
    }

    // Initialize the account from the private key
    const account = new aleo.Account({ privateKey })

    // Create a program manager to interact with the Aleo network
    const programManager = new aleo.ProgramManager(networkUrl, account, {
      cacheLevel: aleo.AleoWorkerCacheLevel.Network,
    })

    // Convert amount and fee to microcredits
    const amountInMicrocredits = creditsToMicrocredits(amount)
    const feeInMicrocredits = BigInt(Math.floor(fee * 1_000_000))

    // Prepare inputs for the transfer_private function
    // The credits.aleo transfer_private function expects:
    // 1. The record to spend
    // 2. The recipient address
    // 3. The amount to transfer in microcredits
    const inputs = [
      record.ciphertext, // The record ciphertext
      recipientAddress, // The recipient address
      amountInMicrocredits, // The amount to transfer
    ]

    console.log(`Executing credits.aleo transfer_private with inputs:`, inputs)

    // Execute the transfer_private
    const execution = await programManager.execute({
      programId: "credits.aleo",
      functionName: "transfer_private",
      inputs,
      fee: feeInMicrocredits,
    })

    // Wait for the transaction to be confirmed
    const transaction = await execution.transaction()
    const transactionId = transaction.id()

    console.log(`Transfer private transaction submitted with ID: ${transactionId}`)

    // Return transaction details
    return {
      transactionId,
      status: "submitted",
      programId: "credits.aleo",
      functionName: "transfer_private",
      amount,
      recipient: recipientAddress,
      fee,
    }
  } catch (error) {
    console.error("Failed to execute private transfer:", error)
    throw error
  }
}

// Calculate the maximum amount that can be transferred from a record
export const calculateMaxTransferAmount = (record: any): number => {
  if (!record || !record.gates) {
    return 0
  }

  // Get the gates value (credits amount)
  let gates = record.gates

  // Remove the u64 suffix if present
  if (typeof gates === "string" && gates.endsWith("u64")) {
    gates = gates.slice(0, -3)
  }

  // Convert to number and to credits
  const creditsAmount = Number(gates) / 1_000_000

  // Reserve some credits for the fee (minimum 0.01)
  const reserveForFee = 0.01

  // Return the maximum amount that can be transferred
  return Math.max(0, creditsAmount - reserveForFee)
}
