import { NextResponse } from "next/server";

type CMCQuote = { quote: { USD: { price: number } } };
interface CMCResponse {
  data: Record<string, CMCQuote>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const symbol = searchParams.get("symbol");
  if (!slug && !symbol) {
    return NextResponse.json(
      { error: "Missing slug or symbol parameter" },
      { status: 400 },
    );
  }
  const queryParam = slug ? `slug=${slug}` : `symbol=${symbol}`;
  const apiKey = process.env.NEXT_CMC_PRO_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "CMC API key not configured" },
      { status: 500 },
    );
  }
  const apiUrl = `${process.env.NEXT_PUBLIC_CMC_PRO_API_URL}/v2/cryptocurrency/quotes/latest?${queryParam}&convert=USD`;
  const res = await fetch(apiUrl, {
    headers: {
      "X-CMC_PRO_API_KEY": apiKey,
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: "Failed to fetch from CoinMarketCap", details: errorData },
      { status: res.status },
    );
  }
  const { data } = (await res.json()) as CMCResponse;
  const entries = Object.values(data);
  if (entries.length === 0) {
    return NextResponse.json({ error: "No data returned" }, { status: 404 });
  }
  const price = entries[0]?.quote?.USD?.price;
  return NextResponse.json({ price });
}
