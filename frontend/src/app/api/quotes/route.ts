import { NextResponse } from "next/server";

type CMCQuote = { quote: { USD: { price: number } } };
interface CMCResponse {
  data: Record<string, CMCQuote>;
}

interface CoinGeckoResponse {
  ethereum: {
    usd: number;
  };
}

// Fallback function using CoinGecko API (free)
async function fetchPriceFromCoinGecko(): Promise<number> {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";

  console.log("Fetching from CoinGecko:", url);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data = (await response.json()) as CoinGeckoResponse;
  console.log("CoinGecko response:", data);

  const price = data?.ethereum?.usd;
  if (typeof price !== "number" || price <= 0) {
    throw new Error("Invalid price from CoinGecko");
  }

  return price;
}

// Function to fetch from CoinMarketCap
async function fetchPriceFromCMC(
  symbol: string,
  slug: string | null,
): Promise<number> {
  const queryParam = slug ? `slug=${slug}` : `symbol=${symbol}`;
  const apiKey = process.env.NEXT_CMC_PRO_API_KEY;
  const apiUrl =
    process.env.NEXT_PUBLIC_CMC_PRO_API_URL ||
    "https://pro-api.coinmarketcap.com";

  if (!apiKey) {
    throw new Error("CMC API key not configured");
  }

  const fullApiUrl = `${apiUrl}/v2/cryptocurrency/quotes/latest?${queryParam}&convert=USD`;

  console.log("Making request to CMC:", fullApiUrl);

  const res = await fetch(fullApiUrl, {
    headers: {
      "X-CMC_PRO_API_KEY": apiKey,
      Accept: "application/json",
    },
  });

  console.log("CMC Response status:", res.status, res.statusText);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("CMC API Error:", errorData);
    throw new Error(`CMC API error: ${res.status}`);
  }

  const responseData = (await res.json()) as CMCResponse;
  console.log("CMC Full Response:", JSON.stringify(responseData, null, 2));

  const { data } = responseData;
  const entries = Object.values(data);

  if (entries.length === 0) {
    throw new Error("No data returned from CMC");
  }

  const price = entries[0]?.quote?.USD?.price;
  console.log("Extracted price from CMC:", price, typeof price);

  if (typeof price !== "number" || price <= 0) {
    throw new Error("Invalid price from CMC");
  }

  return price;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const symbol = searchParams.get("symbol");

  console.log("API Request params:", { slug, symbol });

  if (!slug && !symbol) {
    return NextResponse.json(
      { error: "Missing slug or symbol parameter" },
      { status: 400 },
    );
  }

  // For ETH, we can use CoinGecko as primary since it's more reliable and free
  if (symbol === "ETH" || slug === "ethereum") {
    try {
      console.log("Attempting to fetch ETH price from CoinGecko...");
      const price = await fetchPriceFromCoinGecko();
      console.log("Successfully fetched price from CoinGecko:", price);
      return NextResponse.json({ price });
    } catch (coinGeckoError) {
      console.warn("CoinGecko failed, trying CMC:", coinGeckoError);

      // Fallback to CMC if CoinGecko fails
      try {
        const price = await fetchPriceFromCMC(symbol || "ETH", slug);
        console.log("Successfully fetched price from CMC:", price);
        return NextResponse.json({ price });
      } catch (cmcError) {
        console.error("Both APIs failed:", { coinGeckoError, cmcError });
        return NextResponse.json(
          {
            error: "Failed to fetch ETH price from all sources",
            details: {
              coinGecko:
                coinGeckoError instanceof Error
                  ? coinGeckoError.message
                  : "Unknown error",
              cmc:
                cmcError instanceof Error ? cmcError.message : "Unknown error",
            },
          },
          { status: 503 },
        );
      }
    }
  }

  // For other cryptocurrencies, try CMC first then CoinGecko
  try {
    console.log("Attempting to fetch price from CMC...");
    const price = await fetchPriceFromCMC(symbol!, slug);
    console.log("Successfully fetched price from CMC:", price);
    return NextResponse.json({ price });
  } catch (cmcError) {
    console.warn("CMC failed:", cmcError);

    // For non-ETH, we could add more fallbacks here if needed
    return NextResponse.json(
      {
        error: "Failed to fetch cryptocurrency price",
        details: cmcError instanceof Error ? cmcError.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
