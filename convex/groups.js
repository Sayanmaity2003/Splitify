import { query } from "./_generated/server";
import { v } from "convex/values";
export const getGroupExpenses = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    // Use centralized getCurrentUser function
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

    const group = await ctx.db.get(groupId);
    if (!group) throw new Error("Group not Found!!");

    if (!group.members.some((m) => m.userId === currentUser._id))
      throw new Error("You are not a member of this group");

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();

    const settlements = await ctx.db
      .query("settlements")
      .filter((q) => q.eq(q.field("groupId"), groupId))
      .collect();

    /* ----------  member map ---------- */
    const memberDetails = await Promise.all(
      group.members.map(async (m) => {
        const u = await ctx.db.get(m.userId);
        return { id: u._id, name: u.name, imageUrl: u.imageUrl, role: m.role };
      })
    );
    const ids = memberDetails.map((m) => m.id);

    /* ----------  ledgers(Balance calculation setup) ---------- */
    /*
    Initialize totals object to track overall balance for each year
    Format: {userId1: balance1, userId2: balance2,...}
    */
    // total net balance (old behaviour)
    const totals = Object.fromEntries(ids.map((id) => [id, 0]));
    // pair‑wise ledger  debtor -> creditor -> amount
    /*
    Create a two-dimensional ledger to track who owes whom
    ledger[A][B] = how much A owes B 
    ledger={
    "user1" : {"user2":0, "user3":0}, -> user1 have to pay 0 to user2 and user3
    "user2" : {"user1":0, "user3":0}, -> user2 have to pay 0 to user1 and user3
    "user3" : {"user1":0, "user2":0}, -> user3 have to pay 0 to user1 and user2
    }
    */
    const ledger = {};
    ids.forEach((a) => {
      ledger[a] = {};
      ids.forEach((b) => {
        if (a !== b) ledger[a][b] = 0;
      });
    });

    /* ----------  apply expenses to balances---------- */
    /*
    Example:
    - Expense 1: user1 paid ₹60, split equally among all 3 users (₹20 each)
    - After applying this expense:
        - totals={"user1":+₹40, "user2":-₹20, "user3":-₹20}
        - ledger={
            "user1" : {"user2":0, "user3":0},
            "user2" : {"user1":20, "user3":0},
            "user3" : {"user1":20, "user2":0},
        } 
        - This means user2 owes user1 ₹20 and user3 owes user1 ₹20
    */
    for (const exp of expenses) {
      const payer = exp.paidByUserId;
      for (const split of exp.splits) {
        //Skip if this is the payer's own split or if already paid
        if (split.userId === payer || split.paid) continue; // skip payer & settled
        const debtor = split.userId;
        const amt = split.amount;

        //Update totals: increase payer's balance, decrease debtor's balance
        totals[payer] += amt; //Payer gain credit
        totals[debtor] -= amt; //Debtor goes into dept

        ledger[debtor][payer] += amt; // debtor owes payer
      }
    }

    /* ----------  apply settlements to balances---------- */
    /*
    Example:
    - Settlement: user2 paid ₹10 to user1
    - After applying this settlement:
        - totals = {"user1":+30, "user2":-10, "user3":-20}
        - ledger = {
            "user1" : {"user2":0, "user3":0},
            "user2" : {"user1": 10, "user3":0},
            "user3" : {"user1": 20, "user2":0},
        }

        - This means user2 now owes user1 only ₹10 and user3 still owes user1 ₹20
    */
    for (const s of settlements) {
      totals[s.paidByUserId] += s.amount;
      totals[s.receivedByUserId] -= s.amount;

      ledger[s.paidByUserId][s.receivedByUserId] -= s.amount; // they paid back
    }

    /* ----------  shape the response ---------- */
    const balances = memberDetails.map((m) => ({
      ...m,
      totalBalance: totals[m.id],
      owes: Object.entries(ledger[m.id])
        .filter(([, v]) => v > 0)
        .map(([to, amount]) => ({ to, amount })),
      owedBy: ids
        .filter((other) => ledger[other][m.id] > 0)
        .map((other) => ({ from: other, amount: ledger[other][m.id] })),
    }));

    const userLookupMap = {};
    memberDetails.forEach((member) => {
      userLookupMap[member.id] = member;
    });

    return {
        //Group information
      group: {
        id: group._id,
        name: group.name,
        description: group.description,
      },
      members: memberDetails, //All group with details
      expenses, //All expenses in this group
      settlements, //All settlements in this group
      balances, //Calculated ba;ance Info for each member
      userLookupMap, //Quick lookup for user details
    };
  },
});
