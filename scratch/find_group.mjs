import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function main() {
  const groups = await client.query(api.products.listGroups);
  const target = groups.find(g => g.name.includes("B299 2호"));
  console.log(JSON.stringify(target, null, 2));
}

main();
