import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("customers").order("desc").collect();
  },
});

const customerArgs = {
  name: v.string(),
  phone: v.string(),
  dob: v.optional(v.string()),
  gender: v.optional(v.string()),
  address: v.optional(v.string()),
  detailAddress: v.optional(v.string()),
  partnerId: v.optional(v.id("partners")),
  partnerName: v.optional(v.string()),
  partnerLoginId: v.optional(v.string()),
  categoryId: v.optional(v.union(v.id("productGroups"), v.string())),
  categoryName: v.optional(v.string()),
  productId: v.optional(v.union(v.id("products"), v.string())),
  productName: v.optional(v.string()),
  accounts: v.optional(v.string()),
  preferredTime: v.optional(v.string()),
  status: v.string(),
  note: v.optional(v.string()),
  regDate: v.optional(v.string()),
  productPayDate: v.optional(v.string()),
  firstPayDate: v.optional(v.string()),
  payMethod: v.optional(v.string()),
  cancelDate: v.optional(v.string()),
  withdrawDate: v.optional(v.string()),
  paymentType: v.optional(v.string()),
};

export const add = mutation({
  args: customerArgs,
  handler: async (ctx, args) => {
    const nowKST = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 16);
    const regDate = args.regDate || nowKST;
    return await ctx.db.insert("customers", {
      ...args,
      regDate,
      updatedAt: nowKST,
      statusHistory: [{
        status: args.status,
        memo: "초기 등록",
        updatedAt: nowKST,
        updatedBy: "system",
      }],
    });
  },
});

export const addBatch = mutation({
  args: { customers: v.array(v.object(customerArgs)) },
  handler: async (ctx, args) => {
    const nowKST = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 16);
    for (const data of args.customers) {
      const regDate = data.regDate || nowKST;
      await ctx.db.insert("customers", {
        ...data,
        regDate,
        updatedAt: nowKST,
        statusHistory: [{
          status: data.status,
          memo: "일괄 등록",
          updatedAt: nowKST,
          updatedBy: "system",
        }],
      });
    }
  },
});

export const updateCustomerRecord = mutation({
  args: {
    id: v.id("customers"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    dob: v.optional(v.string()),
    gender: v.optional(v.string()),
    address: v.optional(v.string()),
    detailAddress: v.optional(v.string()),
    partnerId: v.optional(v.id("partners")),
    partnerName: v.optional(v.string()),
    partnerLoginId: v.optional(v.string()),
    categoryId: v.optional(v.union(v.id("productGroups"), v.string())),
    categoryName: v.optional(v.string()),
    productId: v.optional(v.union(v.id("products"), v.string())),
    productName: v.optional(v.string()),
    accounts: v.optional(v.string()),
    preferredTime: v.optional(v.string()),
    status: v.optional(v.string()),
    note: v.optional(v.string()),
    regDate: v.optional(v.string()),
    productPayDate: v.optional(v.string()),
    firstPayDate: v.optional(v.string()),
    payMethod: v.optional(v.string()),
    cancelDate: v.optional(v.string()),
    withdrawDate: v.optional(v.string()),
    paymentType: v.optional(v.string()),
    memo: v.optional(v.string()),
    updatedBy: v.string(),
  },
  handler: async (ctx, { id, updatedBy, memo, ...args }) => {
    const customer = await ctx.db.get(id);
    if (!customer) throw new Error("Customer not found");
    
    const patchData: any = {};
    Object.entries(args).forEach(([k, v]) => {
      // Exclude memo and updatedBy as they are not fields in the customers table
      if (v !== undefined && k !== "memo" && k !== "updatedBy" && k !== "combinedProduct") {
        patchData[k] = v;
      }
    });
    
    const nowKST = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 16);
    
    // Update status history if status or memo is provided
    if (args.status !== undefined || memo !== undefined) {
      // Only add to history if status actually changed OR if a non-empty memo was provided
      if (args.status !== customer.status || (memo && memo.trim() !== "")) {
        const history = Array.isArray(customer.statusHistory) ? customer.statusHistory : [];
        patchData.statusHistory = [
          ...history,
          {
            status: args.status || customer.status,
            memo: memo || "",
            updatedAt: nowKST,
            updatedBy,
          }
        ];
      }
    }
    
    patchData.updatedAt = nowKST;
    
    if (Object.keys(patchData).length > 0) {
      await ctx.db.patch(id, patchData);
    }
  },
});

export const removeBatch = mutation({
  args: { ids: v.array(v.id("customers")) },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.delete(id);
    }
  },
});
