// Test script to check Resend API connection
// You can run this in Node.js to test your setup

const { Resend } = require("resend");

// Load environment variables manually for testing
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
  console.log("Testing Resend API...");
  console.log("API Key exists:", !!process.env.RESEND_API_KEY);
  console.log("API Key length:", process.env.RESEND_API_KEY?.length);

  try {
    const result = await resend.emails.send({
      from: "Tociano Test <onboarding@resend.dev>",
      to: ["olayinkacodes@gmail.com"],
      subject: "Test Email from Tociano",
      html: "<h1>Test Email</h1><p>If you receive this, Resend is working!</p>",
    });

    console.log("✅ Email sent successfully!");
    console.log("Email ID:", result.data?.id);
    console.log("Full result:", result);
  } catch (error) {
    console.error("❌ Error sending email:");
    console.error("Error message:", error.message);
    console.error("Error name:", error.name);
    console.error("Full error:", error);
  }
}

testResend();
