import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient("https://glorious-kiwi-580.convex.cloud");

async function main() {
  console.log("Starting auto-categorization on production...");
  try {
    const updatedCount = await client.mutation(api.products.autoCategorizeAll);
    console.log(`Successfully categorized ${updatedCount} products.`);
  } catch (error) {
    console.error("Error during auto-categorization:", error);
  }
}

main();
