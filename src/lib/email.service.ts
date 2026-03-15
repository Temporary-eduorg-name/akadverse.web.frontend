import { Resend } from "resend";
import { getAppBaseUrl } from "@/lib/app-url";

const resend = new Resend(process.env.RESEND_SECRET_KEY);
const APP_BASE_URL = getAppBaseUrl();

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ 
  to, 
  subject, 
  html,
  from = "Student Marketplace <onboarding@resend.dev>"
}: EmailData) {
  try {
    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (response.error) {
      console.error("Email send error:", response.error);
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Email service error:", error);
    return { success: false, error };
  }
}

export async function sendOfferAcceptedEmail(
  skillOwnerEmail: string,
  skillOwnerName: string,
  buyerName: string,
  skillName: string,
  acceptedPrice: number
) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Offer Accepted! 🎉</h2>
      <p>Hi ${skillOwnerName},</p>
      <p><strong>${buyerName}</strong> has accepted your offer for <strong>${skillName}</strong>!</p>
      <p><strong>Agreed Price:</strong> ₦${acceptedPrice.toLocaleString("en-US")}</p>
      <p>You can now proceed with the service delivery. Check your dashboard for more details.</p>
      <a href="${APP_BASE_URL}/dashboard/skills" 
         style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
        View Dashboard
      </a>
    </div>
  `;

  return sendEmail({
    to: skillOwnerEmail,
    subject: `Offer Accepted for ${skillName}`,
    html,
  });
}

export async function sendOfferRejectedEmail(
  skillOwnerEmail: string,
  skillOwnerName: string,
  buyerName: string,
  skillName: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Offer Rejected</h2>
      <p>Hi ${skillOwnerName},</p>
      <p><strong>${buyerName}</strong> has rejected your offer for <strong>${skillName}</strong>.</p>
      <p>You can create a new offer or reach out to them directly to discuss further.</p>
      <a href="${APP_BASE_URL}/my_skills" 
         style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
        My Skills
      </a>
    </div>
  `;

  return sendEmail({
    to: skillOwnerEmail,
    subject: `Offer Rejected for ${skillName}`,
    html,
  });
}

export async function sendOfferNegotiatedEmail(
  skillOwnerEmail: string,
  skillOwnerName: string,
  buyerName: string,
  skillName: string,
  counterPrice: number
) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Counter Offer Received 💬</h2>
      <p>Hi ${skillOwnerName},</p>
      <p><strong>${buyerName}</strong> has sent a counter offer for <strong>${skillName}</strong>!</p>
      <p><strong>Counter Price:</strong> ₦${counterPrice.toLocaleString("en-US")}</p>
      <p>You can review and accept or reject this counter offer from your dashboard.</p>
      <a href="${APP_BASE_URL}/dashboard/skills" 
         style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
        View Offer
      </a>
    </div>
  `;

  return sendEmail({
    to: skillOwnerEmail,
    subject: `Counter Offer for ${skillName}`,
    html,
  });
}

export async function sendOfferCompletedEmail(
  buyerEmail: string,
  buyerName: string,
  skillOwnerName: string,
  skillName: string,
  finalPrice: number
) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Order Completed ✓</h2>
      <p>Hi ${buyerName},</p>
      <p>Your offer for <strong>${skillName}</strong> from <strong>${skillOwnerName}</strong> has been completed!</p>
      <p><strong>Final Amount Paid:</strong> ₦${finalPrice.toLocaleString("en-US")}</p>
      <p>Thank you for using our platform. Leave a review to help other users find great skills.</p>
      <a href="${APP_BASE_URL}/activity/offers" 
         style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
        View Transaction
      </a>
    </div>
  `;

  return sendEmail({
    to: buyerEmail,
    subject: `Order Completed for ${skillName}`,
    html,
  });
}

