// Email notification templates and utilities using Resend
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_SECRET_KEY);

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Resend
 * @param emailData - Email details
 */
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: "Student Marketplace <onboarding@resend.dev>", // Change to your verified domain
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    if (error) {
      console.error("Resend error:", error);
      return false;
    }

    console.log("✅ Email sent successfully:", data);
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

/**
 * Email template: Order Processing
 */
export function orderProcessingEmail(
  buyerName: string,
  orderId: string,
  businessName: string
): EmailData {
  return {
    to: "", // Will be filled by caller
    subject: "Your Order is Being Processed",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Order Confirmed!</h2>
        <p>Hi ${buyerName},</p>
        <p>Great news! Your order <strong>#${orderId}</strong> from <strong>${businessName}</strong> is now being processed.</p>
        <p>You'll receive another email once your order is shipped.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">Thank you for shopping with us!</p>
      </div>
    `,
    text: `Hi ${buyerName}, your order #${orderId} from ${businessName} is being processed.`,
  };
}

/**
 * Email template: Order Declined
 */
export function orderDeclinedEmail(
  buyerName: string,
  orderId: string,
  businessName: string
): EmailData {
  return {
    to: "",
    subject: "Order Update - Unable to Process",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Order Update</h2>
        <p>Hi ${buyerName},</p>
        <p>Unfortunately, we're unable to process your order <strong>#${orderId}</strong> from <strong>${businessName}</strong> at this time.</p>
        <p>If you have any questions, please contact the seller directly.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">We apologize for any inconvenience.</p>
      </div>
    `,
    text: `Hi ${buyerName}, unfortunately your order #${orderId} from ${businessName} cannot be processed.`,
  };
}

/**
 * Email template: Order Shipped with OTP
 */
export function orderShippedEmail(
  buyerName: string,
  orderId: string,
  businessName: string,
  deliveryAddress: string,
  deliveryOtp: string
): EmailData {
  return {
    to: "",
    subject: "Your Order Has Been Shipped!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Order Shipped!</h2>
        <p>Hi ${buyerName},</p>
        <p>Your order <strong>#${orderId}</strong> from <strong>${businessName}</strong> is on its way!</p>
        <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111;">Your Delivery OTP</h3>
          <p style="font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 4px; margin: 10px 0;">
            ${deliveryOtp}
          </p>
          <p style="color: #666; font-size: 14px; margin-bottom: 0;">
            Share this OTP with the delivery person to confirm receipt. Valid for 24 hours.
          </p>
        </div>
        
        <p>Once you receive your package, click "Confirm Delivery" and provide this OTP to complete the order.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">Thank you for your order!</p>
      </div>
    `,
    text: `Your order #${orderId} has been shipped! Your delivery OTP is: ${deliveryOtp}. Share this with the delivery person.`,
  };
}

/**
 * Email template: Shipping OTP for Seller
 */
export function shippingOTPEmail(
  sellerName: string,
  orderId: string,
  shipOtp: string
): EmailData {
  return {
    to: "",
    subject: "Shipping Confirmation OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Ready to Ship Order #${orderId}?</h2>
        <p>Hi ${sellerName},</p>
        <p>To confirm that order <strong>#${orderId}</strong> is ready for shipment, please enter this OTP:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 6px; margin: 0;">
            ${shipOtp}
          </p>
        </div>
        
        <p style="color: #666; font-size: 14px;">This OTP is valid for 24 hours.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
    text: `Your shipping OTP for order #${orderId} is: ${shipOtp}. Valid for 24 hours.`,
  };
}

/**
 * Email template: Delivery Reminder for Seller
 */
export function deliveryReminderEmail(
  sellerName: string,
  orderId: string,
  businessName: string
): EmailData {
  return {
    to: "",
    subject: `Delivery Reminder - Order #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Delivery Reminder</h2>
        <p>Hi ${sellerName},</p>
        <p>This is a friendly reminder that order <strong>#${orderId}</strong> from <strong>${businessName}</strong> is expected to be delivered today.</p>
        <p>Please ensure the order is prepared and ready for delivery.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">Thank you for your prompt service!</p>
      </div>
    `,
    text: `Reminder: Order #${orderId} is scheduled for delivery today. Please prepare for shipment.`,
  };
}

/**
 * Email template: New Order notification for Seller
 */
export function newOrderEmail(
  sellerName: string,
  orderId: string,
  buyerName: string,
  totalAmount: number,
  deliveryDate: Date | null
): EmailData {
  const deliveryInfo = deliveryDate 
    ? `<p style="margin: 5px 0;"><strong>Expected Delivery:</strong> ${deliveryDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>`
    : '';

  return {
    to: "",
    subject: `New Order Received - #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">New Order Received!</h2>
        <p>Hi ${sellerName},</p>
        <p>You have received a new order <strong>#${orderId}</strong>.</p>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${buyerName}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₦${totalAmount.toFixed(2)}</p>
          ${deliveryInfo}
        </div>
        
        <p>Please log in to your dashboard to accept or decline this order.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">Thank you for using our platform!</p>
      </div>
    `,
    text: `New order #${orderId} from ${buyerName}. Amount: ₦${totalAmount}. ${deliveryDate ? `Expected Delivery: ${deliveryDate.toLocaleDateString()}` : ''}`,
  };
}

/**
 * Email template: Order Delivered Confirmation
 */
export function orderDeliveredEmail(
  buyerName: string,
  orderId: string,
  businessName: string
): EmailData {
  return {
    to: "",
    subject: "Order Delivered Successfully",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Order Delivered!</h2>
        <p>Hi ${buyerName},</p>
        <p>Your order <strong>#${orderId}</strong> from <strong>${businessName}</strong> has been successfully delivered.</p>
        <p>You have 24 hours to dispute this transaction if there are any issues with your order.</p>
        <p>We hope you enjoy your purchase!</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">Thank you for shopping with us!</p>
      </div>
    `,
    text: `Your order #${orderId} from ${businessName} has been delivered. You have 24 hours to dispute if needed.`,
  };
}

/**
 * Email template: Escrow released to seller
 */
export function escrowReleasedEmail(
  sellerName: string,
  businessName: string,
  totalAmount: number,
  orderCount: number,
  transferReference: string
): EmailData {
  return {
    to: "",
    subject: "Escrow Released Successfully",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Escrow Payment Released ✅</h2>
        <p>Hi ${sellerName},</p>
        <p>Your escrow funds have been released to <strong>${businessName}</strong>.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Total Released:</strong> ₦${totalAmount.toFixed(2)}</p>
          <p style="margin: 5px 0;"><strong>Orders Settled:</strong> ${orderCount}</p>
          <p style="margin: 5px 0;"><strong>Transfer Reference:</strong> ${transferReference}</p>
        </div>
        <p>You can check your bank account and dashboard for full details.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">Thank you for using Student Marketplace.</p>
      </div>
    `,
    text: `Escrow released: ₦${totalAmount.toFixed(2)} for ${orderCount} order(s). Transfer reference: ${transferReference}.`,
  };
}
