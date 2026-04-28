import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const results = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "global_settings"))
      .take(1);
    return results[0] ?? null;
  },
});

export const update = mutation({
  args: {
    statuses: v.optional(v.array(v.object({
      name: v.string(),
      isActive: v.boolean(),
      allowPartnerEdit: v.boolean(),
    }))),
    adminPassword: v.optional(v.string()),
    privacyPolicy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "global_settings"))
      .take(1);
    const existing = results[0] ?? null;

    // Build patch data — only include fields that were actually provided
    const patchData: Record<string, any> = {};
    if (args.statuses !== undefined) {
      patchData.statuses = args.statuses;
    }
    if (args.adminPassword !== undefined) {
      patchData.adminPassword = args.adminPassword;
    }
    if (args.privacyPolicy !== undefined) {
      patchData.privacyPolicy = args.privacyPolicy;
    }

    if (existing) {
      await ctx.db.patch(existing._id, patchData);
    } else {
      await ctx.db.insert("settings", {
        key: "global_settings",
        statuses: args.statuses ?? [],
        adminPassword: args.adminPassword ?? "admin1234",
        privacyPolicy: args.privacyPolicy ?? "",
      });
    }
  },
});
