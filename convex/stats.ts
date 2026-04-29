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

    const dailyPartnerStats: Record<string, Record<string, { visits: number; applications: number }>> = {};

    customers.forEach((c) => {
      const date = (c.regDate || "").split(' ')[0];
      if (date) {
        const pName = c.partnerName || "본사직속";
        if (!dailyPartnerStats[date]) dailyPartnerStats[date] = {};
        if (!dailyPartnerStats[date][pName]) dailyPartnerStats[date][pName] = { visits: 0, applications: 0 };
        dailyPartnerStats[date][pName].applications++;
      }
    });

    visits.forEach((v) => {
      const pName = v.partnerName || "본사직속";
      if (!dailyPartnerStats[v.date]) dailyPartnerStats[v.date] = {};
      if (!dailyPartnerStats[v.date][pName]) dailyPartnerStats[v.date][pName] = { visits: 0, applications: 0 };
      dailyPartnerStats[v.date][pName].visits += v.count;
    });

    const byDatePartner: any[] = [];
    Object.entries(dailyPartnerStats).forEach(([date, partners]) => {
      Object.entries(partners).forEach(([partner, data]) => {
        byDatePartner.push({ date, partner, ...data });
      });
    });

    return {
      byDate,
      byPartner,
      byProduct,
      byDatePartner: byDatePartner.sort((a, b) => b.date.localeCompare(a.date) || b.applications - a.applications),
      total: customers.length,
      totalVisits,
    };
  },
});

export const recordVisit = mutation({
  args: {
    partnerId: v.optional(v.id("partners")),
    partnerName: v.optional(v.string()),
    ip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().getTime();
    const nowKST = new Date(now + 9 * 60 * 60 * 1000);
    const date = nowKST.toISOString().split('T')[0];
    const pName = args.partnerName || "본사직속";
    
    // IP-based unique check (12 hours)
    if (args.ip) {
      const lastVisit = await ctx.db
        .query("visitLogs")
        .withIndex("by_ip_partner", (q) => q.eq("ip", args.ip!).eq("partnerName", pName))
        .order("desc")
        .first();
      
      const TWELVE_HOURS = 12 * 60 * 60 * 1000;
      if (lastVisit && (now - lastVisit.timestamp) < TWELVE_HOURS) {
        return; // Skip counting if within 12 hours
      }
      
      // Log the visit
      await ctx.db.insert("visitLogs", {
        ip: args.ip,
        partnerName: pName,
        timestamp: now,
      });
    }
    
    const existing = await ctx.db
      .query("visits")
      .withIndex("by_date", (q) => q.eq("date", date))
      .filter((q) => q.eq(q.field("partnerName"), pName))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, { count: existing.count + 1 });
    } else {
      await ctx.db.insert("visits", {
        date,
        partnerId: args.partnerId,
        partnerName: pName,
        count: 1,
      });
    }
  },
});
