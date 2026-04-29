import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  customers: defineTable({
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
    accounts: v.optional(v.string()), // 구좌
    preferredTime: v.optional(v.string()),
    status: v.string(),
    note: v.optional(v.string()), // 비고
    regDate: v.string(), // 신규등록일
    productPayDate: v.optional(v.string()), // 제품결제일
    firstPayDate: v.optional(v.string()), // 초회납입일
    payMethod: v.optional(v.string()), // 납입방법 (카드/계좌이체)
    cancelDate: v.optional(v.string()), // 해약처리
    withdrawDate: v.optional(v.string()), // 청약철회
    paymentType: v.optional(v.string()), // 결제방식 (60개월 렌탈 / 신한 48페이)
    updatedAt: v.optional(v.string()), // 최근 수정일
    statusHistory: v.array(v.object({
      status: v.string(),
      memo: v.optional(v.string()),
      updatedAt: v.string(),
      updatedBy: v.string(),
    })),
  })
    .index("by_status", ["status"])
    .index("by_partnerId", ["partnerId"])
    .index("by_updatedAt", ["updatedAt"]),

  partners: defineTable({
    loginId: v.string(),
    password: v.string(),
    name: v.string(),
    bizNum: v.optional(v.string()),
    ceoName: v.optional(v.string()),
    address: v.optional(v.string()),
    detailAddress: v.optional(v.string()),
    managerName: v.string(),
    managerPhone: v.string(),
    status: v.string(), // "pending", "active", "suspended"
    parentPartnerId: v.optional(v.id("partners")),
    subdomain: v.string(),
    visibleProductGroupIds: v.optional(v.array(v.id("productGroups"))),
  }).index("by_loginId", ["loginId"]).index("by_status", ["status"]),

  settings: defineTable({
    key: v.string(), // e.g., "global_settings"
    statuses: v.array(v.object({
      name: v.string(),
      isActive: v.boolean(),
      allowPartnerEdit: v.boolean(),
    })),
    adminPassword: v.string(),
    privacyPolicy: v.optional(v.string()),
  }).index("by_key", ["key"]),

  productGroups: defineTable({
    name: v.string(),
    fetchUrl: v.string(),
    showOnMain: v.boolean(),
    displayCount: v.number(),
    order: v.number(),
    fetchDetail: v.optional(v.boolean()),
  }).index("by_order", ["order"]).index("by_name", ["name"]),

  products: defineTable({
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
  }).index("by_groupId", ["groupId", "order"]).index("by_order", ["order"]),

  visits: defineTable({
    date: v.string(), // YYYY-MM-DD
    partnerId: v.optional(v.id("partners")),
    partnerName: v.optional(v.string()),
    count: v.number(),
  }).index("by_date", ["date"]).index("by_partnerId", ["partnerId"]),

  visitLogs: defineTable({
    ip: v.string(),
    partnerName: v.string(),
    timestamp: v.number(),
  }).index("by_ip_partner", ["ip", "partnerName"]),
});
