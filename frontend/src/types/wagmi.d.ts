declare module 'wagmi' {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

// EIP-6963: Multi Injected Provider Discovery
interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    isMetaMask?: boolean;
  };
}

interface EIP6963AnnounceProviderEvent extends CustomEvent {
  type: 'eip6963:announceProvider';
  detail: EIP6963ProviderDetail;
}

interface EIP6963RequestProviderEvent extends CustomEvent {
  type: 'eip6963:requestProvider';
}

declare global {
  interface WindowEventMap {
    'eip6963:announceProvider': EIP6963AnnounceProviderEvent;
    'eip6963:requestProvider': EIP6963RequestProviderEvent;
  }
} 