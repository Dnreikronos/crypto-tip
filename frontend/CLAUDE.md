# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack (Next.js 15)
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run Next.js ESLint linting
- `npm run format:check` - Check code formatting with Prettier
- `npm run format:write` - Format code with Prettier

No test commands are configured in package.json - this codebase does not have test infrastructure set up.

## Architecture Overview

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Blockchain Integration**: Dual blockchain support (Ethereum via Wagmi + Ethers, Solana via @solana/web3.js)
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: React Query (TanStack) for server state, React Context for auth
- **Authentication**: Custom auth system with cookie-based sessions

### Project Structure

**Core Application Flow:**
```
src/app/layout.tsx -> Provider chain: WalletProvider -> Providers -> AuthProvider
```

**Key Directories:**
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable components (ui/, sections/, layout/)
- `src/contexts/` - React contexts (AuthContext)
- `src/services/` - API services (donationService, contractService, projectService)
- `src/providers/` - Provider components for React Query and wallet integration
- `src/config/` - Configuration files (wagmi, API URLs, protected routes)
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility libraries

### Blockchain Integration Pattern

**Ethereum Integration:**
- Wagmi configuration in `src/config/wagmi.ts` (mainnet only, MetaMask connector)
- Contract service in `src/services/contractService.ts` using ethers.js
- Contract ABI in `src/contracts/DonationContract.json`

**Solana Integration:**
- Direct @solana/web3.js usage
- Type definitions in `types/solana-web3.d.ts`

### Authentication Architecture

**Flow**: Custom auth system using cookie-based sessions
- `src/contexts/AuthContext.tsx` - Main auth context with login/logout/checkAuth
- `src/lib/auth.ts` - Auth utilities and API calls
- Protected routes defined in `src/config.ts` (PROTECTED_ROUTES, PUBLIC_ROUTES)
- Middleware protection in `src/middleware.ts`

### Component Patterns

**UI Components**: Located in `src/components/ui/` - mix of custom components and Radix UI primitives
**Sections**: Page-specific components in `src/components/sections/`
**Layout**: Global layout components (Navbar, Footer) in `src/components/layout/`

### API Integration

**Backend Communication:**
- Base API URL configured via `NEXT_PUBLIC_API_URL` environment variable
- Default: `http://localhost:9090`
- Services use `getAuthHeaders()` from auth lib for authenticated requests
- Main services: donationService, projectService

### Key Dependencies

**Blockchain**: @wagmi/core, wagmi, ethers, @solana/web3.js, viem
**UI/Styling**: @radix-ui/*, tailwindcss, framer-motion, lucide-react
**Data**: @tanstack/react-query, react-hook-form, zod
**Development**: Next.js 15, TypeScript, ESLint, Prettier

### Environment Configuration

Required environment variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_DONATION_CONTRACT_ADDRESS` - Ethereum contract address
- `NODE_ENV` - Environment (affects cookie security)