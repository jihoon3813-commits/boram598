import axios from "axios";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const isProd = process.argv.includes("--prod");
const CONVEX_URL = isProd 
  ? "https://glorious-kiwi-580.convex.cloud" 
  : (process.env.VITE_CONVEX_URL || "https://charming-clam-937.convex.cloud");

console.log(`Targeting Convex environment: ${isProd ? "PRODUCTION" : "DEVELOPMENT"} (${CONVEX_URL})`);
const client = new ConvexHttpClient(CONVEX_URL);

async function fetchTheme(themesNo) {
  const url = `https://boram.lifenuri.com/shop/themes/${themesNo}/list`;
  const params = new URLSearchParams();
  params.append('actions', 'goods');
  params.append('themes_no', themesNo.toString());

  try {
    const resp = await axios.post(url, params.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": `https://boram.lifenuri.com/shop/themesgroup/${themesNo + 1}`
      },
      timeout: 15000
    });
    if (resp.data.return_code === 1000 && resp.data.themeslistrow) {
      return resp.data.themeslistrow;
    }
  } catch (e) {
    console.error(`Error Theme ${themesNo}:`, e.message);
  }
  return [];
}

async function main() {
  const groups = await client.query(api.products.listGroups);
  
  const mappings = [
    {
      key: "1",
      themes: [134],
      groupNamePattern: "B299 1"
    },
    {
      key: "2",
      themes: [139],
      groupNamePattern: "B299 2"
    },
    {
      key: "3",
      themes: [144],
      groupNamePattern: "B299 3"
    },
    {
      key: "4",
      themes: [149],
      groupNamePattern: "B299 4"
    }
  ];

  for (const mapping of mappings) {
    const groupDoc = groups.find(g => g.name.includes(mapping.groupNamePattern));
    if (!groupDoc) {
      console.warn(`Could not find group in DB matching pattern: ${mapping.groupNamePattern}`);
      continue;
    }

    console.log(`\n========================================`);
    console.log(`Syncing group: "${groupDoc.name}" (_id: ${groupDoc._id})`);
    console.log(`Fetching themes: ${mapping.themes.join(", ")}`);

    const seen = new Set();
    const products = [];

    for (const themeId of mapping.themes) {
      const items = await fetchTheme(themeId);
      console.log(`  Theme ${themeId}: found ${items.length} items`);
      for (const item of items) {
        if (!seen.has(item.goods_code)) {
          seen.add(item.goods_code);
          
          let thumbnail = item.goods_image_main2 || "";
          if (thumbnail && !thumbnail.startsWith("http")) {
            thumbnail = `https://boram.lifenuri.com${thumbnail}`;
          }

          products.push({
            name: item.goods_title,
            thumbnail,
            paymentMethods: ["60개월 렌탈"],
            modelName: item.goods_info_model || "정보없음",
            detailHtml: "", 
            showOnMain: true,
            order: 0,
            originalUrl: `https://boram.lifenuri.com/shop/products/${item.goods_code}`
          });
        }
      }
    }

    console.log(`Total unique products to sync for "${groupDoc.name}": ${products.length}`);

    if (products.length > 0) {
      console.log("  Clearing existing products...");
      await client.mutation(api.products.clearGroupProducts, { groupId: groupDoc._id });

      const chunkSize = 15;
      for (let i = 0; i < products.length; i += chunkSize) {
        const chunk = products.slice(i, i + chunkSize);
        console.log(`  Pushing chunk ${Math.floor(i / chunkSize) + 1}...`);
        
        const chunkWithOrder = chunk.map((p, idx) => ({ ...p, order: i + idx }));
        await client.mutation(api.products.addProducts, {
          groupId: groupDoc._id,
          products: chunkWithOrder
        });
      }
      console.log(`  Sync complete for "${groupDoc.name}"!`);
    } else {
      console.warn(`  No products found for "${groupDoc.name}". Skipping sync.`);
    }
  }
  
  console.log(`\nAll B299 groups successfully synced!`);
}

main().catch(console.error);
