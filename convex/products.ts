import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Product Groups
export const listGroups = query({
  args: {},
  handler: async (ctx) => {
    const groups = await ctx.db.query("productGroups").withIndex("by_order").collect();
    const result = [];
    for (const group of groups) {
      const products = await ctx.db
        .query("products")
        .withIndex("by_groupId", (q) => q.eq("groupId", group._id))
        .collect();
      result.push({ ...group, productCount: products.length });
    }
    return result;
  },
});

// Landing page: groups + their products
export const listMainProducts = query({
  args: { partnerId: v.optional(v.id("partners")) },
  handler: async (ctx, args) => {
    const groups = await ctx.db
      .query("productGroups")
      .withIndex("by_order")
      .collect();

    let mainGroups = [];
    let isPartnerSpecific = false;

    if (args.partnerId) {
      const partner = await ctx.db.get(args.partnerId);
      const visibleIds = partner?.visibleProductGroupIds || [];

      if (visibleIds.length > 0) {
        // 1. If specific categories are selected for this partner, show ONLY those
        // We use .some with string comparison to be extra safe with ID objects
        mainGroups = groups.filter((g) => visibleIds.some(id => id === g._id));
        isPartnerSpecific = true;
      } else {
        // 2. Default: show globally active groups
        mainGroups = groups.filter((g) => g.showOnMain);
      }
    } else {
      // HQ main page: only globally active
      mainGroups = groups.filter((g) => g.showOnMain);
    }

    const result = [];
    const pay48Products = [];

    for (const group of mainGroups) {
      const products = await ctx.db
        .query("products")
        .withIndex("by_groupId", (q) => q.eq("groupId", group._id))
        .collect();

      // Sort by order field
      products.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      // If it's a partner-specific category, show ALL products.
      // Otherwise, only show products with showOnMain: true.
      const visible = isPartnerSpecific
        ? products
        : products.filter((p) => p.showOnMain);

      if (visible.length > 0) {
        result.push({ group, products: visible });
        
        // Collect products that exclusively support "신한" related payment methods
        const matching = visible.filter(p => 
          p.paymentMethods?.some(m => m.includes("신한 48페이") || m.includes("48PAY")) &&
          p.paymentMethods?.every(m => m.includes("신한") || m.includes("48PAY"))
        );
        pay48Products.push(...matching);
      }
    }

    // Add a virtual "48Pay" category at the top if there are such products
    if (pay48Products.length > 0) {
      // Remove duplicates and sort
      const unique48Pay = Array.from(new Map(pay48Products.map(p => [p._id, p])).values());
      
      result.unshift({
        group: {
          _id: "virtual_48pay" as any,
          name: "신한 48페이 전용관",
          showOnMain: true,
          order: -1,
          fetchUrl: "",
          displayCount: 8,
          isVirtual: true,
        },
        products: unique48Pay
      });
    }

    return result;
  },
});

export const addGroup = mutation({
  args: {
    name: v.string(),
    fetchUrl: v.string(),
    showOnMain: v.boolean(),
    displayCount: v.number(),
    order: v.number(),
    fetchDetail: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("productGroups", args);
  },
});

