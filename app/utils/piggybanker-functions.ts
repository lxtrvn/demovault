export interface PiggyBankerFunction {
  name: string
  description: string
  inputs: {
    name: string
    type: string
    description: string
    placeholder: string
    isRecord?: boolean
  }[]
}

export const PIGGYBANKER_FUNCTIONS: Record<string, PiggyBankerFunction> = {
  deposit: {
    name: "deposit",
    description: "Deposit funds into your PiggyBank",
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
    description: "Withdraw funds from your PiggyBank",
    inputs: [
      {
        name: "record",
        type: "record",
        description: "PiggyBank record to withdraw from",
        placeholder: "record1...",
        isRecord: true,
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
        description: "PiggyBank record to transfer from",
        placeholder: "record1...",
        isRecord: true,
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
  create_piggybank: {
    name: "create_piggybank",
    description: "Create a new PiggyBank",
    inputs: [
      {
        name: "amount",
        type: "u64",
        description: "Initial amount",
        placeholder: "1000u64",
      },
    ],
  },
}

export const PIGGYBANKER_FUNCTION_NAMES = Object.keys(PIGGYBANKER_FUNCTIONS)
