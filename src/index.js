import { loadActiveMarkets } from "./backend/apiConnect.js";

// Fetch once when the application starts.
loadActiveMarkets().catch((error) => {
  console.error("Unable to load active Polymarket markets:", error);
});
