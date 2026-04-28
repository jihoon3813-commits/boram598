import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const migratePaymentLabels = mutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    for (const product of products) {
      if (product.paymentMethods.includes("48개월 무이자 할부")) {
        const newMethods = product.paymentMethods.map(m => 
          m === "48개월 무이자 할부" ? "신한 48페이" : m
        );
        await ctx.db.patch(product._id, { paymentMethods: newMethods });
      }
    }
  },
});
