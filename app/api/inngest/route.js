// This is the route(.../api/inngest) for inngest function
import { inngest } from "@/lib/inngest/client"; //This is inngest client
import { paymentReminders } from "@/lib/inngest/payment-reminders.js";
import { spendingInsights } from "@/lib/inngest/spending-insights";
 //This is function
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    paymentReminders,
    spendingInsights
  ],
});