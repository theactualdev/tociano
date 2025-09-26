import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Debug: Check if API key is loaded
    console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
    console.log("RESEND_API_KEY length:", process.env.RESEND_API_KEY?.length);

    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Send email using Resend
    console.log("Attempting to send admin notification email...");
    const adminEmailResult = await resend.emails.send({
      from: "Tociano Boutique <onboarding@resend.dev>", // Using verified Resend domain
      to: ["olayinkacodes@gmail.com"], // Your boutique's email
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">Contact Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #555;">Message:</h3>
            <p style="line-height: 1.6; color: #333;">${message.replace(
              /\n/g,
              "<br>"
            )}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #e0f2fe; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #0369a1;">
              <strong>Note:</strong> Please respond to this inquiry within 24 hours for the best customer experience.
            </p>
          </div>
        </div>
      `,
      // Also send a plain text version
      text: `
        New Contact Form Submission
        
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        
        Message:
        ${message}
      `,
    });

    console.log("Admin email result:", adminEmailResult);

    // Send confirmation email to the customer
    console.log("Attempting to send customer confirmation email...");
    const customerEmailResult = await resend.emails.send({
      from: "Tociano Boutique <tociano@theactualdev.live>", // You'll need to update this with your domain
      to: [email],
      subject: "Thank you for contacting Tociano Boutique",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
            Thank You for Contacting Us!
          </h2>
          
          <p>Dear ${name},</p>
          
          <p>Thank you for reaching out to Tociano Boutique. We have received your message and will get back to you within 24 hours.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">Your Message Summary:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message.substring(0, 150)}${
        message.length > 150 ? "..." : ""
      }</p>
          </div>
          
          <p>In the meantime, feel free to:</p>
          <ul>
            <li>Browse our <a href="${
              process.env.NEXT_PUBLIC_BASE_URL || "https://tociano.vercel.app"
            }/products" style="color: #0369a1;">latest collections</a></li>
            <li>Follow us on <a href="https://www.instagram.com/tociano.boutique/" style="color: #0369a1;">Instagram</a> for style inspiration</li>
            <li>Visit our showroom at 66, Isolo Road, Ile-Iwe Bus-stop, Lagos</li>
          </ul>
          
          <div style="margin-top: 30px; padding: 20px; background: #1f2937; color: white; border-radius: 8px; text-align: center;">
            <h3 style="margin-top: 0;">Tociano Boutique</h3>
            <p style="margin: 5px 0;">Premium Nigerian Fashion</p>
            <p style="margin: 5px 0;">📍 66, Isolo Road, Ile-Iwe Bus-stop, Lagos</p>
            <p style="margin: 5px 0;">📞 +234 808 983 9640</p>
            <p style="margin-bottom: 0;">✉️ olayinkacodes@gmail.com</p>
          </div>
        </div>
      `,
      text: `
        Thank You for Contacting Tociano Boutique!
        
        Dear ${name},
        
        Thank you for reaching out to us. We have received your message about "${subject}" and will get back to you within 24 hours.
        
        Best regards,
        Tociano Boutique Team
        
        Contact Info:
        66, Isolo Road, Ile-Iwe Bus-stop, Lagos
        +234 808 983 9640
        olayinkacodes@gmail.com
      `,
    });

    console.log("Customer email result:", customerEmailResult);

    return NextResponse.json(
      {
        message: "Email sent successfully",
        adminEmailId: adminEmailResult.data?.id,
        customerEmailId: customerEmailResult.data?.id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
