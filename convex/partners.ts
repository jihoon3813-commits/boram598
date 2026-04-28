import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const status = args.status;
    if (status) {
      return await ctx.db
        .query("partners")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("partners").order("desc").collect();
  },
});

export const getByLoginId = query({
  args: { loginId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("partners")
      .withIndex("by_loginId", (q) => q.eq("loginId", args.loginId))
      .first();
  },
});

export const apply = mutation({
  args: {
    loginId: v.string(),
    password: v.string(),
    name: v.string(),
    bizNum: v.optional(v.string()),
    ceoName: v.optional(v.string()),
    address: v.optional(v.string()),
    detailAddress: v.optional(v.string()),
    managerName: v.string(),
    managerPhone: v.string(),
    parentPartnerId: v.optional(v.id("partners")),
    subdomain: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("partners")
      .withIndex("by_loginId", (q) => q.eq("loginId", args.loginId))
      .first();
    if (existing) throw new Error("이미 존재하는 아이디입니다.");
    
    return await ctx.db.insert("partners", {
      ...args,
      status: "pending",
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("partners"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const update = mutation({
  args: {
    id: v.id("partners"),
    loginId: v.optional(v.string()),
    password: v.optional(v.string()),
    name: v.optional(v.string()),
    bizNum: v.optional(v.string()),
    ceoName: v.optional(v.string()),
    address: v.optional(v.string()),
    detailAddress: v.optional(v.string()),
    managerName: v.optional(v.string()),
    managerPhone: v.optional(v.string()),
    status: v.optional(v.string()),
    parentPartnerId: v.optional(v.id("partners")),
    subdomain: v.optional(v.string()),
    visibleProductGroupIds: v.optional(v.array(v.id("productGroups"))),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const create = mutation({
  args: {
    loginId: v.string(),
    password: v.string(),
    name: v.string(),
    bizNum: v.optional(v.string()),
    ceoName: v.optional(v.string()),
    address: v.optional(v.string()),
    detailAddress: v.optional(v.string()),
    managerName: v.string(),
    managerPhone: v.string(),
    status: v.string(),
    parentPartnerId: v.optional(v.id("partners")),
    subdomain: v.string(),
    visibleProductGroupIds: v.optional(v.array(v.id("productGroups"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("partners")
      .withIndex("by_loginId", (q) => q.eq("loginId", args.loginId))
      .first();
    if (existing) throw new Error("이미 존재하는 아이디입니다.");
    
    return await ctx.db.insert("partners", args);
  },
});