export async function sendOfferToBuyerEmail(
  buyerEmail: string,
  buyerName: string,
  skillOwnerName: string,
  skillName: string,
  offerPrice: number
) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>New Offer Received 📬</h2>
      <p>Hi ${buyerName},</p>
      <p><strong>${skillOwnerName}</strong> has accepted your offer for <strong>${skillName}</strong>!</p>
      <p><strong>Offer Price:</strong> ₦${offerPrice.toLocaleString("en-US")}</p>
      <p>You can now proceed with payment or continue negotiating. Check your dashboard for details.</p>
      <a href="${APP_BASE_URL}/activity/offers" 
         style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
        View Offers
      </a>
    </div>
  `;

  return sendEmail({
    to: buyerEmail,
    subject: `Offer Response from ${skillOwnerName}`,
    html,
  });
}

export async function sendOfferRejectedByBuyerEmail(
  skillOwnerEmail: string,
  skillOwnerName: string,
  buyerName: string,
  skillName: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Offer Rejected</h2>
      <p>Hi ${skillOwnerName},</p>
      <p><strong>${buyerName}</strong> has rejected your offer for <strong>${skillName}</strong>.</p>
      <p>You can create a new offer or reach out to them directly to discuss further.</p>
      <a href="${APP_BASE_URL}/my_skills" 
         style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
        My Skills
      </a>
    </div>
  `;

  return sendEmail({
    to: skillOwnerEmail,
    subject: `Offer Rejected for ${skillName}`,
    html,
  });
}

export async function sendCounterOfferFromBuyerEmail(
  skillOwnerEmail: string,
  skillOwnerName: string,
  buyerName: string,
  skillName: string,
  counterPrice: number
) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Counter Offer Received 💬</h2>
      <p>Hi ${skillOwnerName},</p>
      <p><strong>${buyerName}</strong> has sent a counter offer for <strong>${skillName}</strong>!</p>
      <p><strong>Counter Price:</strong> ₦${counterPrice.toLocaleString("en-US")}</p>
      <p>You can review and accept or reject this counter offer from your dashboard.</p>
      <a href="${APP_BASE_URL}/dashboard/skills" 
         style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
        View Offer
      </a>
    </div>
  `;

  return sendEmail({
    to: skillOwnerEmail,
    subject: `Counter Offer for ${skillName}`,
    html,
  });
}

export async function sendSkillOfferCompletionOtpEmail(
  buyerEmail: string,
  buyerName: string,
  skillName: string,
  otp: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2>Service Completion OTP</h2>
      <p>Hi ${buyerName},</p>
      <p>Your skill provider requested the completion OTP for <strong>${skillName}</strong>.</p>
      <p>Share this OTP only after the service has been delivered as agreed.</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0; text-align: center;">
        <p style="font-size: 30px; letter-spacing: 6px; font-weight: 700; margin: 0; color: #2563eb;">${otp}</p>
      </div>
      <p style="font-size: 13px; color: #666;">This OTP expires in 24 hours.</p>
    </div>
  `;

  return sendEmail({
    to: buyerEmail,
    subject: `Completion OTP for ${skillName}`,
    html,
  });
}

