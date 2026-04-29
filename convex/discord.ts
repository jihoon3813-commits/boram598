import { internalAction } from "./_generated/server";
import { v } from "convex/values";

const DISCORD_WEBHOOK_URL = "https://discordapp.com/api/webhooks/1498839630936674447/-4hGYBHC0Xw1t6kapSwkmlzfsYj9myPQ5efBhtZeKg3S90oEyU3UQxG_17MRZZ6-mQc0";

export const sendConsultationNotification = internalAction({
  args: {
    regDate: v.string(),
    partnerName: v.optional(v.string()),
    name: v.string(),
    phone: v.string(),
    productName: v.optional(v.string()),
    paymentType: v.optional(v.string()),
    payMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("Sending Discord notification for customer:", args.name);
    
    const content = `
**🔔 신규 상담신청 알림**
• **일시**: ${args.regDate}
• **파트너**: ${args.partnerName || "N/A"}
• **고객명**: ${args.name}
• **연락처**: ${args.phone}
• **상품**: ${args.productName || "N/A"}
• **결제방식**: ${args.paymentType || args.payMethod || "N/A"}
`.trim();

    try {
      const response = await fetch("https://discord.com/api/webhooks/1498839630936674447/-4hGYBHC0Xw1t6kapSwkmlzfsYj9myPQ5efBhtZeKg3S90oEyU3UQxG_17MRZZ6-mQc0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Discord Webhook failed:", response.status, errorText);
      } else {
        console.log("Discord notification sent successfully");
      }
    } catch (error) {
      console.error("Error sending Discord notification:", error);
    }
  },
});