export const updateGroup = mutation({
  args: {
    id: v.id("productGroups"),
    name: v.optional(v.string()),
    fetchUrl: v.optional(v.string()),
    showOnMain: v.optional(v.boolean()),
    displayCount: v.optional(v.number()),
    order: v.optional(v.number()),
    fetchDetail: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const deleteGroup = mutation({
  args: { id: v.id("productGroups") },
  handler: async (ctx, args) => {
    // Delete all products in this group first
    const products = await ctx.db
      .query("products")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.id))
      .collect();
    for (const p of products) {
      await ctx.db.delete(p._id);
    }
    await ctx.db.delete(args.id);
  },
});

// Products
export const listProducts = query({
  args: { groupId: v.optional(v.id("productGroups")) },
  handler: async (ctx, args) => {
    const { groupId } = args;
    if (groupId) {
      const products = await ctx.db
        .query("products")
        .withIndex("by_groupId", (q) => q.eq("groupId", groupId))
        .collect();
      return products.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return await ctx.db.query("products").withIndex("by_order").collect();
  },
});

export const addProduct = mutation({
  args: {
    groupId: v.id("productGroups"),
    name: v.string(),
    thumbnail: v.string(),
    paymentMethods: v.array(v.string()),
    modelName: v.string(),
    detailHtml: v.string(),
    showOnMain: v.boolean(),
    order: v.number(),
    originalUrl: v.string(),
    brand: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", args);
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    paymentMethods: v.optional(v.array(v.string())),
    modelName: v.optional(v.string()),
    detailHtml: v.optional(v.string()),
    showOnMain: v.optional(v.boolean()),
    order: v.optional(v.number()),
    groupId: v.optional(v.id("productGroups")),
    originalUrl: v.optional(v.string()),
    brand: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Reordering logic
export const reorderProducts = mutation({
  args: {
    orders: v.array(v.object({ id: v.id("products"), order: v.number() })),
  },
  handler: async (ctx, args) => {
    console.log(`Reordering ${args.orders.length} products...`);
    for (const item of args.orders) {
      await ctx.db.patch(item.id, { order: item.order });
    }
  },
});
export const getGroup = query({
  args: { id: v.id("productGroups") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const syncProducts = mutation({
  args: {
    groupId: v.id("productGroups"),
    products: v.array(v.object({
      name: v.string(),
      thumbnail: v.string(),
      paymentMethods: v.array(v.string()),
      modelName: v.string(),
      detailHtml: v.string(),
      showOnMain: v.boolean(),
      order: v.number(),
      originalUrl: v.string(),
      brand: v.optional(v.string()),
      category: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const { groupId, products } = args;
    
    // Clear existing
    const existing = await ctx.db
      .query("products")
      .withIndex("by_groupId", (q) => q.eq("groupId", groupId))
      .collect();
    for (const p of existing) {
      await ctx.db.delete(p._id);
    }
    
    // Add new
    for (const p of products) {
      await ctx.db.insert("products", { ...p, groupId });
    }
  },
});

export const addProducts = mutation({
  args: {
    groupId: v.id("productGroups"),
    products: v.array(v.object({
      name: v.string(),
      thumbnail: v.string(),
      paymentMethods: v.array(v.string()),
      modelName: v.string(),
      detailHtml: v.string(),
      showOnMain: v.boolean(),
      order: v.number(),
      originalUrl: v.string(),
      brand: v.optional(v.string()),
      category: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const { groupId, products } = args;
    for (const p of products) {
      await ctx.db.insert("products", { ...p, groupId });
    }
  },
});

export const autoCategorizeAll = mutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    
    const brandKeywords = [
      "삼성", "LG", "쿠쿠", "쿠첸", "위니아", "캐리어", "다이슨", "테팔", 
      "필립스", "드롱기", "네스프레소", "샤오미", "일렉트로룩스", "에이서", "HP", "레노버",
      "발뮤다", "코웨이", "청호나이스", "SK매직", "경동나비엔"
    ];

    const categoryMap: { [key: string]: string[] } = {
      "TV": ["TV", "티비", "텔레비전"],
      "세탁기/건조기": ["세탁기", "건조기", "워시타워"],
      "냉장고/김치냉장고": ["냉장고", "김치냉장고", "비스포크 냉장고", "오브제 냉장고"],
      "에어컨": ["에어컨", "시스템에어컨", "벽걸이 에어컨", "스탠드 에어컨"],
      "공기청정기": ["공기청정기", "에어퓨리파이어"],
      "청소기": ["청소기", "로봇청소기", "무선청소기"],
      "조리기기": ["레인지", "오븐", "인덕션", "전기레인지", "에어프라이어", "밥솥", "전기밥솥"],
      "생활가전": ["스타일러", "에어드레서", "식기세척기", "정수기", "비데", "가습기", "제습기"],
      "계절가전": ["온수매트", "전기매트", "선풍기", "히터"],
      "주방가전": ["믹서기", "커피머신", "토스터", "전기포트"],
      "컴퓨터/노트북": ["컴퓨터", "노트북", "PC", "태블릿", "아이패드", "갤럭시탭"]
    };

    let count = 0;
    for (const product of products) {
      let brand = product.brand;
      let category = product.category;

      if (!brand) {
        for (const bk of brandKeywords) {
          if (product.name.includes(bk)) {
            brand = bk;
            break;
          }
        }
      }

      if (!category) {
        for (const [cat, keywords] of Object.entries(categoryMap)) {
          if (keywords.some(k => product.name.includes(k))) {
            category = cat;
            break;
          }
        }
      }

      if (brand !== product.brand || category !== product.category) {
        await ctx.db.patch(product._id, { brand, category });
        count++;
      }
    }
    return count;
  },
});
