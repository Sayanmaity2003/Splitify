"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
// import { Resend } from "resend";
import nodemailer from "nodemailer";

export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    text: v.optional(v.string()),
    // apiKey: v.string(), // keep if you plan to use Resend later
    user: v.string(),
    pass: v.string(),
  },
  handler: async (ctx, args) => {
    // const resend = new Resend(args.apiKey);
    // Setup NodeMailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: args.user,
        pass: args.pass,
      },
    });

    try {
      // You can switch back to Resend by uncommenting this block:
      /*
      const result = await resend.emails.send({
        from: "Splitify <onboarding@resend.dev>",
        to: args.to,
        subject: args.subject,
        html: args.html,
        text: args.text,
      });
      */

      const mailOptions = {
        // from: {
        //   name: "Splitify",
        //   address: process.env.USER,
        // },
        from:`Splitify <${args.user}>`,
        to: args.to,
        subject: args.subject,
        html: args.html,
        text: args.text,
      };

      // Await sendMail to ensure proper execution
      const sendMail = async (transporter, mailOptions) => {
        try {
          await transporter.sendMail(mailOptions);
          console.log("Email has been sent");
        } catch (e) {
          console.log(e);
          throw e;
        }
      };

      await sendMail(transporter, mailOptions); // ✅ fixed: added await

      return { success: true }; // ✅ added return
    } catch (error) {
      console.error("Failed to send email:", error);
      return { success: false, error: error.message };
    }
  },
});
