import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import fs from "fs";

const PROD_URL = "https://glorious-kiwi-580.convex.cloud";
const client = new ConvexHttpClient(PROD_URL);

const products = JSON.parse(fs.readFileSync("all_products.json", "utf8"));
const groupId = "jd7f771m3en4trpt17d8evgq9185qn4h";

async function main() {
  console.log("Clearing existing products for group...");
  await client.mutation(api.products.clearGroupProducts, { groupId });
  console.log("Cleared.");

  const chunkSize = 15;
  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    const chunkWithOrder = chunk.map((p, idx) => ({ ...p, order: i + idx }));
    const jsonData = JSON.stringify(chunkWithOrder);
    
    console.log(`Pushing chunk ${Math.floor(i / chunkSize) + 1}...`);
    try {
      await client.mutation(api.products.addProductsBulk, {
        groupId,
        jsonData,
      });
      console.log(`Chunk ${Math.floor(i / chunkSize) + 1} pushed successfully.`);
    } catch (e) {
      console.error(`Error in chunk ${Math.floor(i / chunkSize) + 1}:`, e);
    }
  }
  console.log("All chunks processed successfully!");
}

main();