export async function sendNewOfferToSkillOwnerEmail(
  skillOwnerEmail: string,
  skillOwnerName: string,
  buyerName: string,
  skillName: string,
  offerPrice: number,
  description: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2>New Offer Received 📬</h2>
      <p>Hi ${skillOwnerName},</p>
      <p><strong>${buyerName}</strong> has made an offer for your skill <strong>${skillName}</strong>!</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Offered Price:</strong> ₦${offerPrice.toLocaleString("en-US")}</p>
        <p style="margin: 0;"><strong>Description:</strong> ${description || "No description provided"}</p>
      </div>
      <p>You can accept, negotiate, or reject this offer from your dashboard.</p>
      <a href="${APP_BASE_URL}/dashboard/skills" 
         style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
        View Offer
      </a>
    </div>
  `;

  return sendEmail({
    to: skillOwnerEmail,
    subject: `New Offer for ${skillName}`,
    html,
  });
}

export async function sendOfferAcceptedToBuyerEmail(
  buyerEmail: string,
  buyerName: string,
  skillOwnerName: string,
  skillName: string,
  acceptedPrice: number,
  skillOwnerLinks: {
    mostActiveSocial?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
    website?: string | null;
  }
) {
  const getSocialIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      instagram: '📷',
      linkedin: '💼',
      twitter: '🐦',
      website: '🌐'
    };
    return icons[platform] || '🔗';
  };

  const linksHtml = [];
  const mostActive = skillOwnerLinks.mostActiveSocial;
  
  if (skillOwnerLinks.instagram) {
    const label = mostActive === 'instagram' ? `${getSocialIcon('instagram')} Instagram (Most Active)` : `${getSocialIcon('instagram')} Instagram`;
    linksHtml.push(`<a href="${skillOwnerLinks.instagram}" style="color: #3b82f6; text-decoration: none; display: block; margin: 8px 0; ${mostActive === 'instagram' ? 'font-weight: bold; color: #2563eb;' : ''}">${label}</a>`);
  }
  if (skillOwnerLinks.linkedin) {
    const label = mostActive === 'linkedin' ? `${getSocialIcon('linkedin')} LinkedIn (Most Active)` : `${getSocialIcon('linkedin')} LinkedIn`;
    linksHtml.push(`<a href="${skillOwnerLinks.linkedin}" style="color: #3b82f6; text-decoration: none; display: block; margin: 8px 0; ${mostActive === 'linkedin' ? 'font-weight: bold; color: #2563eb;' : ''}">${label}</a>`);
  }
  if (skillOwnerLinks.twitter) {
    const label = mostActive === 'twitter' ? `${getSocialIcon('twitter')} Twitter (Most Active)` : `${getSocialIcon('twitter')} Twitter`;
    linksHtml.push(`<a href="${skillOwnerLinks.twitter}" style="color: #3b82f6; text-decoration: none; display: block; margin: 8px 0; ${mostActive === 'twitter' ? 'font-weight: bold; color: #2563eb;' : ''}">${label}</a>`);
  }
  if (skillOwnerLinks.website) {
    const label = mostActive === 'website' ? `${getSocialIcon('website')} Website (Most Active)` : `${getSocialIcon('website')} Website`;
    linksHtml.push(`<a href="${skillOwnerLinks.website}" style="color: #3b82f6; text-decoration: none; display: block; margin: 8px 0; ${mostActive === 'website' ? 'font-weight: bold; color: #2563eb;' : ''}">${label}</a>`);
  }

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2>Offer Accepted! 🎉</h2>
      <p>Hi ${buyerName},</p>
      <p><strong>${skillOwnerName}</strong> has accepted your offer for <strong>${skillName}</strong>!</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0;"><strong>Agreed Price:</strong> ₦${acceptedPrice.toLocaleString("en-US")}</p>
      </div>
      ${linksHtml.length > 0 ? `
        <div style="background: #e0f2fe; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #3b82f6;">
          <p style="margin: 0 0 12px 0; font-weight: bold;">Contact ${skillOwnerName}:</p>
          ${linksHtml.join('')}
        </div>
      ` : ''}
      <p>You can now communicate with ${skillOwnerName} to coordinate the service delivery.</p>
      <a href="${APP_BASE_URL}/activity/offers" 
         style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
        View Offer
      </a>
    </div>
  `;

  return sendEmail({
    to: buyerEmail,
    subject: `Offer Accepted for ${skillName}`,
    html,
  });
}

export async function sendNegotiationFromSkillOwnerToBuyerEmail(
  buyerEmail: string,
  buyerName: string,
  skillOwnerName: string,
  skillName: string,
  counterPrice: number,
  reason?: string | null
) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2>Counter Offer Received 💬</h2>
      <p>Hi ${buyerName},</p>
      <p><strong>${skillOwnerName}</strong> has sent a counter offer for <strong>${skillName}</strong>!</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Counter Price:</strong> ₦${counterPrice.toLocaleString("en-US")}</p>
        ${reason ? `<p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
      </div>
      <p>You can accept, counter, or reject this offer from your activity page.</p>
      <a href="${APP_BASE_URL}/activity/offers" 
         style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
        View Offer
      </a>
    </div>
  `;

  return sendEmail({
    to: buyerEmail,
    subject: `Counter Offer for ${skillName}`,
    html,
  });
}

export async function sendNegotiationFromBuyerToSkillOwnerEmail(
  skillOwnerEmail: string,
  skillOwnerName: string,
  buyerName: string,
  skillName: string,
  counterPrice: number,
  reason?: string | null
) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2>New Counter Offer 💬</h2>
      <p>Hi ${skillOwnerName},</p>
      <p><strong>${buyerName}</strong> has sent a counter offer for <strong>${skillName}</strong>!</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Counter Price:</strong> ₦${counterPrice.toLocaleString("en-US")}</p>
        ${reason ? `<p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
      </div>
      <p>You can accept, counter, or reject this offer from your dashboard.</p>
      <a href="${APP_BASE_URL}/dashboard/skills" 
         style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
        View Offer
      </a>
    </div>
  `;

  return sendEmail({
    to: skillOwnerEmail,
    subject: `Counter Offer for ${skillName}`,
    html,
  });
}

