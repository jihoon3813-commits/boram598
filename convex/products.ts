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
    for (const group of mainGroups) {
      const products = await ctx.db
        .query("products")
        .withIndex("by_groupId", (q) => q.eq("groupId", group._id))
        .collect();

      // Sort by order field
      products.sort((a, b) => a.order - b.order);

      // If it's a partner-specific category, show ALL products.
      // Otherwise, only show products with showOnMain: true.
      const visible = isPartnerSpecific
        ? products
        : products.filter((p) => p.showOnMain);

      if (visible.length > 0) {
        result.push({ group, products: visible });
      }
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
      return products.sort((a, b) => a.order - b.order);
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
