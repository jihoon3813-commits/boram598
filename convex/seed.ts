import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { api } from "./_generated/api";

export const seedScrapedData = mutation({
  args: {
    groups: v.array(v.object({
      name: v.string(),
      products: v.array(v.object({
        name: v.string(),
        modelName: v.string(),
        originalUrl: v.string(),
        thumbnail: v.string(),
        detailHtml: v.string(),
        paymentMethods: v.optional(v.array(v.string())),
      }))
    }))
  },
  handler: async (ctx, args) => {
    for (const groupData of args.groups) {
      // Find or create group
      let group = await ctx.db
        .query("productGroups")
        .withIndex("by_name", (q) => q.eq("name", groupData.name))
        .first();
      
      if (!group) {
        const groupId = await ctx.db.insert("productGroups", {
          name: groupData.name,
          fetchUrl: "", // Not used for seeded data
          showOnMain: true,
          displayCount: groupData.products.length >= 8 ? 8 : 4,
          order: 0,
          fetchDetail: true,
        });
        group = await ctx.db.get(groupId);
      }

      if (!group) continue;

      // Delete old products in this group
      const existing = await ctx.db
        .query("products")
        .withIndex("by_groupId", (q) => q.eq("groupId", group!._id))
        .collect();
      for (const p of existing) {
        await ctx.db.delete(p._id);
      }

      // Insert new products
      for (let i = 0; i < groupData.products.length; i++) {
        const p = groupData.products[i];
        await ctx.db.insert("products", {
          groupId: group._id,
          name: p.name,
          modelName: p.modelName,
          thumbnail: p.thumbnail,
          originalUrl: p.originalUrl,
          paymentMethods: p.paymentMethods || ["60개월 렌탈"],
          detailHtml: p.detailHtml,
          showOnMain: true,
          order: i,
        });
      }
    }
  },
});

export const seedPartners = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("partners").collect();
    if (existing.length > 0) return;

    await ctx.db.insert("partners", {
      loginId: "partner1",
      password: "password123",
      name: "샘플 파트너 1",
      managerName: "홍길동",
      managerPhone: "010-1234-5678",
      status: "active",
      subdomain: "partner1",
    });

    await ctx.db.insert("partners", {
      loginId: "partner2",
      password: "password123",
      name: "샘플 파트너 2",
      managerName: "이순신",
      managerPhone: "010-9876-5432",
      status: "active",
      subdomain: "partner2",
    });
  },
});

export const seedCustomers = mutation({
  args: {},
  handler: async (ctx) => {
    const names = ["김철수", "이영희", "박지민", "최현우", "정다은", "강민호", "윤서연", "임재현", "한소희", "오지훈"];
    const phones = ["010-1111-2222", "010-2222-3333", "010-3333-4444", "010-4444-5555", "010-5555-6666", "010-6666-7777", "010-7777-8888", "010-8888-9999", "010-9999-0000", "010-1234-1234"];
    const statuses = ["상담대기", "부재/통화중", "상담중", "계약완료", "취소/거부"];
    
    // Clear old samples
    const oldSamples = await ctx.db.query("customers").collect();
    for (const c of oldSamples) {
      if (c.statusHistory?.[0]?.memo === "샘플 데이터 생성") {
        await ctx.db.delete(c._id);
      }
    }

    // Get real partners and products
    const partners = await ctx.db.query("partners").collect();
    const products = await ctx.db.query("products").collect();
    const productGroups = await ctx.db.query("productGroups").collect();

    for (let i = 0; i < 10; i++) {
      const status = statuses[i % statuses.length];
      const partner = partners.length > 0 ? partners[i % partners.length] : null;
      const product = products.length > 0 ? products[i % products.length] : null;
      const group = product ? productGroups.find(g => g._id === product.groupId) : null;

      await ctx.db.insert("customers", {
        name: names[i],
        phone: phones[i],
        dob: `198${i}-11-15`,
        gender: i % 2 === 0 ? "남" : "여",
        address: "서울특별시 강남구 테헤란로 123",
        detailAddress: "1층 101호",
        status: status,
        regDate: new Date().toISOString().replace('T', ' ').substring(0, 10),
        statusHistory: [{
          status: status,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          updatedBy: "system",
          memo: "샘플 데이터 생성"
        }],
        partnerId: partner?._id,
        partnerName: partner?.name || "본사직영",
        partnerLoginId: partner?.loginId || "admin",
        categoryId: group?._id,
        categoryName: group?.name || "",
        productId: product?._id,
        productName: product?.name || "",
      });
    }
  },
});
