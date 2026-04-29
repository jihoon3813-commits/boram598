import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient("https://glorious-kiwi-580.convex.cloud");

async function main() {
  const products = await client.query(api.products.listProducts, {});
  console.log("Total products on Prod:", products.length);
  const myProducts = products.filter(p => p.groupId === "jd7f771m3en4trpt17d8evgq9185qn4h");
  console.log("Products for B299 2호:", myProducts.length);
  if (myProducts.length > 0) {
    console.log("Sample:", myProducts[0]);
  }
}

main();
