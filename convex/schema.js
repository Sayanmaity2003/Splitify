import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  //Users
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
    imageUrl: v.optional(v.string()),
  })
    //   .index() is used to create indexes on specific fields.
    // These indexes make queries faster and more efficient when filtering or sorting by those fields.
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .searchIndex("search_name", { searchField: "name" })
    .searchIndex("search_email", { searchField: "email" }),

  //Expenses
  expenses: defineTable({
    description: v.string(),
    amount: v.number(),
    category: v.optional(v.string()), // undefined for one-on-one expenses
    date: v.number(), // timestamp
    paidByUserId: v.id("users"), // Reference to users table
    splitType: v.string(), // "equal", "percentage", "exact"
    splits: v.array(
      v.object({
        userId: v.id("users"), // Reference to users table
        amount: v.number(), // amount owed by this user
        paid: v.boolean(), // amount paid to the user
      })
    ),
    groupId: v.optional(v.id("groups")), // undefined for one-on-one expenses
    createdBy: v.id("users"), // Reference to users table
  })
    .index("by_group", ["groupId"]) //expenses belong to a particular groupId
    .index("by_user_and_group", ["paidByUserId", "groupId"]) //if groupid is undefined it will fetch all one-on-one expenses or all group-expense if it is not undefined
    .index("by_date", ["date"]), //expenses on some particular date

  //Groups
  groups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"), // Reference to users table
    members: v.array(
      v.object({
        userId: v.id("users"), // Reference to users table
        role: v.string(), // "admin" or "member"
        joinedAt: v.number(), //joining date to the group
      })
    ),
  }),

  //Settlements
  settlements: defineTable({
    amount: v.number(),
    note: v.optional(v.string()),
    date: v.number(), // timestamp
    paidByUserId: v.id("users"), // Reference to users table
    receivedByUserId: v.id("users"), // Reference to users table
    groupId: v.optional(v.id("groups")), // null for one-on-one settlements
    relatedExpenseIds: v.optional(v.array(v.id("expenses"))), // Which expenses this settlement covers
    createdBy: v.id("users"), // Reference to users table
  })
    .index("by_group", ["groupId"])
    .index("by_user_and_group", ["paidByUserId", "groupId"])//paid by user on one-on-one or group
    .index("by_receiver_and_group", ["receivedByUserId", "groupId"])//recieved by user on one-on-one or group
    .index("by_date", ["date"]),
});
