// Add type declarations for window.ethereum
interface Window {
  ethereum?: any
}

// Add type declarations for the Leo wallet adapter
declare module "@demox-labs/aleo-wallet-adapter-leo" {
  import { Adapter } from "@demox-labs/aleo-wallet-adapter-base"
  export class LeoWalletAdapter extends Adapter {}
}
