import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient("https://glorious-kiwi-580.convex.cloud");

async function main() {
  const products = await client.query(api.products.listProducts, { groupId: "jd7f771m3en4trpt17d8evgq9185qn4h" });
  
  const noBrand = products.filter(p => !p.brand);
  const noCategory = products.filter(p => !p.category);
  
  console.log(`B299 2호 Total: ${products.length}`);
  console.log(`Missing Brand: ${noBrand.length}`);
  console.log(`Missing Category: ${noCategory.length}`);
  
  if (noBrand.length > 0) {
    console.log("Sample missing brand:", noBrand.slice(0, 3).map(p => p.name));
  }
}

main();
