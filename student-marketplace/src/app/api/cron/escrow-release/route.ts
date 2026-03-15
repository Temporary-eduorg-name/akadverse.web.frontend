import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { escrowReleasedEmail, sendEmail } from "@/utils/email";

export const runtime = "nodejs";

type PaystackResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

type PaystackBank = {
  name: string;
  code: string;
};

type PaystackTransferRecipient = {
  recipient_code: string;
};

type PaystackTransfer = {
  reference: string;
  transfer_code: string;
  status: string;
};

async function getPaystackBankCode(paystackKey: string, bankName: string) {
  const response = await fetch("https://api.paystack.co/bank", {
    headers: {
      Authorization: `Bearer ${paystackKey}`,
      "Content-Type": "application/json",
    },
  });

  const result = (await response.json()) as PaystackResponse<PaystackBank[]>;
  if (!response.ok || !result.status) {
    throw new Error(result.message || "Failed to fetch bank list from Paystack");
  }

  const bank = result.data.find(
    (entry) => entry.name.toLowerCase() === bankName.toLowerCase()
  );

  if (!bank) {
    throw new Error(`Bank not found on Paystack: ${bankName}`);
  }

  return bank.code;
}

async function createTransferRecipient(
  paystackKey: string,
  accountNumber: string,
  bankCode: string,
  accountHolderName: string
) {
  const response = await fetch("https://api.paystack.co/transferrecipient", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "nuban",
      name: accountHolderName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
    }),
  });

  const result = (await response.json()) as PaystackResponse<PaystackTransferRecipient>;

  if (!response.ok || !result.status || !result.data?.recipient_code) {
    throw new Error(result.message || "Failed to create Paystack transfer recipient");
  }

  return result.data.recipient_code;
}

async function initiateTransfer(
  paystackKey: string,
  recipientCode: string,
  amountInNaira: number,
  reason: string,
  reference: string
) {
  if (process.env.NODE_ENV === "development") {
    return {
      reference,
      transfer_code: `dev_transfer_${Date.now()}`,
      status: "success",
    } satisfies PaystackTransfer;
  }

  const response = await fetch("https://api.paystack.co/transfer", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: "balance",
      amount: Math.round(amountInNaira * 100),
      recipient: recipientCode,
      reason,
      reference,
    }),
  });

  const result = (await response.json()) as PaystackResponse<PaystackTransfer>;

  if (!response.ok || !result.status || !result.data?.reference) {
    throw new Error(result.message || "Failed to initiate Paystack transfer");
  }

  return result.data;
}

export async function POST(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const headerSecret = req.headers.get("x-cron-secret");

    if (!cronSecret || headerSecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paystackKey =
      process.env.PAYSTACK_TEST_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY;

    if (!paystackKey) {
      return NextResponse.json(
        { error: "Paystack secret key not configured" },
        { status: 500 }
      );
    }

    const now = new Date();

    const dueOrders = await prisma.order.findMany({
      where: {
        status: { in: ["delivered", "completed"] },
        escrowReleased: false,
        escrowReleaseAt: {
          lte: now,
        },
        isDisputed: false,
        paymentStatus: {
          in: ["success", "verified"],
        },
      },
      include: {
        business: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        escrowReleaseAt: "asc",
      },
    });

    const groupedByBusiness = dueOrders.reduce((acc, order) => {
      if (!acc.has(order.businessId)) {
        acc.set(order.businessId, [] as typeof dueOrders);
      }
      acc.get(order.businessId)?.push(order);
      return acc;
    }, new Map<string, typeof dueOrders>());

    let releasedBusinesses = 0;
    let releasedOrders = 0;
    const failures: Array<{ businessId: string; reason: string }> = [];

    for (const [businessId, businessOrders] of groupedByBusiness.entries()) {
      const business = businessOrders[0]?.business;
      if (!business) {
        failures.push({ businessId, reason: "Missing business record" });
        continue;
      }

      if (!business.bankName || !business.accountNumber || !business.accountHolderName) {
        await prisma.order.updateMany({
          where: { id: { in: businessOrders.map((order) => order.id) } },
          data: {
            escrowReleaseStatus: "failed",
            escrowFailureReason: "Missing business bank details",
          },
        });

        failures.push({ businessId, reason: "Missing business bank details" });
        continue;
      }

      const totalAmount = businessOrders.reduce((sum, order) => sum + order.totalAmount, 0);

      try {
        const bankCode = await getPaystackBankCode(paystackKey, business.bankName);

        let recipientCode = business.paystackRecipientCode;
        if (!recipientCode) {
          recipientCode = await createTransferRecipient(
            paystackKey,
            business.accountNumber,
            bankCode,
            business.accountHolderName
          );

          await prisma.business.update({
            where: { id: businessId },
            data: {
              paystackRecipientCode: recipientCode,
            },
          });
        }

        const payoutReference = `escrow-${businessId}-${Date.now()}`;
        const transfer = await initiateTransfer(
          paystackKey,
          recipientCode,
          totalAmount,
          `Escrow release for ${businessOrders.length} delivered orders`,
          payoutReference
        );

        await prisma.order.updateMany({
          where: { id: { in: businessOrders.map((order) => order.id) } },
          data: {
            escrowReleased: true,
            escrowReleasedAt: new Date(),
            escrowReleaseStatus: "released",
            escrowTransferReference: transfer.reference,
            escrowTransferCode: transfer.transfer_code,
            escrowFailureReason: null,
          },
        });

        await prisma.notification.create({
          data: {
            userId: business.user.id,
            type: "escrow_release",
            message: `₦${totalAmount.toFixed(2)} escrow payment released for ${businessOrders.length} delivered order(s).`,
            businessId,
            link: "/dashboard",
          },
        });

        const sellerName = `${business.user.firstName || ""} ${business.user.lastName || ""}`.trim() || business.name;
        const payoutEmail = escrowReleasedEmail(
          sellerName,
          business.name,
          totalAmount,
          businessOrders.length,
          transfer.reference
        );
        payoutEmail.to = business.user.email;
        await sendEmail(payoutEmail);

        releasedBusinesses += 1;
        releasedOrders += businessOrders.length;
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown payout error";

        await prisma.order.updateMany({
          where: { id: { in: businessOrders.map((order) => order.id) } },
          data: {
            escrowReleaseStatus: "failed",
            escrowFailureReason: reason,
          },
        });

        failures.push({ businessId, reason });
      }
    }

    return NextResponse.json({
      message: "Escrow release cron completed",
      totalDueOrders: dueOrders.length,
      releasedBusinesses,
      releasedOrders,
      failedBusinesses: failures.length,
      failures,
    });
  } catch (error) {
    console.error("Escrow release cron error:", error);
    return NextResponse.json(
      { error: "Failed to process escrow releases" },
      { status: 500 }
    );
  }
}
