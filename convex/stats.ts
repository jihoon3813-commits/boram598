import { query } from "./_generated/server";

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
    
    const byDate = Object.entries(statsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);

    const byPartner = Object.entries(statsByPartner)
      .map(([partner, count]) => ({ partner, count }))
      .sort((a, b) => b.count - a.count);

    const byProduct = Object.entries(statsByProduct)
      .map(([product, count]) => ({ product, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      byDate,
      byPartner,
      byProduct,
      total: customers.length,
    };
  },
});
