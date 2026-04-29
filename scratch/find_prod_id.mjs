import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient("https://glorious-kiwi-580.convex.cloud");

async function main() {
  const groups = await client.query(api.products.listGroups);
  const target = groups.find(g => g.name.includes("B299 2호"));
  console.log("PROD ID:", target?._id);
}

main();
