import axios from 'axios';
import * as cheerio from 'cheerio';
import { ConvexClient } from "convex/browser";
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });

// Usage: node scripts/sync_products.mjs [group_name_filter]
const CONVEX_URL = process.env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("VITE_CONVEX_URL is not set in .env");
  process.exit(1);
}

const client = new ConvexClient(CONVEX_URL);
const filter = process.argv[2]; // Optional filter

async function sync() {
  console.log(filter ? `Starting sync for groups matching: "${filter}"...` : "Starting full product synchronization...");

  let groupsFromDb = [];
  try {
    groupsFromDb = await client.query("products:listGroups");
  } catch (err) {
    console.error("Failed to fetch groups from database:", err.message);
    process.exit(1);
  }

  for (const groupDef of groupsFromDb) {
    if (!groupDef.fetchUrl) continue;
    
    // Apply filter if provided
    if (filter && !groupDef.name.includes(filter)) {
      continue;
    }
    
    const url = groupDef.fetchUrl;
    const isLifenuri = url.includes("lifenuri.com");
    const isBoram = url.includes("xn--299ar6vqrd.com") || url.includes("보람상조.com") || url.includes("bilrigo.com");

    console.log(`\nProcessing group: ${groupDef.name}`);
    
    try {
      let goods = [];
      const siteBaseUrl = isLifenuri ? "https://boram.lifenuri.com" : (isBoram ? "https://xn--299ar6vqrd.com" : "");

      if (isLifenuri) {
        const themesNo = parseInt(url.split('/').pop()) - 1;
        const resp = await axios.post(`${siteBaseUrl}/shop/themes/${themesNo}/list`, 
          `actions=goods&themes_no=${themesNo}`, 
          {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
              "X-Requested-With": "XMLHttpRequest",
              "Referer": url
            }
          }
        );
        goods = (resp.data.themeslistrow || []).map(item => ({
          g_no: item.goods_code,
          name: item.goods_title,
          thumbnail: item.goods_image_main2,
          model: item.goods_info_model,
          url: `${siteBaseUrl}/shop/products/${item.goods_code}`,
          detailSelector: "#goods_box_detail"
        }));
      } else if (isBoram) {
        // Bilrigo API for Boram 598
        const urlObj = new URL(url);
        const ca_id = urlObj.searchParams.get("ca_id") || "035";
        const seller = urlObj.searchParams.get("filter_seller[]") || urlObj.searchParams.get("filter_seller%5B%5D") || "AP-100054";
        const account = urlObj.searchParams.get("filter_account[]") || urlObj.searchParams.get("filter_account%5B%5D") || "1";
        
        const apiUrl = `${siteBaseUrl}/api/v2/models?ca_id=${ca_id}&filter_seller%5B%5D=${seller}&filter_account%5B%5D=${account}&section=models`;
        console.log(`  API URL: ${apiUrl}`);
        
        const resp = await axios.get(apiUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": url
          }
        });
        
        const models = resp.data.Lists || [];
        console.log(`  Found ${models.length} items in API.`);
        
        goods = models.map(item => ({
          g_no: item.goods_idx,
          name: item.model_name,
          thumbnail: item.thumbnails && item.thumbnails[0],
          model: item.model,
          url: `${siteBaseUrl}${item.model_url}`,
          detailSelector: "#view_detail",
          is48Pay: item.pay_48 === "Y"
        }));
      }

      const products = [];
      for (const item of goods) {
        let productUrl = item.url;
        let thumbnail = item.thumbnail || "";
        if (thumbnail && !thumbnail.startsWith("http")) thumbnail = `${siteBaseUrl}${thumbnail}`;

        console.log(`  - Fetching detail for: ${item.name} (Model: ${item.model || 'N/A'})`);
        
        let detailHtml = "";
        if (groupDef.fetchDetail !== false) {
          try {
            const detailUrl = isLifenuri 
              ? `${siteBaseUrl}/shop/products/goods_box_detail.php?index_no=${item.g_no}`
              : productUrl;
              
            const detResp = await axios.get(detailUrl, {
              headers: { 
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": productUrl
              },
              timeout: 10000
            });
            const $d = cheerio.load(detResp.data);
            
            const selector = isLifenuri ? "#goods_box_detail" : item.detailSelector;
            let detailContainer = $d(selector);
            
            if (isLifenuri && detailContainer.length === 0) {
              detailContainer = $d(".goods_box_detail, .product_info_detail, body").first();
            }

            detailContainer.find('script, a[href*="contract"], button:contains("계약"), a:contains("계약"), iframe, header, footer, #page_header, #page_category, .leftmenu').remove();
            detailContainer.find('div:contains("로그인"), div:contains("회원가입")').remove();

            detailHtml = detailContainer.html() || "";
            detailHtml = detailHtml.replace(/src="\/([^"]+)"/g, `src="${siteBaseUrl}/$1"`);
            detailHtml = detailHtml.replace(/src="\.\.\/([^"]+)"/g, `src="${siteBaseUrl}/$1"`);
            
            if (isLifenuri) {
              detailHtml = `<div class="lifenuri-detail">${detailHtml}</div>`;
            }
          } catch (e) {
            console.error(`    Failed to fetch detail for ${item.name}: ${e.message}`);
          }
        }

        const paymentMethods = ["60개월 렌탈"];
        if (item.is48Pay) paymentMethods.push("신한 48페이");

        products.push({
          name: item.name,
          modelName: item.model || "정보없음",
          thumbnail,
          originalUrl: productUrl,
          paymentMethods,
          detailHtml,
          showOnMain: true,
          order: products.length
        });
      }

      if (products.length > 0) {
        await client.mutation("seed:seedScrapedData", {
          groups: [{
            name: groupDef.name,
            products: products
          }]
        });
        console.log(`  Successfully synced ${products.length} products.`);
      }
    } catch (err) {
      console.error(`  Error processing group ${groupDef.name}:`, err.message);
    }
  }

  console.log("\nSynchronization complete!");
  process.exit(0);
}

sync();

