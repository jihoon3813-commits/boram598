import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getConsultationStats = query({
  args: {},
  handler: async (ctx) => {
    const customers = await ctx.db.query("customers").collect();
    
    const statsByDate: Record<string, number> = {};
    const statsByPartner: Record<string, number> = {};
    const statsByProduct: Record<string, number> = {};
    
    customers.forEach((c) => {
      // Date stats
      const date = (c.regDate || "").split(' ')[0]; // YYYY-MM-DD
      if (date) {
        statsByDate[date] = (statsByDate[date] || 0) + 1;
      }
      
      // Partner stats
      const pName = c.partnerName || "본사직속";
      statsByPartner[pName] = (statsByPartner[pName] || 0) + 1;

      // Product stats
      const prName = c.productName || "기타/미지정";
      statsByProduct[prName] = (statsByProduct[prName] || 0) + 1;
    });
    
    const visits = await ctx.db.query("visits").collect();
    const statsByVisitDate: Record<string, number> = {};
    const statsByVisitPartner: Record<string, number> = {};
    
    visits.forEach((v) => {
      statsByVisitDate[v.date] = (statsByVisitDate[v.date] || 0) + v.count;
      const pName = v.partnerName || "본사직속";
      statsByVisitPartner[pName] = (statsByVisitPartner[pName] || 0) + v.count;
    });

    const byDate = Object.entries(statsByDate)
      .map(([date, count]) => ({ 
        date, 
        count,
        visitCount: statsByVisitDate[date] || 0 
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);

    const byPartner = Object.entries(statsByPartner)
      .map(([partner, count]) => ({ 
        partner, 
        count,
        visitCount: statsByVisitPartner[partner] || 0
      }))
      .sort((a, b) => b.count - a.count);

    const byProduct = Object.entries(statsByProduct)
      .map(([product, count]) => ({ product, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const totalVisits = visits.reduce((acc, curr) => acc + curr.count, 0);

    return {
      byDate,
      byPartner,
      byProduct,
      total: customers.length,
      totalVisits,
    };
  },
});

export const recordVisit = mutation({
  args: {
    partnerId: v.optional(v.id("partners")),
    partnerName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const nowKST = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
    const date = nowKST.toISOString().split('T')[0];
    
    const existing = await ctx.db
      .query("visits")
      .withIndex("by_date", (q) => q.eq("date", date))
      .filter((q) => q.eq(q.field("partnerId"), args.partnerId))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, { count: existing.count + 1 });
    } else {
      await ctx.db.insert("visits", {
        date,
        partnerId: args.partnerId,
        partnerName: args.partnerName,
        count: 1,
      });
    }
  },
});
