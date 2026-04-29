import axios from "axios";
import fs from "fs";

async function fetchLifenuri(themesNo) {
  const url = `https://boram.lifenuri.com/shop/themes/${themesNo}/list`;
  const params = new URLSearchParams();
  params.append('actions', 'goods');
  params.append('themes_no', themesNo.toString());

  const resp = await axios.post(url, params.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest",
      "Referer": "https://boram.lifenuri.com/shop/themesgroup/140"
    },
    timeout: 10000
  });
  
  if (resp.data.return_code !== 1000) return [];
  
  return (resp.data.themeslistrow || []).map(item => ({
    name: item.goods_title,
    thumbnail: item.goods_image_main2,
    paymentMethods: ["60개월 렌탈"],
    modelName: item.goods_info_model || "정보없음",
    detailHtml: "", 
    showOnMain: true,
    order: 0,
    originalUrl: `https://boram.lifenuri.com/shop/products/${item.goods_code}`
  }));
}

async function main() {
  const themeIds = [139, 136, 137, 138, 152];
  let allProducts = [];
  const seenIds = new Set();

  for (const id of themeIds) {
    const products = await fetchLifenuri(id);
    for (const p of products) {
        if (!seenIds.has(p.originalUrl)) {
            seenIds.add(p.originalUrl);
            allProducts.push(p);
        }
    }
  }

  fs.writeFileSync("all_products.json", JSON.stringify(allProducts));
  console.log(`Saved ${allProducts.length} products to all_products.json`);
}

main();
