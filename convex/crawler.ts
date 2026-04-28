"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import * as cheerio from "cheerio";
import axios from "axios";

export const fetchProductsFromUrlV3 = action({
  args: {
    groupId: v.id("productGroups"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const group = await ctx.runQuery(api.products.getGroup, { id: args.groupId });
      if (!group) throw new Error("Group not found");

      const url = args.url;
      const urlObj = new URL(url);
      const isLifenuri = url.includes("lifenuri.com");
      const isBoram = url.includes("xn--299ar6vqrd.com") || url.includes("보람상조.com") || url.includes("bilrigo.com");
      const siteBaseUrl = isLifenuri ? "https://boram.lifenuri.com" : urlObj.origin;

      let goods: any[] = [];

      if (isLifenuri) {
        const parts = url.split('/');
        let themesNo = parseInt(parts[parts.length - 1]);
        if (url.includes("themesgroup")) {
          // themesgroup/140 usually maps to themes/139 for the list API
          themesNo = themesNo - 1;
        }
        
        console.log(`Lifenuri Fetch: themesNo=${themesNo}, url=${url}`);
        
        const params = new URLSearchParams();
        params.append('actions', 'goods');
        params.append('themes_no', themesNo.toString());

        let resp;
        try {
          resp = await axios.post(`${siteBaseUrl}/shop/themes/${themesNo}/list`, 
            params.toString(), 
            {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
                "Referer": url,
                "Origin": siteBaseUrl
              },
              timeout: 15000
            }
          );
          console.log(`Lifenuri Resp: status=${resp.status}, keys=${Object.keys(resp.data || {}).join(',')}`);
        } catch (e: any) {
          const errorData = e.response?.data ? JSON.stringify(e.response.data).substring(0, 200) : "No response data";
          throw new Error(`Lifenuri API Error: ${e.message} | Data: ${errorData}`);
        }
        
        goods = (resp.data.themeslistrow || []).map((item: any) => ({
          g_no: item.goods_code,
          name: item.goods_title,
          thumbnail: item.goods_image_main2,
          model: item.goods_info_model,
          url: `${siteBaseUrl}/shop/products/${item.goods_code}`,
          detailSelector: "#goods_box_detail"
        }));
      } else if (isBoram) {
        const ca_id = urlObj.searchParams.get("ca_id") || "035";
        const seller = urlObj.searchParams.get("filter_seller[]") || urlObj.searchParams.get("filter_seller%5B%5D") || "AP-100054";
        const account = urlObj.searchParams.get("filter_account[]") || urlObj.searchParams.get("filter_account%5B%5D") || "1";
        
        const apiUrl = `${siteBaseUrl}/api/v2/models`;
        let resp;
        try {
          resp = await axios.get(apiUrl, {
            params: {
              ca_id,
              "filter_seller[]": seller,
              "filter_account[]": account,
              section: "models"
            },
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "application/json, text/plain, */*",
              "X-Requested-With": "XMLHttpRequest",
              "Referer": url,
              "Origin": siteBaseUrl
            },
            timeout: 15000
          });
        } catch (e: any) {
          const errorData = e.response?.data ? JSON.stringify(e.response.data).substring(0, 200) : "No response data";
          throw new Error(`API Fetch Error: ${e.message} | URL: ${apiUrl} | Data: ${errorData}`);
        }
        
        const models = resp.data.Lists || [];
        if (models.length === 0) {
          if (resp.data.error) throw new Error(`API returned error: ${resp.data.error}`);
          throw new Error(`API returned 0 products. Check if ca_id(${ca_id}) or seller(${seller}) is correct. (URL: ${url})`);
        }
        goods = models.map((item: any) => ({
          g_no: item.goods_idx,
          name: item.model_name,
          thumbnail: item.thumbnails && item.thumbnails[0],
          model: item.model,
          url: `${siteBaseUrl}${item.model_url}`,
          detailSelector: "#view_detail",
          is48Pay: item.pay_48 === "Y"
        }));
      }

      const products: any[] = [];
      const chunkSize = 5; 
      
      for (let i = 0; i < goods.length; i += chunkSize) {
        const chunk = goods.slice(i, i + chunkSize);
        const chunkResults = await Promise.all(chunk.map(async (item: any, indexInChunk: number) => {
          const index = i + indexInChunk;
          let productUrl = item.url;
          let thumbnail = item.thumbnail || "";
          if (thumbnail && !thumbnail.startsWith("http")) thumbnail = `${siteBaseUrl}${thumbnail}`;

          let detailHtml = "";
          if (group.fetchDetail !== false) {
            try {
              const detailUrl = isLifenuri 
                ? `${siteBaseUrl}/shop/products/goods_box_detail.php?index_no=${item.g_no}`
                : productUrl;
                
              const detResp = await axios.get(detailUrl, {
                headers: { 
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                  "Referer": productUrl
                },
                timeout: 10000 
              });
              const $d = cheerio.load(detResp.data);
              const selector = isLifenuri ? "#goods_box_detail" : "#prdDetail, #view_detail, .view_detail, .product-detail";
              let detailContainer = $d(selector).first();
              
              if (detailContainer.length === 0) {
                detailContainer = $d("body").first();
              }

              detailContainer.find('script, a[href*="contract"], button:contains("계약"), a:contains("계약"), iframe, header, footer, #page_header, #page_category, .leftmenu').remove();
              detailHtml = detailContainer.html() || "";
              detailHtml = detailHtml.replace(/src="\/([^"]+)"/g, `src="${siteBaseUrl}/$1"`);
              detailHtml = detailHtml.replace(/src="\.\.\/([^"]+)"/g, `src="${siteBaseUrl}/$1"`);
              
              if (isLifenuri) detailHtml = `<div class="lifenuri-detail">${detailHtml}</div>`;
            } catch (e: any) {
              console.error(`Failed detail fetch for ${item.name}: ${e.message}`);
            }
          }

          const paymentMethods = ["60개월 렌탈"];
          if (item.is48Pay) paymentMethods.push("신한 48페이");

          return {
            name: item.name,
            thumbnail,
            originalUrl: productUrl,
            paymentMethods,
            modelName: item.model || "정보없음",
            detailHtml,
            showOnMain: true,
            order: index,
          };
        }));
        products.push(...chunkResults);
      }

      if (products.length > 0) {
        const existing: any[] = await ctx.runQuery(api.products.listProducts, { groupId: args.groupId });
        for (const p of existing) {
          await ctx.runMutation(api.products.deleteProduct, { id: p._id });
        }
        for (const p of products) {
          await ctx.runMutation(api.products.addProduct, {
            groupId: args.groupId,
            ...p,
          });
        }
      }

      return { count: products.length };
    } catch (err: any) {
      console.error("Crawler Critical Error:", err.message);
      throw new Error(err.message || "알 수 없는 오류가 발생했습니다.");
    }
  },
});
