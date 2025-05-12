import { http, createConfig } from '@wagmi/core'
import { mainnet, linea, lineaSepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [mainnet, linea, lineaSepolia],
  connectors: [metaMask()],
  transports: {
    [mainnet.id]: http(),
    [linea.id]: http(),
    [lineaSepolia.id]: http(),
  },
}) 