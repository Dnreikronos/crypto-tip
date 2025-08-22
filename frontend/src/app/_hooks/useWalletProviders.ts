import { useSyncExternalStore } from "react";
import type { EIP1193Provider } from "@/app/types/wallet";

declare global {
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent<{
      info: EIP6963ProviderInfo;
      provider: EIP1193Provider;
    }>;
  }
}

let providers: EIP6963ProviderDetail[] = [];

const store = {
  value: () => providers,
  subscribe: (callback: () => void) => {
    function onAnnouncement(
      event: CustomEvent<{
        info: EIP6963ProviderInfo;
        provider: EIP1193Provider;
      }>,
    ) {
      if (providers.map((p) => p.info.uuid).includes(event.detail.info.uuid))
        return;
      providers = [
        ...providers,
        {
          info: event.detail.info,
          provider: event.detail.provider,
        },
      ];
      callback();
    }

    window.addEventListener("eip6963:announceProvider", onAnnouncement);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () =>
      window.removeEventListener("eip6963:announceProvider", onAnnouncement);
  },
};

export function useWalletProviders() {
  return useSyncExternalStore(store.subscribe, store.value, store.value);
}
