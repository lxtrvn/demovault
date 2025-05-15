export interface DepositVaultFunction {
  name: string
  description: string
  inputs: {
    name: string
    type: string
    description: string
    placeholder: string
  }[]
}

export const DEPOSIT_VAULT_FUNCTIONS: Record<string, DepositVaultFunction> = {
  deposit: {
    name: "deposit",
    description: "Deposit funds into your vault",
    inputs: [
      {
        name: "amount",
        type: "u64",
        description: "Amount to deposit",
        placeholder: "1000u64",
      },
    ],
  },
  withdraw: {
    name: "withdraw",
    description: "Withdraw funds from your vault",
    inputs: [
      {
        name: "record",
        type: "record",
        description: "Vault record to withdraw from",
        placeholder: "record1...",
      },
      {
        name: "amount",
        type: "u64",
        description: "Amount to withdraw",
        placeholder: "500u64",
      },
    ],
  },
  transfer: {
    name: "transfer",
    description: "Transfer funds to another address",
    inputs: [
      {
        name: "record",
        type: "record",
        description: "Vault record to transfer from",
        placeholder: "record1...",
      },
      {
        name: "recipient",
        type: "address",
        description: "Recipient address",
        placeholder: "aleo1...",
      },
      {
        name: "amount",
        type: "u64",
        description: "Amount to transfer",
        placeholder: "500u64",
      },
    ],
  },
  create_vault: {
    name: "create_vault",
    description: "Create a new vault",
    inputs: [
      {
        name: "amount",
        type: "u64",
        description: "Initial amount",
        placeholder: "1000u64",
      },
      {
        name: "expiry",
        type: "u32",
        description: "Expiry block height",
        placeholder: "1000000u32",
      },
    ],
  },
}

export const DEPOSIT_VAULT_FUNCTION_NAMES = Object.keys(DEPOSIT_VAULT_FUNCTIONS)
