const POLYMARKET_MARKETS_URL =
  "https://gamma-api.polymarket.com/markets?active=true&closed=false";
const KALSHI_MARKETS_URL =
  "https://external-api.kalshi.com/trade-api/v2/markets?status=open&mve_filter=exclude&limit=100";

//list of active markets from both polymarket and kalshi (normalized to a common format)
let activeMarkets = [];

//gets json data from a url (from api)
async function getJson(url) 
{
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Market request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

//normalize data to have this format:
/*{
  source,
  id,
  question,
  outcomes,
  outcomePrices,
  closeDate,
  volume
}*/

function normalizePolymarketMarket(market) 
{
  const names = JSON.parse(market.outcomes);
  const prices = JSON.parse(market.outcomePrices);

  return {
    source: "polymarket",
    id: market.id,
    question: market.question,
    outcomes: names,
    outcomePrices: prices.map(Number),
    closeDate: market.endDate,
    volume: Number(market.volume),
  };
}

function normalizeKalshiMarket(market) {
  return {
    source: "kalshi",
    id: market.ticker,
    question: market.title,
    outcomes: ["Yes", "No"],
    outcomePrices: [
      Number(market.yes_ask_dollars),
      Number(market.no_ask_dollars),
    ],
    closeDate: market.close_time,
    volume: Number(market.volume_fp),
  };
}

//pull the data from the api

export async function loadActiveMarkets() {
  const [polymarket, kalshi] = await Promise.all([
    getJson(POLYMARKET_MARKETS_URL),
    getJson(KALSHI_MARKETS_URL),
  ]);

  activeMarkets = [
    ...polymarket.map(normalizePolymarketMarket),
    ...kalshi.markets.map(normalizeKalshiMarket),
  ];

  // temporary -- log data to see what result is
  console.log("Active markets:", activeMarkets);

  return activeMarkets;
}

export function getActiveMarkets() {
  return activeMarkets;
}
